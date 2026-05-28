import { Router } from 'express';
import type { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import type { AuthenticatedRequest } from '../middleware/auth';
import { Goal } from '@prisma/client';

const router = Router();

// POST /api/assess
const createAssessmentSchema = z.object({
  age: z.number().int().min(0, 'Age must be positive').max(120, 'Age is too high'),
  goal: z.nativeEnum(Goal),
});

router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { age, goal } = createAssessmentSchema.parse(req.body);
    const userId = req.user!.id; // Guaranteed by authMiddleware

    const assessment = await prisma.assessment.create({
      data: {
        userId,
        age,
        goal,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        assessmentId: assessment.id,
        age: assessment.age,
        goal: assessment.goal,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/assess/:id
const getAssessmentParamsSchema = z.object({
  id: z.string().uuid('Invalid assessment ID format'),
});

router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { id } = getAssessmentParamsSchema.parse(req.params);
    const userId = req.user!.id; // Guaranteed by authMiddleware

    const assessment = await prisma.assessment.findUnique({
      where: { id },
    });

    if (!assessment) {
      res.status(404).json({
        success: false,
        error: 'Assessment not found',
      });
      return;
    }

    // Only return if assessment belongs to req.user.id
    if (assessment.userId !== userId) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: You do not own this assessment',
      });
      return;
    }

    res.json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
