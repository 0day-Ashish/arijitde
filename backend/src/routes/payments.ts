import { Router } from 'express';
import type { Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import type { AuthenticatedRequest } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { PaymentStatus, Role, ProductType, WalletTransactionType, SessionStatus } from '@prisma/client';
import { getWalletBalance, addWalletTransaction, canEarnReferralReward } from '../services/wallet';

const router = Router();

// Configure Razorpay client if credentials exist
const isRazorpayConfigured = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
const razorpay = isRazorpayConfigured
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })
  : null;

/**
 * Main function to approve a payment, handle deductions, credit cashback,
 * generate advisory session entries, reward referrers, and elevate roles.
 */
export async function processApprovedPayment(
  paymentId: string,
  razorpayPaymentId?: string,
  razorpaySignature?: string
): Promise<void> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { user: true }
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  if (payment.status !== PaymentStatus.PENDING) {
    return; // Already processed
  }

  const userId = payment.userId;
  const productType = payment.productType;

  // 1. Update payment status to APPROVED
  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: PaymentStatus.APPROVED,
      razorpayPaymentId: razorpayPaymentId || null,
      razorpaySignature: razorpaySignature || null,
    }
  });

  // 2. Process wallet deduction if user redeemed tokens
  if (payment.walletDeduction > 0) {
    await addWalletTransaction(
      userId,
      -payment.walletDeduction,
      WalletTransactionType.REDEMPTION,
      `Redeemed for ${productType === ProductType.AI_ANALYSIS ? 'AI Analysis' : 'Live Session'}`
    );
  }

  // 3. Handle product-specific logic
  if (productType === ProductType.AI_ANALYSIS) {
    // Credit ₹30 cashback to wallet if they made a paid transaction (amount > 0)
    if (payment.amount > 0) {
      await addWalletTransaction(
        userId,
        30,
        WalletTransactionType.CASHBACK,
        'Cashback for paid AI portfolio analysis'
      );
    }
  } else if (productType === ProductType.LIVE_SESSION) {
    // Create Advisory Session request entry with epoch placeholders (user will update slots on next screen)
    const epoch = new Date(0);

    await prisma.advisorySession.create({
      data: {
        userId,
        paymentId,
        preferredSlot1: epoch,
        preferredSlot2: epoch,
        preferredSlot3: epoch,
        status: SessionStatus.PENDING
      }
    });
  }

  // 4. Handle referral bonus: Credited to referrer when friend completes a paid transaction
  // Free trials (amount = 0) do NOT trigger referral reward.
  if (payment.user.referrerId && payment.amount > 0) {
    // Check if this is the user's first paid transaction
    const previousPaidPaymentsCount = await prisma.payment.count({
      where: {
        userId,
        status: PaymentStatus.APPROVED,
        id: { not: paymentId },
        amount: { gt: 0 }
      }
    });

    if (previousPaidPaymentsCount === 0) {
      // Check referrer cap (max ₹500/month)
      const eligible = await canEarnReferralReward(payment.user.referrerId);
      if (eligible) {
        await addWalletTransaction(
          payment.user.referrerId,
          50,
          WalletTransactionType.REFERRAL,
          `Referral reward for inviting ${payment.user.email || 'friend'}`
        );
      }
    }
  }

  // 5. Elevate user role to CLIENT and activate Client profile
  await prisma.user.update({
    where: { id: userId },
    data: { role: Role.CLIENT }
  });

  await prisma.client.upsert({
    where: { userId },
    update: { activatedAt: new Date() },
    create: {
      userId,
      activatedAt: new Date(),
      activePlan: 'PREMIUM',
      advisorNotes: `Automatically activated via payment for ${productType}`
    }
  });
}

// Zod schemas
const checkoutSchema = z.object({
  productType: z.nativeEnum(ProductType),
});

const mockConfirmSchema = z.object({
  razorpayOrderId: z.string().min(1, 'Order ID is required'),
  razorpayPaymentId: z.string().optional(),
});

// 1. GET /api/payments/wallet-balance
router.get('/wallet-balance', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const balance = await getWalletBalance(userId);
    
    // Fetch transaction logs
    const transactions = await prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: {
        balance,
        transactions
      }
    });
  } catch (error) {
    next(error);
  }
});

