import { Router } from 'express';
import type { Response } from 'express';
import { z } from 'zod';
import multer from 'multer';
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import type { AuthenticatedRequest } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { Role, Prisma, LeadStatus } from '@prisma/client';

const router = Router();

// Setup Multer memory storage with file type validation
const ALLOWED_MIMETYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  'text/csv',
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for bulk CSV
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel (.xlsx/.xls) and CSV files are accepted'));
    }
  },
});

function parseExcelNumber(val: unknown): number | null {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const clean = val.replace(/,/g, '').trim();
    if (clean === '') return null;
    const num = parseFloat(clean);
    return isNaN(num) ? null : num;
  }
  return null;
}

function parseAvgHoldingDays(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  const str = String(val).toLowerCase().trim();
  if (str === '') return null;

  // Case 1: Match "X years Y months" or "X yr Y mo"
  const yrMoRegex = /(\d+(?:\.\d+)?)\s*(?:years?|yrs?|y)s?,?\s*(\d+(?:\.\d+)?)\s*(?:months?|mos?|m)s?/;
  const yrMoMatch = str.match(yrMoRegex);
  if (yrMoMatch) {
    const yrs = parseFloat(yrMoMatch[1]);
    const mos = parseFloat(yrMoMatch[2]);
    return Math.round((yrs * 365) + (mos * 30.417));
  }

  // Case 2: Match "Y months"
  const moRegex = /(\d+(?:\.\d+)?)\s*(?:months?|mos?|m)s?/;
  if (str.includes('month') || str.includes('mo')) {
    const moMatch = str.match(moRegex);
    if (moMatch) {
      const mos = parseFloat(moMatch[1]);
      return Math.round(mos * 30.417);
    }
  }

  // Case 3: Match "X years" or "X yr"
  const yrRegex = /(\d+(?:\.\d+)?)\s*(?:years?|yrs?|y)s?/;
  if (str.includes('year') || str.includes('yr')) {
    const yrMatch = str.match(yrRegex);
    if (yrMatch) {
      const yrs = parseFloat(yrMatch[1]);
      return Math.round(yrs * 365);
    }
  }

  // Case 4: Plain number or contains "days"
  const clean = str.replace(/days?/g, '').replace(/,/g, '').trim();
  const num = parseFloat(clean);
  if (isNaN(num)) return null;

  // If the parsed number is small (<= 15), assume it represents years and convert to days
  if (num <= 15) {
    return Math.round(num * 365);
  }
  return num;
}


// Apply auth and admin middleware to all routes in this router
router.use(authMiddleware);
router.use(adminMiddleware);

// 1. GET /api/admin/stats
router.get('/stats', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const [totalUsers, totalClients, totalLeads, attendedLeads, totalFolios, totalExistingClients, totalPortfolioValuations, existingClients] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: Role.CLIENT } }),
      prisma.lead.count(),
      prisma.lead.count({ where: { status: { in: [LeadStatus.CONTACTED, LeadStatus.CONVERTED] } } }),
      prisma.folio.count(),
      prisma.existingClient.count(),
      prisma.existingClient.count({
        where: {
          OR: [
            { balanceUnits: { not: null } },
            { purchaseValue: { not: null } },
            { currentValue: { not: null } },
          ]
        }
      }),
      prisma.existingClient.findMany({
        select: {
          aum: true,
          currentValue: true,
        }
      }),
    ]);

    const totalAUM = existingClients.reduce((sum: number, client: any) => {
      const val = client.currentValue !== null && client.currentValue !== undefined 
        ? client.currentValue 
        : (client.aum !== null && client.aum !== undefined ? client.aum : 0);
      return sum + val;
    }, 0);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalClients,
        pendingPayments: 0,
        totalLeads,
        attendedLeads,
        totalFolios,
        totalExistingClients,
        totalPortfolioValuations,
        totalAUM,
      },
    });
  } catch (error) {
    next(error);
  }
});

