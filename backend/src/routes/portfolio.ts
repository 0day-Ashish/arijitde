import { Router } from 'express';
import type { Response } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import type { AuthenticatedRequest } from '../middleware/auth';
import { UploadType, FundType } from '@prisma/client';

const router = Router();

// Setup Multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Zod schema for a single portfolio row (for manual upload validation)
const portfolioRowSchema = z.object({
  fundName: z.string().min(1, 'Fund Name is required'),
  type: z.nativeEnum(FundType),
  startDate: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
    return arg;
  }, z.date().refine((date) => date.getTime() <= Date.now(), {
    message: 'Start Date cannot be in the future',
  })),
  sipAmount: z.number().nonnegative('Monthly SIP Amount must be positive or zero'),
  invested: z.number().positive('Total Invested must be positive'),
  currentValue: z.number().positive('Current Value must be positive'),
}).refine((data) => {
  if (data.type === FundType.LUMPSUM && data.sipAmount !== 0) {
    return false;
  }
  if (data.type === FundType.SIP && data.sipAmount <= 0) {
    return false;
  }
  return true;
}, {
  message: 'Monthly SIP Amount must be 0 for Lumpsum and greater than 0 for SIP',
  path: ['sipAmount'],
});

const manualUploadSchema = z.object({
  assessmentId: z.string().uuid('Invalid assessment ID format'),
  rows: z.array(portfolioRowSchema).min(1, 'At least 1 row required').max(15, 'Maximum of 15 rows allowed'),
});

// Date parser helper for excel
function parseExcelDate(val: unknown): Date | null {
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }
  if (typeof val === 'number') {
    const dateObj = XLSX.SSF.parse_date_code(val);
    if (!dateObj) return null;
    return new Date(Date.UTC(dateObj.y, dateObj.m - 1, dateObj.d, dateObj.H, dateObj.M, dateObj.S));
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    const parts = trimmed.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0]!, 10);
      const month = parseInt(parts[1]!, 10) - 1;
      const year = parseInt(parts[2]!, 10);
      const date = new Date(year, month, day);
      if (
        !isNaN(date.getTime()) &&
        date.getDate() === day &&
        date.getMonth() === month &&
        date.getFullYear() === year
      ) {
        return date;
      }
    }
    const parsed = new Date(trimmed);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

// Number parser helper for excel
function parseExcelNumber(val: unknown): number | null {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const num = parseFloat(val.trim());
    return isNaN(num) ? null : num;
  }
  return null;
}