// 2. POST /api/payments/checkout
router.post('/checkout', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { productType } = checkoutSchema.parse(req.body);
    const user = req.user!;
    const userId = user.id;

    // Calculate account age in days
    const accountAgeInDays = (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const isFirstWeek = accountAgeInDays <= 7;

    // Calculate base price
    let originalPrice = 0;
    if (productType === ProductType.AI_ANALYSIS) {
      originalPrice = isFirstWeek ? 0 : 299;
    } else {
      originalPrice = isFirstWeek ? 300 : 699;
    }

    // Retrieve active wallet balance
    const walletBalance = await getWalletBalance(userId);

    // Apply wallet deduction up to the original price
    const walletDeduction = originalPrice > 0 ? Math.min(walletBalance, originalPrice) : 0;
    const finalPayable = originalPrice - walletDeduction;

    // If final payable is 0 (FREE or fully covered by wallet)
    if (finalPayable === 0) {
      const payment = await prisma.payment.create({
        data: {
          userId,
          amount: 0,
          status: PaymentStatus.PENDING,
          productType,
          walletDeduction,
          utrId: `WALLET-REDEEM-${Date.now()}`
        }
      });

      // Auto-approve since no checkout gateway payment is required
      await processApprovedPayment(payment.id);

      res.status(201).json({
        success: true,
        data: {
          zeroPayable: true,
          paymentId: payment.id,
          message: 'Payment completed successfully using wallet balance or free tier.'
        }
      });
      return;
    }

    // Generate internal transaction record
    const internalPayment = await prisma.payment.create({
      data: {
        userId,
        amount: finalPayable,
        status: PaymentStatus.PENDING,
        productType,
        walletDeduction
      }
    });

    if (isRazorpayConfigured && razorpay) {
      // Create Razorpay order
      const options = {
        amount: Math.round(finalPayable * 100), // Razorpay accepts in paise
        currency: 'INR',
        receipt: `receipt_${internalPayment.id.slice(0, 18)}`,
      };
      
      const order = await razorpay.orders.create(options);

      // Link Razorpay Order ID
      await prisma.payment.update({
        where: { id: internalPayment.id },
        data: { razorpayOrderId: order.id }
      });

      res.status(201).json({
        success: true,
        data: {
          zeroPayable: false,
          orderId: order.id,
          amount: finalPayable,
          keyId: process.env.RAZORPAY_KEY_ID,
          paymentId: internalPayment.id
        }
      });
    } else {
      // Mock mode (when Razorpay credentials are not added)
      const mockOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      await prisma.payment.update({
        where: { id: internalPayment.id },
        data: { razorpayOrderId: mockOrderId }
      });

      res.status(201).json({
        success: true,
        data: {
          zeroPayable: false,
          isMock: true,
          orderId: mockOrderId,
          amount: finalPayable,
          paymentId: internalPayment.id
        }
      });
    }
  } catch (error) {
    next(error);
  }
});

// 3. POST /api/payments/mock-confirm (local dev testing confirmation)
router.post('/mock-confirm', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId } = mockConfirmSchema.parse(req.body);

    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId }
    });

    if (!payment) {
      res.status(404).json({ success: false, error: 'Payment not found with this order ID.' });
      return;
    }

    if (payment.status !== PaymentStatus.PENDING) {
      res.status(400).json({ success: false, error: 'Payment is already processed.' });
      return;
    }

    const mockPaymentId = razorpayPaymentId || `pay_mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    await processApprovedPayment(payment.id, mockPaymentId, 'mock_signature');

    res.json({
      success: true,
      data: { message: 'Mock payment confirmed successfully.' }
    });
  } catch (error) {
    next(error);
  }
});

// 4. POST /api/payments/webhook (Razorpay Webhook)
router.post('/webhook', async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    if (webhookSecret) {
      // Verify signature
      const signature = req.headers['x-razorpay-signature'] as string;
      const shasum = crypto.createHmac('sha256', webhookSecret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest('hex');

      if (digest !== signature) {
        res.status(400).json({ success: false, error: 'Signature verification failed' });
        return;
      }
    }

    // Process event
    const event = req.body.event;
    if (event === 'payment.captured' || event === 'order.paid') {
      const entity = req.body.payload.payment.entity;
      const razorpayOrderId = entity.order_id;
      const razorpayPaymentId = entity.id;
      const signature = req.headers['x-razorpay-signature'] as string || 'webhook_captured';

      const payment = await prisma.payment.findUnique({
        where: { razorpayOrderId }
      });

      if (payment && payment.status === PaymentStatus.PENDING) {
        await processApprovedPayment(payment.id, razorpayPaymentId, signature);
      }
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, error: 'Internal server error processing webhook' });
  }
});

// 5. GET /api/payments/my-payments (view user's own payments)
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

// 6. GET /api/payments (admin only)
router.get('/', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const statusQuery = req.query.status as string;
    const where: any = {};
    if (statusQuery) {
      where.status = statusQuery as PaymentStatus;
    }

    const payments = await prisma.payment.findMany({
      where,
      include: { user: true },
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

// 7. POST /api/payments/:id/approve (manual override, admin only)
router.post('/:id/approve', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const id = req.params.id as string;
    const { action } = z.object({ action: z.enum(['approve', 'reject']) }).parse(req.body);

    const payment = await prisma.payment.findUnique({
      where: { id }
    });

    if (!payment) {
      res.status(404).json({ success: false, error: 'Payment not found.' });
      return;
    }

    if (payment.status !== PaymentStatus.PENDING) {
      res.status(400).json({ success: false, error: 'Payment is already processed.' });
      return;
    }

    if (action === 'approve') {
      await processApprovedPayment(payment.id, `manual_${Date.now()}`);
    } else {
      await prisma.payment.update({
        where: { id },
        data: { status: PaymentStatus.REJECTED }
      });
    }

    res.json({ success: true, message: `Payment manually ${action}d.` });
  } catch (error) {
    next(error);
  }
});

export default router;