// 2. GET /api/admin/users
router.get('/users', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        pan: true,
        role: true,
        dob: true,
        anniversary: true,
        createdAt: true,
        assessments: {
          orderBy: { createdAt: 'desc' },
        },
        portfolios: {
          include: {
            score: true,
            rows: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        leads: {
          orderBy: { createdAt: 'desc' },
        },
        client: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
});

// 3. POST /api/admin/users/:id/role
const updateRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

router.post('/users/:id/role', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { id } = z.object({ id: z.string().uuid('Invalid user ID format') }).parse(req.params);
    const { role } = updateRoleSchema.parse(req.body);

    // Prevent admin from modifying their own role
    if (id === req.user!.id) {
      res.status(400).json({
        success: false,
        error: 'You cannot modify your own role.',
      });
      return;
    }

    const userExists = await prisma.user.findUnique({
      where: { id },
    });

    if (!userExists) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data: { role },
      });

      if (role === Role.CLIENT) {
        // Upsert client profile
        await tx.client.upsert({
          where: { userId: id },
          update: {
            activatedAt: new Date(),
          },
          create: {
            userId: id,
            activatedAt: new Date(),
            advisorNotes: 'Manually promoted to Client by Admin',
            activePlan: 'PREMIUM',
          },
        });
      } else if (role === Role.GUEST) {
        // Remove client profile if role downgraded to guest
        const clientProfile = await tx.client.findUnique({
          where: { userId: id },
        });
        if (clientProfile) {
          await tx.client.delete({
            where: { userId: id },
          });
        }
      }

      return user;
    });

    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
});

// 4. POST /api/admin/users/:id/client-profile
const updateClientProfileSchema = z.object({
  advisorNotes: z.string().optional(),
  activePlan: z.string().optional(),
  pan: z.string()
    .optional()
    .transform((val) => val ? val.trim().toUpperCase() : undefined)
    .refine((val) => val === undefined || val === '' || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val), {
      message: 'Invalid PAN format. Must be 10 characters (e.g. ABCDE1234F) or empty to clear.',
    }),
});

router.post('/users/:id/client-profile', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { id } = z.object({ id: z.string().uuid('Invalid user ID format') }).parse(req.params);
    const { advisorNotes, activePlan, pan } = updateClientProfileSchema.parse(req.body);

    const userExists = await prisma.user.findUnique({
      where: { id },
    });

    if (!userExists) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    if (pan !== undefined) {
      await prisma.user.update({
        where: { id },
        data: { pan: pan === '' ? null : pan }
      });
    }

    const clientProfile = await prisma.client.upsert({
      where: { userId: id },
      update: {
        advisorNotes,
        activePlan,
      },
      create: {
        userId: id,
        advisorNotes: advisorNotes || '',
        activePlan: activePlan || 'PREMIUM',
        activatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: clientProfile,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        res.status(400).json({
          success: false,
          error: 'This PAN number is already assigned to another user account.',
        });
        return;
      }
    }
    next(error);
  }
});

