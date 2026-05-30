import { Router } from 'express';
import type { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import type { AuthenticatedRequest } from '../middleware/auth';
import { calculateScore } from '../services/scoring';

const router = Router();

const scoreParamsSchema = z.object({
  portfolioId: z.string().uuid('Invalid portfolio ID format'),
});

// 1. POST /api/score/:portfolioId
router.post('/:portfolioId', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { portfolioId } = scoreParamsSchema.parse(req.params);

    // Fetch portfolio, rows, and assessment
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
      include: {
        rows: true,
        assessment: true,
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

    if (portfolio.rows.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Cannot score a portfolio with 0 rows. Please populate your portfolio first.',
      });
      return;
    }

    // Run scoring engine
    const scoreResult = calculateScore(portfolio.rows, portfolio.assessment);

    // Save Score to DB (upsert since portfolioId is unique)
    const score = await prisma.score.upsert({
      where: { portfolioId: portfolio.id },
      update: {
        total: scoreResult.total,
        goalAlignment: scoreResult.goalAlignment,
        assetAlloc: scoreResult.assetAlloc,
        diversification: scoreResult.diversification,
        discipline: scoreResult.discipline,
        efficiency: scoreResult.efficiency,
        tag: scoreResult.tag,
        insights: scoreResult.insights,
      },
      create: {
        portfolioId: portfolio.id,
        total: scoreResult.total,
        goalAlignment: scoreResult.goalAlignment,
        assetAlloc: scoreResult.assetAlloc,
        diversification: scoreResult.diversification,
        discipline: scoreResult.discipline,
        efficiency: scoreResult.efficiency,
        tag: scoreResult.tag,
        insights: scoreResult.insights,
      },
    });

    // Call ML service (POST) with feature vector
    // Wrap in try/catch, ML failure should not block scoring
    try {
      const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8001';
      // Use globalThis.fetch natively available in Node 18+
      fetch(`${mlServiceUrl}/analyse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rows: portfolio.rows.map((r) => ({
            type: r.type,
            sipAmount: r.sipAmount,
            invested: r.invested,
            currentValue: r.currentValue,
            startDate: r.startDate.toISOString(),
          })),
          assessment: {
            age: portfolio.assessment.age,
            goal: portfolio.assessment.goal,
          },
        }),
      })
        .then(async (response) => {
          if (!response.ok) {
            const errText = await response.text();
            console.error(`ML service returned error status ${response.status}: ${errText}`);
            return;
          }
          const result = await response.json();
          console.log('ML service response:', result);

          // Save entry to MLResult table
          await prisma.mLResult.upsert({
            where: { portfolioId: portfolio.id },
            update: {},
            create: {
              portfolioId: portfolio.id,
            },
          });
        })
        .catch((fetchErr) => {
          console.error('Async background fetch to ML service failed:', fetchErr);
        });
    } catch (mlErr) {
      console.error('Failed to dispatch request to ML service:', mlErr);
    }

    res.json({
      success: true,
      data: score,
    });
  } catch (error) {
    next(error);
  }
});

// 2. GET /api/score/:id
const getScoreParamsSchema = z.object({
  id: z.string().uuid('Invalid score ID format'),
});

router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { id } = getScoreParamsSchema.parse(req.params);

    const score = await prisma.score.findUnique({
      where: { id },
      include: {
        portfolio: true,
      },
    });

    if (!score) {
      res.status(404).json({
        success: false,
        error: 'Score not found',
      });
      return;
    }

    // Verify ownership via portfolio
    if (score.portfolio.userId !== req.user!.id) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: You do not own this score',
      });
      return;
    }

    res.json({
      success: true,
      data: score,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
