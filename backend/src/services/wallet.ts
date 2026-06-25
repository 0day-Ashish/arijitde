import { prisma } from '../lib/prisma';
import { WalletTransactionType } from '@prisma/client';

/**
 * Checks for expired wallet transactions for a user, marks them as expired,
 * and updates the user's cached wallet balance.
 */
export async function processExpiredTokens(userId: string): Promise<number> {
  const now = new Date();

  // Find all unexpired credit transactions that have passed their expiration date
  const expiredCredits = await prisma.walletTransaction.findMany({
    where: {
      userId,
      amount: { gt: 0 },
      isExpired: false,
      expiresAt: { lt: now },
      spent: { lt: prisma.walletTransaction.fields.amount }
    }
  });

  if (expiredCredits.length > 0) {
    await prisma.$transaction(async (tx) => {
      for (const credit of expiredCredits) {
        const unspentAmount = credit.amount - credit.spent;
        if (unspentAmount <= 0) continue;

        // Mark the original credit transaction as expired
        await tx.walletTransaction.update({
          where: { id: credit.id },
          data: { isExpired: true }
        });

        // Create an EXPIRY transaction log (negative amount)
        await tx.walletTransaction.create({
          data: {
            userId,
            amount: -unspentAmount,
            type: WalletTransactionType.EXPIRY,
            isExpired: true,
            description: `Token expiration for transaction ${credit.id}`
          }
        });
      }
    });
  }

  // Calculate the new unexpired balance
  // Balance = sum(amount - spent) for all unexpired active credits (amount > 0, isExpired = false, expiresAt > now)
  const activeCredits = await prisma.walletTransaction.findMany({
    where: {
      userId,
      amount: { gt: 0 },
      isExpired: false,
      expiresAt: { gt: now }
    }
  });

  const newBalance = activeCredits.reduce((sum, tx) => sum + (tx.amount - tx.spent), 0);

  // Update cached balance on User
  await prisma.user.update({
    where: { id: userId },
    data: { walletBalance: newBalance }
  });

  return newBalance;
}

/**
 * Retrieves the user's active wallet balance (after processing expirations).
 */
export async function getWalletBalance(userId: string): Promise<number> {
  return await processExpiredTokens(userId);
}

/**
 * Adds a transaction to the user's wallet.
 * Handles both earnings (amount > 0) and redemptions (amount < 0).
 */
export async function addWalletTransaction(
  userId: string,
  amount: number,
  type: WalletTransactionType,
  description?: string
): Promise<number> {
  const now = new Date();

  // First process any expired tokens to ensure we have a fresh state
  await processExpiredTokens(userId);

  if (amount > 0) {
    // Earning tokens
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 180); // Expires in 180 days

    await prisma.walletTransaction.create({
      data: {
        userId,
        amount,
        type,
        expiresAt,
        isExpired: false,
        spent: 0,
        description
      }
    });
  } else if (amount < 0) {
    // Redeeming tokens
    const redeemAmount = Math.abs(amount);

    // Get all active, unexpired credit transactions with remaining balance (FIFO)
    const activeCredits = await prisma.walletTransaction.findMany({
      where: {
        userId,
        amount: { gt: 0 },
        isExpired: false,
        expiresAt: { gt: now },
        spent: { lt: prisma.walletTransaction.fields.amount }
      },
      orderBy: { createdAt: 'asc' }
    });

    let remainingToRedeem = redeemAmount;

    await prisma.$transaction(async (tx) => {
      for (const credit of activeCredits) {
        if (remainingToRedeem <= 0) break;

        const creditAvailable = credit.amount - credit.spent;
        const deduct = Math.min(creditAvailable, remainingToRedeem);

        // Update the spent amount on this credit transaction
        await tx.walletTransaction.update({
          where: { id: credit.id },
          data: {
            spent: { increment: deduct }
          }
        });

        remainingToRedeem -= deduct;
      }

      // Create a REDEMPTION transaction record
      await tx.walletTransaction.create({
        data: {
          userId,
          amount, // negative
          type,
          isExpired: false,
          spent: 0,
          description
        }
      });
    });
  }

  // Recalculate balance
  const activeCredits = await prisma.walletTransaction.findMany({
    where: {
      userId,
      amount: { gt: 0 },
      isExpired: false,
      expiresAt: { gt: now }
    }
  });

  const finalBalance = activeCredits.reduce((sum, tx) => sum + (tx.amount - tx.spent), 0);

  // Update cached balance on User
  await prisma.user.update({
    where: { id: userId },
    data: { walletBalance: finalBalance }
  });

  return finalBalance;
}

/**
 * Checks if the user is eligible for a daily login or Sunday bonus reward,
 * and awards it if they are.
 */
export async function checkAndAwardDailyLoginReward(userId: string, clientDate: string): Promise<{ rewarded: boolean; amount: number; balance: number }> {
  // Fetch user to check last reward claim date
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Check if already claimed today
  if (user.lastQuoteFlipDate === clientDate) {
    const currentBalance = await getWalletBalance(userId);
    return { rewarded: false, amount: 0, balance: currentBalance };
  }

  // Determine reward type and amount
  const today = new Date();
  const isSunday = today.getDay() === 0;
  const rewardAmount = isSunday ? 10 : 1;
  const rewardType = isSunday ? WalletTransactionType.SUNDAY_BONUS : WalletTransactionType.DAILY_LOGIN;
  const description = isSunday ? 'Sunday bonus reward' : 'Daily login reward';

  // Perform updates in a transaction
  const finalBalance = await prisma.$transaction(async (tx) => {
    // 1. Update user lastQuoteFlipDate to clientDate (pre-empt double claims)
    await tx.user.update({
      where: { id: userId },
      data: { lastQuoteFlipDate: clientDate }
    });

    // 2. Add transaction and update user walletBalance
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 180);

    await tx.walletTransaction.create({
      data: {
        userId,
        amount: rewardAmount,
        type: rewardType,
        expiresAt,
        isExpired: false,
        spent: 0,
        description
      }
    });

    // Calculate unexpired credits in transaction
    const activeCredits = await tx.walletTransaction.findMany({
      where: {
        userId,
        amount: { gt: 0 },
        isExpired: false,
        expiresAt: { gt: new Date() }
      }
    });

    const calculatedBalance = activeCredits.reduce((sum, item) => sum + (item.amount - item.spent), 0);

    await tx.user.update({
      where: { id: userId },
      data: { walletBalance: calculatedBalance }
    });

    return calculatedBalance;
  });

  return {
    rewarded: true,
    amount: rewardAmount,
    balance: finalBalance
  };
}

/**
 * Checks if a user has hit their monthly referral reward cap (₹500 / month).
 * Returns true if they are under the cap and can receive another referral reward.
 */
export async function canEarnReferralReward(userId: string): Promise<boolean> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // Sum all REFERRAL rewards earned by this user in the current calendar month
  const currentMonthReferrals = await prisma.walletTransaction.aggregate({
    where: {
      userId,
      type: WalletTransactionType.REFERRAL,
      amount: { gt: 0 },
      createdAt: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    },
    _sum: {
      amount: true
    }
  });

  const currentReferralSum = currentMonthReferrals._sum.amount || 0;
  return currentReferralSum < 500;
}