// 5. POST /api/admin/folios/upload
router.post('/folios/upload', upload.single('file'), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ success: false, error: 'CSV/Excel file is required' });
      return;
    }

    let workbook: XLSX.WorkBook;
    try {
      workbook = XLSX.read(file.buffer, { type: 'buffer' });
    } catch {
      res.status(400).json({ success: false, error: 'Invalid file format. Please upload a valid CSV or Excel file.' });
      return;
    }

    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      res.status(400).json({ success: false, error: 'File sheet is empty' });
      return;
    }

    const worksheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet!, { defval: "" });

    if (rawRows.length === 0) {
      res.status(400).json({ success: false, error: 'File contains no data rows' });
      return;
    }

    // Validate if at least key headers are present
    const firstRowKeys = Object.keys(rawRows[0] || {});
    const requiredKeys = ['Client Name', 'Folio Number', 'Scheme Name'];
    const missingKeys = requiredKeys.filter(key => !firstRowKeys.includes(key));
    if (missingKeys.length > 0) {
      res.status(400).json({
        success: false,
        error: `Missing required CSV headers: ${missingKeys.join(', ')}`
      });
      return;
    }

    // Parse all rows
    const parsedFolios = rawRows.map(row => ({
      clientName: String(row["Client Name"] || '').trim() || null,
      clientPan: String(row["Client PAN"] || '').trim() || null,
      clientAadhaar: String(row["Client Aadhaar"] || '').trim() || null,
      nameAsPerFolio: String(row["Name as per Folio"] || '').trim() || null,
      panAsPerFolio: String(row["PAN as per Folio"] || '').trim() || null,
      folioNumber: String(row["Folio Number"] || '').trim() || null,
      schemeName: String(row["Scheme Name"] || '').trim() || null,
      units: parseExcelNumber(row["Units"]),
      aum: parseExcelNumber(row["AUM"]),
      purchaseValue: parseExcelNumber(row["Purchase Value"] || row["Invested Amount"] || row["Purchase Amount"] || row["Invested Value"] || row["Invested"]),
      email: String(row["Email"] || '').trim() || null,
      mobile: String(row["Mobile"] || '').trim() || null,
      dob: String(row["Date of Birth"] || '').trim() || null,
      holding: String(row["Holding"] || '').trim() || null,
      taxStatus: String(row["Tax Status"] || '').trim() || null,
      comments: String(row["Comments"] || '').trim() || null,
      freezeDate: String(row["Freeze Date"] || '').trim() || null,
      address1: String(row["Address 1"] || '').trim() || null,
      address2: String(row["Address 2"] || '').trim() || null,
      address3: String(row["Address 3"] || '').trim() || null,
      bankName: String(row["Bank Name"] || '').trim() || null,
      bankAddress: String(row["Bank Address"] || '').trim() || null,
      accountNumber: String(row["Account Number"] || '').trim() || null,
      ifscCode: String(row["IFSC Code"] || '').trim() || null,
      accountType: String(row["Account Type"] || '').trim() || null,
      jointHolder1Name: String(row["Joint Holder 1 Name"] || '').trim() || null,
      jointHolder1Pan: String(row["Joint Holder 1 PAN"] || '').trim() || null,
      jointHolder1Kyc: String(row["Joint Holder 1 KYC"] || '').trim() || null,
      jointHolder1Aadhaar: String(row["Joint Holder 1 Aadhaar"] || '').trim() || null,
      jointHolder2Name: String(row["Joint Holder 2 Name"] || '').trim() || null,
      jointHolder2Pan: String(row["Joint Holder 2 PAN"] || '').trim() || null,
      jointHolder2Kyc: String(row["Joint Holder 2 KYC"] || '').trim() || null,
      jointHolder2Aadhaar: String(row["Joint Holder 2 Aadhaar"] || '').trim() || null,
      guardianName: String(row["Guardian Name"] || '').trim() || null,
      guardianPan: String(row["Guardian PAN"] || '').trim() || null,
      guardianKyc: String(row["Guardian KYC"] || '').trim() || null,
      guardianAadhaar: String(row["Guardian Aadhaar"] || '').trim() || null,
      nomineeOpted: String(row["Nominee Opted"] || '').trim() || null,
      nominee1Name: String(row["Nominee 1 Name"] || '').trim() || null,
      nominee1Relation: String(row["Nominee 1 Relation"] || '').trim() || null,
      nominee1Percentage: String(row["Nominee 1 Percentage"] || '').trim() || null,
      nominee2Name: String(row["Nominee 2 Name"] || '').trim() || null,
      nominee2Relation: String(row["Nominee 2 Relation"] || '').trim() || null,
      nominee2Percentage: String(row["Nominee 2 Percentage"] || '').trim() || null,
      nominee3Name: String(row["Nominee 3 Name"] || '').trim() || null,
      nominee3Relation: String(row["Nominee 3 Relation"] || '').trim() || null,
      nominee3Percentage: String(row["Nominee 3 Percentage"] || '').trim() || null,
      ftFolio: String(row["FT Folio"] || '').trim() || null,
      folioType: String(row["Folio Type"] || '').trim() || null,
      clientDematId: String(row["Client Demat ID"] || '').trim() || null,
      dpId: String(row["DP ID"] || '').trim() || null,
      appCode: String(row["App Code"] || '').trim() || null,
      equityCode: String(row["Equity Code"] || '').trim() || null,
      familyHead: String(row["Family Head"] || '').trim() || null,
      iwellCode: String(row["IWELL Code"] || '').trim() || null,
      iwellCode2: String(row["IWELL Code 2"] || '').trim() || null,
      nomineeDetails: String(row["Nominee Details"] || '').trim() || null,
      nomineeDetails2: String(row["Nominee Details 2"] || '').trim() || null,
      nomineeDetails3: String(row["Nominee Details 3"] || '').trim() || null,
      operations: String(row["Operations"] || '').trim() || null,
      operationsCode: String(row["Operations Code"] || '').trim() || null,
      relationshipManager: String(row["Relationship Manager"] || '').trim() || null,
      relationshipManager2: String(row["Relationship Manager 2"] || '').trim() || null,
      subBroker: String(row["Sub Broker"] || '').trim() || null,
      subBrokerCode: String(row["Sub Broker Code"] || '').trim() || null,
      lastUsedArn: String(row["Last Used ARN"] || '').trim() || null,
    }));

    // Save using a transaction with matching and linking to existing clients
    const count = await prisma.$transaction(async (tx) => {
      // 1. Clean existing folio database before import
      await tx.folio.deleteMany({});

      // 2. Fetch all existing clients for matching
      const clients = await tx.existingClient.findMany({});
      const clientByPan = new Map<string, any>();
      const clientByName = new Map<string, any>();
      for (const c of clients) {
        if (c.pan) {
          clientByPan.set(c.pan.trim().toUpperCase(), c);
        }
        if (c.name) {
          clientByName.set(c.name.trim().toLowerCase(), c);
        }
      }

      let insertedCount = 0;
      for (const row of parsedFolios) {
        let match = null;
        if (row.clientPan) {
          match = clientByPan.get(row.clientPan.trim().toUpperCase());
        }
        if (!match && row.panAsPerFolio) {
          match = clientByPan.get(row.panAsPerFolio.trim().toUpperCase());
        }
        if (!match && row.clientName) {
          match = clientByName.get(row.clientName.trim().toLowerCase());
        }
        if (!match && row.nameAsPerFolio) {
          match = clientByName.get(row.nameAsPerFolio.trim().toLowerCase());
        }

        let existingClientId = null;
        if (match) {
          existingClientId = match.id;
        } else {
          // Create new client first
          const newClient = await tx.existingClient.create({
            data: {
              name: row.clientName || row.nameAsPerFolio,
              pan: row.clientPan ? row.clientPan.trim().toUpperCase() : (row.panAsPerFolio ? row.panAsPerFolio.trim().toUpperCase() : null),
              email: row.email,
              mobile: row.mobile,
              dob: row.dob,
              address1: row.address1,
              address2: row.address2,
              address3: row.address3,
              aadhaar: row.clientAadhaar,
              nominee1Name: row.nominee1Name,
              nominee1Relation: row.nominee1Relation,
              nominee1Percentage: row.nominee1Percentage,
              nominee2Name: row.nominee2Name,
              nominee2Relation: row.nominee2Relation,
              nominee2Percentage: row.nominee2Percentage,
              nominee3Name: row.nominee3Name,
              nominee3Relation: row.nominee3Relation,
              nominee3Percentage: row.nominee3Percentage,
              appCode: row.appCode,
              iwellCode: row.iwellCode,
              iwellCode2: row.iwellCode2,
              familyHead: row.familyHead,
              dpId: row.dpId,
              aum: row.aum,
            }
          });

          existingClientId = newClient.id;

          // Put into maps so subsequent records match this client
          if (newClient.pan) {
            clientByPan.set(newClient.pan.trim().toUpperCase(), newClient);
          }
          if (newClient.name) {
            clientByName.set(newClient.name.trim().toLowerCase(), newClient);
          }
        }

        // Create Folio record linked to client
        await tx.folio.create({
          data: {
            ...row,
            existingClientId,
          } as any
        });
        insertedCount++;
      }
      return insertedCount;
    }, {
      timeout: 60000 // 60 seconds timeout for larger transactions
    });

    res.status(201).json({
      success: true,
      message: `Successfully imported ${count} folio records.`,
      data: { count },
    });
  } catch (error) {
    next(error);
  }
});