// 1. POST /api/portfolio/upload
router.post('/upload', authMiddleware, upload.single('file'), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { assessmentId } = req.body;
    if (!assessmentId) {
      res.status(400).json({ success: false, error: 'assessmentId is required' });
      return;
    }

    const file = req.file;
    if (!file) {
      res.status(400).json({ success: false, error: 'Excel file is required' });
      return;
    }

    // Check assessment existence and ownership
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment || assessment.userId !== req.user!.id) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: You do not own this assessment',
      });
      return;
    }

    // Read and parse Excel file
    let workbook: XLSX.WorkBook;
    try {
      workbook = XLSX.read(file.buffer, { type: 'buffer' });
    } catch {
      res.status(400).json({ success: false, error: 'Invalid file format. Please upload an Excel (.xlsx) file.' });
      return;
    }

    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      res.status(400).json({ success: false, error: 'Excel sheet is empty' });
      return;
    }

    const worksheet = workbook.Sheets[sheetName];
    // Read sheet as a 2D array of raw values to retain column order
    const rawRows = XLSX.utils.sheet_to_json<unknown[]>(worksheet!, { header: 1 });

    if (rawRows.length <= 1) {
      res.status(400).json({ success: false, error: 'Excel sheet must contain a header and at least 1 data row' });
      return;
    }

    // Validate headers size (exactly 6 columns)
    const headerRow = rawRows[0];
    if (!headerRow || headerRow.length < 6) {
      res.status(400).json({ success: false, error: 'Excel sheet must contain exactly 6 columns' });
      return;
    }

    const parsedRows: Array<{
      fundName: string;
      type: FundType;
      startDate: Date;
      sipAmount: number;
      invested: number;
      currentValue: number;
    }> = [];

    // Process data rows
    const dataRows = rawRows.slice(1);
    
    // Check row limit
    if (dataRows.length > 15) {
      res.status(400).json({ success: false, error: 'Maximum of 15 rows allowed per portfolio' });
      return;
    }

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      if (!row) continue;

      // Filter out entirely empty rows
      const isEmpty = row.every((val) => val === undefined || val === null || val === '');
      if (isEmpty) continue;

      // Check column length for row
      if (row.length < 6) {
        res.status(400).json({ success: false, error: `Row ${i + 2} is missing columns. Exactly 6 columns required.` });
        return;
      }

      const fundName = typeof row[0] === 'string' ? row[0].trim() : String(row[0] || '').trim();
      const rawType = typeof row[1] === 'string' ? row[1].trim() : String(row[1] || '').trim();
      const rawStartDate = row[2];
      const rawSipAmount = row[3];
      const rawInvested = row[4];
      const rawCurrentValue = row[5];

      // Validate Fund Name
      if (!fundName) {
        res.status(400).json({ success: false, error: `Row ${i + 2}: Fund Name cannot be empty` });
        return;
      }

      // Validate Investment Type
      let type: FundType;
      if (rawType === 'SIP') {
        type = FundType.SIP;
      } else if (rawType === 'Lumpsum') {
        type = FundType.LUMPSUM;
      } else {
        res.status(400).json({ success: false, error: `Row ${i + 2}: Investment Type must be exactly "SIP" or "Lumpsum"` });
        return;
      }

      // Validate Start Date
      const startDate = parseExcelDate(rawStartDate);
      if (!startDate) {
        res.status(400).json({ success: false, error: `Row ${i + 2}: Start Date must be a valid date` });
        return;
      }
      if (startDate.getTime() > Date.now()) {
        res.status(400).json({ success: false, error: `Row ${i + 2}: Start Date cannot be in the future` });
        return;
      }

      // Validate SIP Amount
      const sipAmount = parseExcelNumber(rawSipAmount);
      if (sipAmount === null || sipAmount < 0) {
        res.status(400).json({ success: false, error: `Row ${i + 2}: Monthly SIP Amount must be a positive number or 0` });
        return;
      }
      if (type === FundType.LUMPSUM && sipAmount !== 0) {
        res.status(400).json({ success: false, error: `Row ${i + 2}: Monthly SIP Amount must be 0 for Lumpsum` });
        return;
      }
      if (type === FundType.SIP && sipAmount <= 0) {
        res.status(400).json({ success: false, error: `Row ${i + 2}: Monthly SIP Amount must be positive for SIP` });
        return;
      }

      // Validate Total Invested
      const invested = parseExcelNumber(rawInvested);
      if (invested === null || invested <= 0) {
        res.status(400).json({ success: false, error: `Row ${i + 2}: Total Invested must be a positive number` });
        return;
      }

      // Validate Current Value
      const currentValue = parseExcelNumber(rawCurrentValue);
      if (currentValue === null || currentValue <= 0) {
        res.status(400).json({ success: false, error: `Row ${i + 2}: Current Value must be a positive number` });
        return;
      }

      parsedRows.push({
        fundName,
        type,
        startDate,
        sipAmount,
        invested,
        currentValue,
      });
    }

    if (parsedRows.length === 0) {
      res.status(400).json({ success: false, error: 'Excel sheet must contain at least 1 valid data row' });
      return;
    }

    // Save using Prisma transaction
    const result = await prisma.$transaction(async (tx) => {
      const portfolio = await tx.portfolio.create({
        data: {
          userId: req.user!.id,
          assessmentId,
          uploadType: UploadType.EXCEL,
        },
      });

      const rowsData = parsedRows.map((r) => ({
        portfolioId: portfolio.id,
        fundName: r.fundName,
        type: r.type,
        startDate: r.startDate,
        sipAmount: r.sipAmount,
        invested: r.invested,
        currentValue: r.currentValue,
      }));

      await tx.portfolioRow.createMany({
        data: rowsData,
      });

      return { portfolioId: portfolio.id, rowCount: rowsData.length };
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// 2. POST /api/portfolio/manual
router.post('/manual', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { assessmentId, rows } = manualUploadSchema.parse(req.body);

    // Check assessment existence and ownership
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment || assessment.userId !== req.user!.id) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: You do not own this assessment',
      });
      return;
    }

    // Save using Prisma transaction
    const result = await prisma.$transaction(async (tx) => {
      const portfolio = await tx.portfolio.create({
        data: {
          userId: req.user!.id,
          assessmentId,
          uploadType: UploadType.MANUAL,
        },
      });

      const rowsData = rows.map((r) => ({
        portfolioId: portfolio.id,
        fundName: r.fundName,
        type: r.type,
        startDate: r.startDate,
        sipAmount: r.sipAmount,
        invested: r.invested,
        currentValue: r.currentValue,
      }));

      await tx.portfolioRow.createMany({
        data: rowsData,
      });

      return { portfolioId: portfolio.id, rowCount: rowsData.length };
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// 3. GET /api/portfolio/:id
const getPortfolioParamsSchema = z.object({
  id: z.string().uuid('Invalid portfolio ID format'),
});

router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { id } = getPortfolioParamsSchema.parse(req.params);

    const portfolio = await prisma.portfolio.findUnique({
      where: { id },
      include: {
        rows: true,
        score: true,
        mlResult: true,
      },
    });

    if (!portfolio) {
      res.status(404).json({
        success: false,
        error: 'Portfolio not found',
      });
      return;
    }

    // Verify ownership
    if (portfolio.userId !== req.user!.id) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: You do not own this portfolio',
      });
      return;
    }

    res.json({
      success: true,
      data: portfolio,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
