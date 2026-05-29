import { Router } from 'express';
import type { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import type { AuthenticatedRequest } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { Role, PaymentStatus } from '@prisma/client';

const router = Router();

// Apply auth and admin middleware to all routes in this router
router.use(authMiddleware);
router.use(adminMiddleware);

// 1. GET /api/admin/stats
router.get('/stats', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const [totalUsers, totalClients, pendingPayments, totalLeads] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: Role.CLIENT } }),
      prisma.payment.count({ where: { status: PaymentStatus.PENDING } }),
      prisma.lead.count(),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalClients,
        pendingPayments,
        totalLeads,
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
        payments: {
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
  pan: z.string().optional(),
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
        data: { pan: pan.trim() === '' ? null : pan.trim().toUpperCase() }
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
    next(error);
  }
});

export default router;