// 6. GET /api/admin/folios
router.get('/folios', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '50', 10);
    const search = (req.query.search as string || '').trim();

    const skip = (page - 1) * limit;

    const where: Prisma.FolioWhereInput = search ? {
      OR: [
        { clientName: { contains: search, mode: 'insensitive' } },
        { clientPan: { contains: search, mode: 'insensitive' } },
        { folioNumber: { contains: search, mode: 'insensitive' } },
        { schemeName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search, mode: 'insensitive' } },
      ]
    } : {};

    const [folios, total] = await Promise.all([
      prisma.folio.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.folio.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        folios,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// 7. DELETE /api/admin/folios/clear
router.delete('/folios/clear', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const result = await prisma.folio.deleteMany({});
    res.json({
      success: true,
      message: `Successfully cleared all ${result.count} folio records.`,
      data: { count: result.count }
    });
  } catch (error) {
    next(error);
  }
});

// 8. POST /api/admin/existing-clients/upload
router.post('/existing-clients/upload', upload.single('file'), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ success: false, error: 'CSV/Excel file is required' });
      return;
    }

    let workbook: XLSX.WorkBook;
    try {
      workbook = XLSX.read(file.buffer, { type: 'buffer' });
    } catch {
      res.status(400).json({ success: false, error: 'Invalid file format. Please upload a valid CSV or Excel file.' });
      return;
    }

    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      res.status(400).json({ success: false, error: 'File sheet is empty' });
      return;
    }

    const worksheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet!, { defval: "" });

    if (rawRows.length === 0) {
      res.status(400).json({ success: false, error: 'File contains no data rows' });
      return;
    }

    // Validate if at least key headers are present
    const firstRowKeys = Object.keys(rawRows[0] || {});
    const requiredKeys = ['Name', 'PAN'];
    const missingKeys = requiredKeys.filter(key => !firstRowKeys.includes(key));
    if (missingKeys.length > 0) {
      res.status(400).json({
        success: false,
        error: `Missing required CSV headers: ${missingKeys.join(', ')}`
      });
      return;
    }

    // Parse all rows
    const parsedClients = rawRows.map(row => ({
      title: String(row["Title (Mr./Mrs./Ms.)"] || row["Title"] || '').trim() || null,
      name: String(row["Name"] || '').trim() || null,
      pan: String(row["PAN"] || '').trim() || null,
      appCode: String(row["App Code"] || '').trim() || null,
      email: String(row["Email"] || '').trim() || null,
      disableEmail: String(row["Disable Email"] || '').trim() || null,
      secondaryEmail: String(row["Secondary Email"] || '').trim() || null,
      iwellCode: String(row["IWELL Code"] || '').trim() || null,
      username: String(row["Username"] || '').trim() || null,
      mobile: String(row["Mobile"] || '').trim() || null,
      landline: String(row["Landline"] || '').trim() || null,
      dob: String(row["Date of Birth"] || '').trim() || null,
      birthdayWish: String(row["Birthday Wish"] || '').trim() || null,
      anniversary: String(row["Anniversary"] || '').trim() || null,
      dateOfDeath: String(row["Date of Death"] || '').trim() || null,
      familyHead: String(row["Family Head"] || '').trim() || null,
      familyHeadIwellCode: String(row["Family Head IWELL Code"] || '').trim() || null,
      referredBy: String(row["Referred By"] || '').trim() || null,
      iwellCode2: String(row["IWELL Code 2"] || '').trim() || null,
      familyHeadIwellCode2: String(row["Family Head IWELL Code 2"] || '').trim() || null,
      address1: String(row["Address 1"] || '').trim() || null,
      address2: String(row["Address 2"] || '').trim() || null,
      address3: String(row["Address 3"] || '').trim() || null,
      city: String(row["City"] || '').trim() || null,
      state: String(row["State"] || '').trim() || null,
      country: String(row["Country"] || '').trim() || null,
      pinCode: String(row["PIN Code"] || '').trim() || null,
      clientRating: String(row["Client Rating"] || '').trim() || null,
      firstInvestmentDate: String(row["First Investment Date"] || '').trim() || null,
      reviewFrequency: String(row["Review Frequency"] || '').trim() || null,
      lastReviewDate: String(row["Last Review Date"] || '').trim() || null,
      modelName: String(row["Model Name"] || '').trim() || null,
      fileNumber: String(row["File Number"] || '').trim() || null,
      tags: String(row["Tags"] || '').trim() || null,
      updateLog: String(row["Update Log"] || '').trim() || null,
      equityCode1: String(row["Equity Code 1"] || '').trim() || null,
      equityCode2: String(row["Equity Code 2"] || '').trim() || null,
      depository: String(row["Depository"] || '').trim() || null,
      dpName: String(row["DP Name"] || '').trim() || null,
      dpId: String(row["DP ID"] || '').trim() || null,
      npsAccountNumber: String(row["NPS Account Number"] || '').trim() || null,
      annualIncome: String(row["Annual Income"] || '').trim() || null,
      profession: String(row["Profession"] || '').trim() || null,
      billState: String(row["Bill State"] || '').trim() || null,
      billGstin: String(row["Bill GSTIN"] || '').trim() || null,
      aum: parseExcelNumber(row["AUM"]),
      targetSipAmount: parseExcelNumber(row["Target SIP Amount"]),
      targetElssAmount: parseExcelNumber(row["Target ELSS Amount"]),
      targetEquityAllocation: parseExcelNumber(row["Target Equity Allocation (%)"]),
      targetDebtAllocation: parseExcelNumber(row["Target Debt Allocation (%)"]),
      preferredBillingMode: String(row["Preferred Billing Mode"] || '').trim() || null,
      equityMfBilling: parseExcelNumber(row["Equity MF Billing (%)"]),
      debtMfBilling: parseExcelNumber(row["Debt MF Billing (%)"]),
      sharesBilling: parseExcelNumber(row["Shares Billing (%)"]),
      bondsBilling: parseExcelNumber(row["Bonds Billing (%)"]),
      fixedDepositBilling: parseExcelNumber(row["Fixed Deposit Billing (%)"]),
      otherAssetBilling: parseExcelNumber(row["Other Asset Billing (%)"]),
      remarks: String(row["Remarks"] || '').trim() || null,
      bankDetails: String(row["Bank Details"] || '').trim() || null,
      overseasAddress1: String(row["Overseas Address 1"] || '').trim() || null,
      overseasAddress2: String(row["Overseas Address 2"] || '').trim() || null,
      overseasAddress3: String(row["Overseas Address 3"] || '').trim() || null,
      overseasCity: String(row["Overseas City"] || '').trim() || null,
      overseasState: String(row["Overseas State"] || '').trim() || null,
      overseasCountry: String(row["Overseas Country"] || '').trim() || null,
      overseasPin: String(row["Overseas PIN"] || '').trim() || null,
      overseasPhone: String(row["Overseas Phone"] || '').trim() || null,
      overseasMobile: String(row["Overseas Mobile"] || '').trim() || null,
      kycStatus: String(row["KYC Status"] || '').trim() || null,
      aadhaar: String(row["Aadhaar"] || '').trim() || null,
      nominee1Name: String(row["Nominee 1 Name"] || '').trim() || null,
      nominee1Relation: String(row["Nominee 1 Relation"] || '').trim() || null,
      nominee1Dob: String(row["Nominee 1 DOB"] || '').trim() || null,
      nominee1Percentage: String(row["Nominee 1 Percentage"] || '').trim() || null,
      nominee2Name: String(row["Nominee 2 Name"] || '').trim() || null,
      nominee2Relation: String(row["Nominee 2 Relation"] || '').trim() || null,
      nominee2Dob: String(row["Nominee 2 DOB"] || '').trim() || null,
      nominee2Percentage: String(row["Nominee 2 Percentage"] || '').trim() || null,
      nominee3Name: String(row["Nominee 3 Name"] || '').trim() || null,
      nominee3Relation: String(row["Nominee 3 Relation"] || '').trim() || null,
      nominee3Dob: String(row["Nominee 3 DOB"] || '').trim() || null,
      nominee3Percentage: String(row["Nominee 3 Percentage"] || '').trim() || null,
    }));

    // Save using a transaction with chunking to prevent PostgreSQL parameter limits
    const count = await prisma.$transaction(async (tx) => {
      // Clean existing client database before import
      await tx.existingClient.deleteMany({});

      let insertedCount = 0;
      const chunkSize = 500;
      for (let i = 0; i < parsedClients.length; i += chunkSize) {
        const chunk = parsedClients.slice(i, i + chunkSize);
        const result = await tx.existingClient.createMany({
          data: chunk,
        });
        insertedCount += result.count;
      }
      return insertedCount;
    });

    res.status(201).json({
      success: true,
      message: `Successfully imported ${count} existing client records.`,
      data: { count },
    });
  } catch (error) {
    next(error);
  }
});

