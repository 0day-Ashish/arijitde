import { Router } from 'express';
import type { Response, Request } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { generateOTP, sendOTP, saveOTP, verifyOTP } from '../services/otp';
import { prisma } from '../lib/prisma';
import { signToken } from '../lib/jwt';
import { authMiddleware } from '../middleware/auth';
import type { AuthenticatedRequest } from '../middleware/auth';
import { OAuth2Client } from 'google-auth-library';

async function generateUniqueReferralCode() {
  let referralCode = '';
  let isUnique = false;
  while (!isUnique) {
    referralCode = 'FIN-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const existing = await prisma.user.findUnique({
      where: { referralCode }
    });
    if (!existing) {
      isUnique = true;
    }
  }
  return referralCode;
}

const router = Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Rate limiter for sensitive auth endpoints only (not /me, /phone, /logout)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // 15 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many authentication attempts. Please wait 15 minutes and try again.' },
});

// 1. POST /api/auth/otp/send
const sendOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  isRegistration: z.boolean().optional(),
});

router.post('/otp/send', authLimiter, async (req, res, next) => {
  try {
    const { email, isRegistration } = sendOtpSchema.parse(req.body);
    const formattedEmail = email.toLowerCase();

    if (isRegistration) {
      const existingUser = await prisma.user.findUnique({
        where: { email: formattedEmail },
      });
      if (existingUser) {
        res.status(400).json({
          success: false,
          error: 'User already exists. Try login.',
        });
        return;
      }
    }

    const otp = generateOTP();

    // Store in-memory
    saveOTP(formattedEmail, otp);

    // Send email in background to prevent blocking the response
    sendOTP(formattedEmail, otp).catch((err) =>
      console.error('Failed to send OTP in background:', err)
    );

    res.json({
      success: true,
      data: { message: 'OTP sent' },
    });
  } catch (error) {
    next(error);
  }
});

// 2. POST /api/auth/otp/verify
const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  name: z.string().optional(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .optional(),
  referredBy: z.string().optional(),
});

router.post('/otp/verify', authLimiter, async (req, res, next) => {
  try {
    const { email, otp, name, password, referredBy } = verifyOtpSchema.parse(req.body);
    const formattedEmail = email.toLowerCase();

    const isValid = verifyOTP(formattedEmail, otp);
    if (!isValid) {
      res.status(400).json({
        success: false,
        error: 'Invalid or expired OTP',
      });
      return;
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    // Find referrer if referredBy is passed
    let referrerId: string | null = null;
    if (referredBy) {
      const referrerUser = await prisma.user.findUnique({
        where: { referralCode: referredBy.trim().toUpperCase() }
      });
      if (referrerUser) {
        referrerId = referrerUser.id;
      }
    }

    const refCode = await generateUniqueReferralCode();

    // Upsert user in database
    const user = await prisma.user.upsert({
      where: { email: formattedEmail },
      update: {
        name: name || undefined,
        password: hashedPassword || undefined,
      },
      create: {
        email: formattedEmail,
        name: name || null,
        password: hashedPassword || null,
        role: 'GUEST',
        referralCode: refCode,
        referrerId: referrerId || null,
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email || '',
      role: user.role,
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// 3. POST /api/auth/google
const googleAuthSchema = z.object({
  token: z.string().min(1, 'Google token is required'),
  referredBy: z.string().optional(),
});

router.post('/google', authLimiter, async (req, res, next) => {
  try {
    const { token, referredBy } = googleAuthSchema.parse(req.body);

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID!,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.status(400).json({
        success: false,
        error: 'Invalid Google token payload',
      });
      return;
    }

    const { email, sub: googleId, name } = payload;
    const formattedEmail = email.toLowerCase();

    // Check if user already exists with this googleId
    let user = await prisma.user.findUnique({
      where: { googleId },
    });

    if (!user) {
      // Check if user already exists with this email
      user = await prisma.user.findUnique({
        where: { email: formattedEmail },
      });

      if (user) {
        // Link googleId to existing email account
        user = await prisma.user.update({
          where: { email: formattedEmail },
          data: {
            googleId,
            name: user.name || name || null,
          },
        });
      } else {
        // Find referrer if referredBy is passed
        let referrerId: string | null = null;
        if (referredBy) {
          const referrerUser = await prisma.user.findUnique({
            where: { referralCode: referredBy.trim().toUpperCase() }
          });
          if (referrerUser) {
            referrerId = referrerUser.id;
          }
        }

        const refCode = await generateUniqueReferralCode();

        // Create new user
        user = await prisma.user.create({
          data: {
            email: formattedEmail,
            googleId,
            name: name || null,
            role: 'GUEST',
            referralCode: refCode,
            referrerId: referrerId || null,
          },
        });
      }
    }

    const jwtToken = signToken({
      userId: user.id,
      email: user.email || '',
      role: user.role,
    });

    res.json({
      success: true,
      data: {
        token: jwtToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          pan: user.pan,
        },
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Invalid or expired Google token',
    });
  }
});

// 4. GET /api/auth/me
router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    let user = req.user!;

    // 1. Backfill referral code if missing (legacy users)
    if (!user.referralCode) {
      const refCode = await generateUniqueReferralCode();
      user = await prisma.user.update({
        where: { id: userId },
        data: { referralCode: refCode },
        include: {
          client: {
            select: {
              activePlan: true,
              advisorNotes: true,
              activatedAt: true,
            }
          }
        }
      }) as any;
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// 5. POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    data: { message: 'logged out' },
  });
});

// 6. POST /api/auth/phone
const updatePhoneSchema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date of birth format',
  }).transform((val) => new Date(val)),
  anniversary: z.string().optional().nullable().refine((val) => !val || val.trim() === '' || !isNaN(Date.parse(val)), {
    message: 'Invalid anniversary date format',
  }).transform((val) => (val && val.trim() !== '') ? new Date(val) : null),
});

