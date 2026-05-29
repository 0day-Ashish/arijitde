import { Router } from 'express';
import type { Response } from 'express';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import type { AuthenticatedRequest } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { PaymentStatus, Role } from '@prisma/client';

const router = Router();

// Ensure local uploads directory exists
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer storage engine configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const ext = path.extname(file.originalname).toLowerCase();
    const isMimetypeOk = allowedTypes.test(file.mimetype);
    const isExtOk = allowedTypes.test(ext);

    if (isMimetypeOk && isExtOk) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpg, jpeg, png, gif, webp) are allowed'));
    }
  },
});

// Zod schemas
const createPaymentSchema = z.object({
  amount: z.preprocess((val) => Number(val), z.number().positive('Amount must be positive')),
  utrId: z.string().min(1, 'UTR ID is required'),
});

const getPaymentsQuerySchema = z.object({
  status: z.nativeEnum(PaymentStatus).optional(),
  page: z.preprocess((val) => Number(val || 1), z.number().int().positive()).default(1),
  limit: z.preprocess((val) => Number(val || 10), z.number().int().positive()).default(10),
});

const approvePaymentSchema = z.object({
  action: z.enum(['approve', 'reject']),
  reason: z.string().optional(),
});

// 1. POST /api/payments
router.post(
  '/',
  authMiddleware,
  (req, res, next) => {
    upload.single('screenshot')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, error: `Upload error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ success: false, error: err.message });
      }
      next();
    });
  },
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'Screenshot file is required',
        });
        return;
      }

      const validated = createPaymentSchema.parse(req.body);
      const userId = req.user!.id;
      const screenshotUrl = `/uploads/${req.file.filename}`;

      const payment = await prisma.payment.create({
        data: {
          userId,
          amount: validated.amount,
          utrId: validated.utrId,
          screenshotUrl,
          status: PaymentStatus.PENDING,
        },
      });

      res.status(201).json({
        success: true,
        data: { paymentId: payment.id },
      });
    } catch (error) {
      next(error);
    }
  }
);

// 2. GET /api/payments (admin only)
router.get('/', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { status, page, limit } = getPaymentsQuerySchema.parse(req.query);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.payment.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        payments,
        total,
      },
    });
  } catch (error) {
    next(error);
  }
});

// 3. POST /api/payments/:id/approve (admin only)
router.post('/:id/approve', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { id } = z.object({ id: z.string().uuid('Invalid payment ID format') }).parse(req.params);
    const { action, reason } = approvePaymentSchema.parse(req.body);

    const payment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      res.status(404).json({
        success: false,
        error: 'Payment record not found',
      });
      return;
    }

    if (payment.status !== PaymentStatus.PENDING) {
      res.status(400).json({
        success: false,
        error: `Payment is already processed and is currently ${payment.status.toLowerCase()}`,
      });
      return;
    }

    const updatedPayment = await prisma.$transaction(async (tx) => {
      const newStatus = action === 'approve' ? PaymentStatus.APPROVED : PaymentStatus.REJECTED;

      // Update payment status
      const updated = await tx.payment.update({
        where: { id },
        data: {
          status: newStatus,
          approvedBy: req.user!.id,
        },
      });

      if (action === 'approve') {
        // Upsert client activation profile for user
        await tx.client.upsert({
          where: { userId: payment.userId },
          update: {
            activatedAt: new Date(),
            advisorNotes: reason || 'Approved payment activation',
          },
          create: {
            userId: payment.userId,
            activatedAt: new Date(),
            advisorNotes: reason || 'Approved payment activation',
            activePlan: 'PREMIUM',
          },
        });

        // Elevate user role to CLIENT
        await tx.user.update({
          where: { id: payment.userId },
          data: {
            role: Role.CLIENT,
          },
        });
      }

      return updated;
    });

    res.json({
      success: true,
      data: { payment: updatedPayment },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/payments/my-payments
router.get('/my-payments', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