// 9. GET /api/admin/existing-clients
router.get('/existing-clients', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '50', 10);
    const search = (req.query.search as string || '').trim();

    const skip = (page - 1) * limit;

    const where: Prisma.ExistingClientWhereInput = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { pan: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search, mode: 'insensitive' } },
        { iwellCode: { contains: search, mode: 'insensitive' } },
        { appCode: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ]
    } : {};

    const [clients, total] = await Promise.all([
      prisma.existingClient.findMany({
        where,
        include: { folios: true } as any,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.existingClient.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        clients,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// 10. DELETE /api/admin/existing-clients/clear
router.delete('/existing-clients/clear', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const result = await prisma.existingClient.deleteMany({});
    res.json({
      success: true,
      message: `Successfully cleared all ${result.count} existing client records.`,
      data: { count: result.count }
    });
  } catch (error) {
    next(error);
  }
});

// 11. POST /api/admin/portfolio-valuations/upload
router.post('/portfolio-valuations/upload', upload.single('file'), async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ success: false, error: 'CSV/Excel file is required' });
      return;
    }

    let workbook: XLSX.WorkBook;
    try {
      workbook = XLSX.read(file.buffer, { type: 'buffer' });
    } catch {
      res.status(400).json({ success: false, error: 'Invalid file format. Please upload a valid CSV or Excel file.' });
      return;
    }

    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      res.status(400).json({ success: false, error: 'File sheet is empty' });
      return;
    }

    const worksheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet!, { defval: "" });

    if (rawRows.length === 0) {
      res.status(400).json({ success: false, error: 'File contains no data rows' });
      return;
    }

    // Validate if key headers are present
    const firstRowKeys = Object.keys(rawRows[0] || {});
    const requiredKeys = ['Client Name', 'PAN Number'];
    const missingKeys = requiredKeys.filter(key => !firstRowKeys.includes(key));
    if (missingKeys.length > 0) {
      res.status(400).json({
        success: false,
        error: `Missing required CSV headers: ${missingKeys.join(', ')}`
      });
      return;
    }

    // Parse all rows
    const parsedValuations = rawRows.map(row => ({
      clientName: String(row["Client Name"] || '').trim() || null,
      iwellCode: String(row["IWELL Code"] || '').trim() || null,
      iwellCode2: String(row["IWELL Code 2"] || '').trim() || null,
      pan: String(row["PAN Number"] || '').trim() || null,
      balanceUnits: parseExcelNumber(row["Balance Units"]),
      purchaseValue: parseExcelNumber(row["Purchase Value"]),
      currentValue: parseExcelNumber(row["Current Value"]),
      oneDayChange: parseExcelNumber(row["One-Day Change"]),
      dividend: parseExcelNumber(row["Dividend"]),
      averageHoldingDays: parseAvgHoldingDays(row["Average Holding Days"]),
      gain: parseExcelNumber(row["Gain"]),
      absoluteReturn: parseExcelNumber(row["Absolute Return (%)"]),
      cagr: parseExcelNumber(row["CAGR (%)"]),
      xirr: parseExcelNumber(row["XIRR (%)"] || row["XIRR"] || row["xirr"]),
    }));

    // Save using a transaction with chunking to prevent PostgreSQL parameter limits
    const count = await prisma.$transaction(async (tx) => {
      // 1. Reset valuation fields for all existing clients first
      await tx.existingClient.updateMany({
        data: {
          balanceUnits: null,
          purchaseValue: null,
          currentValue: null,
          oneDayChange: null,
          dividend: null,
          averageHoldingDays: null,
          gain: null,
          absoluteReturn: null,
          cagr: null,
          xirr: null,
        }
      });

      // 2. Fetch all existing clients for matching
      const clients = await tx.existingClient.findMany({});
      const clientByPan = new Map<string, any>();
      const clientByName = new Map<string, any>();
      for (const c of clients) {
        if (c.pan) {
          clientByPan.set(c.pan.trim().toUpperCase(), c);
        }
        if (c.name) {
          clientByName.set(c.name.trim().toLowerCase(), c);
        }
      }

      let updatedCount = 0;
      for (const row of parsedValuations) {
        let match = null;
        if (row.pan) {
          match = clientByPan.get(row.pan.trim().toUpperCase());
        }
        if (!match && row.clientName) {
          match = clientByName.get(row.clientName.trim().toLowerCase());
        }

        if (match) {
          await tx.existingClient.update({
            where: { id: match.id },
            data: {
              balanceUnits: row.balanceUnits,
              purchaseValue: row.purchaseValue,
              currentValue: row.currentValue,
              oneDayChange: row.oneDayChange,
              dividend: row.dividend,
              averageHoldingDays: row.averageHoldingDays,
              gain: row.gain,
              absoluteReturn: row.absoluteReturn,
              cagr: row.cagr,
              xirr: row.xirr,
              iwellCode: row.iwellCode || match.iwellCode,
              iwellCode2: row.iwellCode2 || match.iwellCode2,
            }
          });
          updatedCount++;
        } else {
          // Create a new client record
          await tx.existingClient.create({
            data: {
              name: row.clientName,
              pan: row.pan ? row.pan.trim().toUpperCase() : null,
              iwellCode: row.iwellCode,
              iwellCode2: row.iwellCode2,
              balanceUnits: row.balanceUnits,
              purchaseValue: row.purchaseValue,
              currentValue: row.currentValue,
              oneDayChange: row.oneDayChange,
              dividend: row.dividend,
              averageHoldingDays: row.averageHoldingDays,
              gain: row.gain,
              absoluteReturn: row.absoluteReturn,
              cagr: row.cagr,
              xirr: row.xirr,
            }
          });
          updatedCount++;
        }
      }
      return updatedCount;
    });

    res.status(201).json({
      success: true,
      message: `Successfully processed ${count} portfolio valuation records.`,
      data: { count },
    });
  } catch (error) {
    next(error);
  }
});