router.post('/phone', authMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { phone, dob, anniversary } = updatePhoneSchema.parse(req.body);
    const userId = req.user!.id;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        phone,
        dob,
        anniversary,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        dob: true,
        anniversary: true,
      }
    });

    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
});

// 7. POST /api/auth/pan/login
const panLoginSchema = z.object({
  pan: z.string().min(1, 'PAN is required'),
  password: z.string().min(1, 'Password is required'),
});

router.post('/pan/login', authLimiter, async (req, res, next) => {
  try {
    const { pan, password } = panLoginSchema.parse(req.body);
    const formattedPan = pan.trim().toUpperCase();

    // Query user by PAN
    const user = await prisma.user.findUnique({
      where: { pan: formattedPan },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'No client profile found matching this PAN number.',
      });
      return;
    }

    if (user.role !== 'CLIENT') {
      res.status(403).json({
        success: false,
        error: 'Only approved clients can log in using PAN.',
      });
      return;
    }

    // Verify password
    if (!user.password) {
      res.status(400).json({
        success: false,
        error: 'No password set on this account. Please reset your password using email OTP.',
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: 'Invalid password. Please try again.',
      });
      return;
    }

    const token = signToken({
      userId: user.id,
      email: user.email || '',
      role: user.role,
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          pan: user.pan,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// 8. POST /api/auth/password/reset/send-otp
const sendResetOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
});

router.post('/password/reset/send-otp', authLimiter, async (req, res, next) => {
  try {
    const { email } = sendResetOtpSchema.parse(req.body);
    const formattedEmail = email.toLowerCase();

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { email: formattedEmail },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'No user account found matching this email address.',
      });
      return;
    }

    const otp = generateOTP();
    saveOTP(formattedEmail, otp);
    // Send email in background to prevent blocking the response
    sendOTP(formattedEmail, otp).catch((err) =>
      console.error('Failed to send OTP in background:', err)
    );

    res.json({
      success: true,
      data: { message: 'OTP sent to email successfully' },
    });
  } catch (error) {
    next(error);
  }
});

// 9. POST /api/auth/password/reset/confirm
const confirmResetSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

router.post('/password/reset/confirm', authLimiter, async (req, res, next) => {
  try {
    const { email, otp, password } = confirmResetSchema.parse(req.body);
    const formattedEmail = email.toLowerCase();

    const isValid = verifyOTP(formattedEmail, otp);
    if (!isValid) {
      res.status(400).json({
        success: false,
        error: 'Invalid or expired reset OTP.',
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email: formattedEmail },
      data: { password: hashedPassword },
    });

    res.json({
      success: true,
      data: { message: 'Password has been reset successfully. Please log in.' },
    });
  } catch (error) {
    next(error);
  }
});

// 10. POST /api/auth/activation/send-otp
const sendActivationOtpSchema = z.object({
  pan: z.string().min(1, 'PAN is required'),
  email: z.string().email('Invalid email address'),
});

