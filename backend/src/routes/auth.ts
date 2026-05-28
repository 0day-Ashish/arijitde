import { Router } from 'express';
import type { Response } from 'express';
import { z } from 'zod';
import { generateOTP, sendOTP, saveOTP, verifyOTP } from '../services/otp';
import { prisma } from '../lib/prisma';
import { signToken } from '../lib/jwt';
import { authMiddleware } from '../middleware/auth';
import type { AuthenticatedRequest } from '../middleware/auth';
import { OAuth2Client } from 'google-auth-library';

const router = Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 1. POST /api/auth/otp/send
const sendOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
});

router.post('/otp/send', async (req, res, next) => {
  try {
    const { email } = sendOtpSchema.parse(req.body);
    const otp = generateOTP();

    // Store in-memory
    saveOTP(email, otp);

    // Send email
    await sendOTP(email, otp);

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
});

router.post('/otp/verify', async (req, res, next) => {
  try {
    const { email, otp } = verifyOtpSchema.parse(req.body);
    const formattedEmail = email.toLowerCase();

    const isValid = verifyOTP(formattedEmail, otp);
    if (!isValid) {
      res.status(400).json({
        success: false,
        error: 'Invalid or expired OTP',
      });
      return;
    }

    // Upsert user in database
    const user = await prisma.user.upsert({
      where: { email: formattedEmail },
      update: {},
      create: {
        email: formattedEmail,
        role: 'GUEST',
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
});

router.post('/google', async (req, res, next) => {
  try {
    const { token } = googleAuthSchema.parse(req.body);

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
        // Create new user
        user = await prisma.user.create({
          data: {
            email: formattedEmail,
            googleId,
            name: name || null,
            role: 'GUEST',
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
router.get('/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    data: req.user,
  });
});

// 5. POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    data: { message: 'logged out' },
  });
});

export default router;