// 12. GET /api/admin/portfolio-valuations
router.get('/portfolio-valuations', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '50', 10);
    const search = (req.query.search as string || '').trim();

    const skip = (page - 1) * limit;

    const where: Prisma.ExistingClientWhereInput = {
      OR: [
        { balanceUnits: { not: null } },
        { purchaseValue: { not: null } },
        { currentValue: { not: null } },
      ],
      ...(search ? {
        AND: [
          {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { pan: { contains: search, mode: 'insensitive' } },
              { iwellCode: { contains: search, mode: 'insensitive' } },
              { iwellCode2: { contains: search, mode: 'insensitive' } },
            ]
          }
        ]
      } : {})
    };

    const [clients, total] = await Promise.all([
      prisma.existingClient.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.existingClient.count({ where }),
    ]);

    const valuations = clients.map(c => ({
      id: c.id,
      clientName: c.name,
      iwellCode: c.iwellCode,
      iwellCode2: c.iwellCode2,
      pan: c.pan,
      balanceUnits: c.balanceUnits,
      purchaseValue: c.purchaseValue,
      currentValue: c.currentValue,
      oneDayChange: c.oneDayChange,
      dividend: c.dividend,
      averageHoldingDays: c.averageHoldingDays,
      gain: c.gain,
      absoluteReturn: c.absoluteReturn,
      cagr: c.cagr,
      xirr: c.xirr,
      createdAt: c.createdAt,
    }));

    res.json({
      success: true,
      data: {
        valuations,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// 13. DELETE /api/admin/portfolio-valuations/clear
router.delete('/portfolio-valuations/clear', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const result = await prisma.existingClient.updateMany({
      data: {
        balanceUnits: null,
        purchaseValue: null,
        currentValue: null,
        oneDayChange: null,
        dividend: null,
        averageHoldingDays: null,
        gain: null,
        absoluteReturn: null,
        cagr: null,
        xirr: null,
      }
    });
    res.json({
      success: true,
      message: `Successfully cleared valuation fields for all ${result.count} client records.`,
      data: { count: result.count }
    });
  } catch (error) {
    next(error);
  }
});

// 14. GET /api/admin/contact-messages
router.get('/contact-messages', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
});