router.post('/activation/send-otp', authLimiter, async (req, res, next) => {
  try {
    const { pan, email } = sendActivationOtpSchema.parse(req.body);
    const formattedPan = pan.trim().toUpperCase();
    const formattedEmail = email.toLowerCase();

    // 1. Check if user already exists with this PAN
    const userWithPan = await prisma.user.findUnique({
      where: { pan: formattedPan }
    });
    if (userWithPan) {
      res.status(400).json({
        success: false,
        error: 'An account has already been activated for this PAN. Please log in using your PAN.'
      });
      return;
    }

    // 2. Check if user already exists with this email but a different PAN
    const userWithEmail = await prisma.user.findUnique({
      where: { email: formattedEmail }
    });
    if (userWithEmail && userWithEmail.pan && userWithEmail.pan !== formattedPan) {
      res.status(400).json({
        success: false,
        error: 'This email address is already linked to another client account.'
      });
      return;
    }

    // 3. Verify PAN + Email combination in ExistingClient or Folio tables
    const existingClientMatch = await prisma.existingClient.findFirst({
      where: {
        pan: { equals: formattedPan, mode: 'insensitive' },
        email: { equals: formattedEmail, mode: 'insensitive' }
      }
    });

    let matches = !!existingClientMatch;

    if (!matches) {
      const folioMatch = await prisma.folio.findFirst({
        where: {
          OR: [
            { clientPan: { equals: formattedPan, mode: 'insensitive' } },
            { panAsPerFolio: { equals: formattedPan, mode: 'insensitive' } }
          ],
          email: { equals: formattedEmail, mode: 'insensitive' }
        }
      });
      matches = !!folioMatch;
    }

    if (!matches) {
      res.status(404).json({
        success: false,
        error: 'No matching client profile found with the provided PAN and Email combination. Please verify your details or contact support.'
      });
      return;
    }

    // 4. Send OTP
    const otp = generateOTP();
    saveOTP(formattedEmail, otp);
    // Send email in background to prevent blocking the response
    sendOTP(formattedEmail, otp).catch((err) =>
      console.error('Failed to send OTP in background:', err)
    );

    res.json({
      success: true,
      data: { message: 'Activation OTP sent successfully' }
    });
  } catch (error) {
    next(error);
  }
});

// 11. POST /api/auth/activation/verify-otp
const verifyActivationOtpSchema = z.object({
  pan: z.string().min(1, 'PAN is required'),
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

router.post('/activation/verify-otp', authLimiter, async (req, res, next) => {
  try {
    const { pan, email, otp, password } = verifyActivationOtpSchema.parse(req.body);
    const formattedPan = pan.trim().toUpperCase();
    const formattedEmail = email.toLowerCase();

    // 1. Double check PAN uniqueness to avoid race conditions
    const userWithPan = await prisma.user.findUnique({
      where: { pan: formattedPan }
    });
    if (userWithPan) {
      res.status(400).json({
        success: false,
        error: 'An account has already been activated for this PAN. Please log in using your PAN.'
      });
      return;
    }

    // 2. Verify OTP
    const isValid = verifyOTP(formattedEmail, otp);
    if (!isValid) {
      res.status(400).json({
        success: false,
        error: 'Invalid or expired activation OTP.'
      });
      return;
    }

    // 3. Fetch name from imported records
    let clientName: string | null = null;
    const existingClientMatch = await prisma.existingClient.findFirst({
      where: {
        pan: { equals: formattedPan, mode: 'insensitive' },
        email: { equals: formattedEmail, mode: 'insensitive' }
      }
    });
    if (existingClientMatch) {
      clientName = existingClientMatch.name;
    } else {
      const folioMatch = await prisma.folio.findFirst({
        where: {
          OR: [
            { clientPan: { equals: formattedPan, mode: 'insensitive' } },
            { panAsPerFolio: { equals: formattedPan, mode: 'insensitive' } }
          ],
          email: { equals: formattedEmail, mode: 'insensitive' }
        }
      });
      if (folioMatch) {
        clientName = folioMatch.clientName || folioMatch.nameAsPerFolio;
      }
    }

    // 4. Upsert User in database with role CLIENT in a transaction
    const user = await prisma.$transaction(async (tx: any) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      const existingUser = await tx.user.findUnique({
        where: { email: formattedEmail }
      });

      let updatedUser;
      if (existingUser) {
        updatedUser = await tx.user.update({
          where: { email: formattedEmail },
          data: {
            pan: formattedPan,
            name: existingUser.name || clientName || undefined,
            password: hashedPassword,
            role: 'CLIENT'
          }
        });
      } else {
        updatedUser = await tx.user.create({
          data: {
            email: formattedEmail,
            pan: formattedPan,
            name: clientName,
            password: hashedPassword,
            role: 'CLIENT'
          }
        });
      }

      await tx.client.upsert({
        where: { userId: updatedUser.id },
        update: {
          activatedAt: new Date(),
        },
        create: {
          userId: updatedUser.id,
          activatedAt: new Date(),
          advisorNotes: 'Activated via PAN + Email OTP',
          activePlan: 'PREMIUM',
        }
      });

      return updatedUser;
    });

    const token = signToken({
      userId: user.id,
      email: user.email || '',
      role: user.role,
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          pan: user.pan,
          phone: user.phone,
        }
      }
    });
  } catch (error) {
    next(error);
  }
});



export default router;

