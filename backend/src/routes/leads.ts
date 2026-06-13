import { Router } from 'express';
import type { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import type { AuthenticatedRequest } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { transporter } from '../services/email';
import { LeadStatus } from '@prisma/client';

const router = Router();

// Zod validation schemas
const createLeadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(5, 'Phone number must be at least 5 characters'),
  scoreId: z.string().uuid().optional(),
  slot: z.preprocess(
    (arg) => {
      if (typeof arg === 'string' && arg.trim() !== '') {
        const date = new Date(arg);
        return isNaN(date.getTime()) ? undefined : date;
      }
      if (arg instanceof Date) return arg;
      return undefined;
    },
    z.date().optional()
  ),
});

const getLeadsQuerySchema = z.object({
  status: z.nativeEnum(LeadStatus).optional(),
  page: z.preprocess((val) => Number(val || 1), z.number().int().positive()).default(1),
  limit: z.preprocess((val) => Number(val || 10), z.number().int().positive()).default(10),
});

const updateLeadStatusSchema = z.object({
  status: z.nativeEnum(LeadStatus),
  notes: z.string().optional(),
});

// 1. POST /api/leads
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const validated = createLeadSchema.parse(req.body);
    const userId = req.user!.id;

    // Create lead record
    const lead = await prisma.lead.create({
      data: {
        userId,
        name: validated.name,
        phone: validated.phone,
        scoreId: validated.scoreId || null,
        slot: validated.slot || null,
      },
    });

    // Send confirmation email via Nodemailer
    try {
      const email = req.user!.email;
      if (email) {
        const mailOptions = {
          from: `"FinAnalysis" <${process.env.GMAIL_USER}>`,
          to: email,
          subject: 'Your advisory call is booked',
          text: `Hi ${validated.name}, we'll contact you at ${validated.phone}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
              <h2 style="color: #0F172A; text-align: center;">FinAnalysis</h2>
              <p style="font-size: 16px; color: #334155;">Hi <strong>${validated.name}</strong>,</p>
              <p style="font-size: 16px; color: #334155;">Your advisory call has been successfully booked. Our team will contact you shortly at <strong>${validated.phone}</strong>.</p>
              ${validated.slot ? `<p style="font-size: 16px; color: #334155;">Scheduled Slot: <strong>${validated.slot.toLocaleString()}</strong></p>` : ''}
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 12px; color: #64748B; text-align: center;">Thank you for choosing FinAnalysis.</p>
            </div>
          `,
        };
        await transporter.sendMail(mailOptions);
      }
    } catch (emailErr) {
      console.error('Failed to send advisory booking confirmation email:', emailErr);
    }

    res.status(201).json({
      success: true,
      data: { leadId: lead.id },
    });
  } catch (error) {
    next(error);
  }
});

// 2. GET /api/leads (admin only)
router.get('/', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { status, page, limit } = getLeadsQuerySchema.parse(req.query);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.lead.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        leads,
        total,
        page,
      },
    });
  } catch (error) {
    next(error);
  }
});

// 3. PUT /api/leads/:id/status (admin only)
router.put('/:id/status', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { id } = z.object({ id: z.string().uuid('Invalid lead ID format') }).parse(req.params);
    const { status, notes } = updateLeadStatusSchema.parse(req.body);

    const existingLead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!existingLead) {
      res.status(404).json({
        success: false,
        error: 'Lead not found',
      });
      return;
    }

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        status,
        notes: notes !== undefined ? notes : existingLead.notes,
      },
    });

    // Award 10 points if transitioned to CONVERTED (booking completion)
    if (existingLead.status !== 'CONVERTED' && status === 'CONVERTED') {
      await prisma.user.update({
        where: { id: existingLead.userId },
        data: {
          finPoints: {
            increment: 10,
          },
        },
      });
    }

    res.json({
      success: true,
      data: updatedLead,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