// 15. GET /api/admin/availability
router.get('/availability', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const AVAILABILITY_FILE = path.join(__dirname, '../../uploads/availability.json');
    let slots: string[] = [];
    if (fs.existsSync(AVAILABILITY_FILE)) {
      const fileContent = fs.readFileSync(AVAILABILITY_FILE, 'utf-8');
      slots = JSON.parse(fileContent) || [];
    }
    res.json({
      success: true,
      data: slots,
    });
  } catch (error) {
    next(error);
  }
});

// 16. POST /api/admin/availability
router.post('/availability', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { slots } = z.object({ slots: z.array(z.string()) }).parse(req.body);
    const UPLOAD_DIR = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    const AVAILABILITY_FILE = path.join(UPLOAD_DIR, 'availability.json');
    fs.writeFileSync(AVAILABILITY_FILE, JSON.stringify(slots, null, 2), 'utf-8');
    res.json({
      success: true,
      data: slots,
    });
  } catch (error) {
    next(error);
  }
});

// 17. GET /api/admin/aum-distribution
router.get('/aum-distribution', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const groups = await prisma.folio.groupBy({
      by: ['schemeName'],
      _sum: {
        aum: true,
      },
    });

    const schemes = groups
      .map(g => {
        const schemeName = (g.schemeName || '').trim();
        const amount = g._sum.aum || 0;
        return {
          schemeName,
          amount,
        };
      })
      .filter(s => s.schemeName !== '' && s.amount > 0);

    // Sort descending by amount
    schemes.sort((a, b) => b.amount - a.amount);

    const totalAUM = schemes.reduce((sum, s) => sum + s.amount, 0);

    const schemesWithPercentage = schemes.map(s => ({
      ...s,
      percentage: totalAUM > 0 ? (s.amount / totalAUM) * 100 : 0,
    }));

    res.json({
      success: true,
      data: {
        totalAUM,
        schemes: schemesWithPercentage,
      },
    });
  } catch (error) {
    next(error);
  }
});

// 18. GET /api/admin/queries
router.get('/queries', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const queries = await prisma.supportQuery.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: queries,
    });
  } catch (error) {
    next(error);
  }
});

// 19. PATCH /api/admin/queries/:id
router.patch('/queries/:id', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { id } = z.object({ id: z.string().uuid('Invalid query ID format') }).parse(req.params);
    const bodySchema = z.object({
      status: z.enum(['PENDING', 'RESOLVED']),
    });
    const parsedBody = bodySchema.parse(req.body);

    const query = await prisma.supportQuery.update({
      where: { id },
      data: {
        status: parsedBody.status,
      },
    });

    res.json({
      success: true,
      message: `Query status updated to ${parsedBody.status}`,
      data: query,
    });
  } catch (error) {
    next(error);
  }
});

export default router;



