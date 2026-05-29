import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRouter from './routes/auth';
import assessRouter from './routes/assess';
import portfolioRouter from './routes/portfolio';
import scoreRouter from './routes/score';
import leadsRouter from './routes/leads';
import paymentsRouter from './routes/payments';
import adminRouter from './routes/admin';
import { errorHandler } from './middleware/error';

// Verify required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'GMAIL_APP_PASSWORD',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: Missing required environment variable ${envVar}`);
    process.exit(1);
  }
}

// Warn if GMAIL_USER is missing, since nodemailer relies on it
if (!process.env.GMAIL_USER) {
  console.warn('Warning: GMAIL_USER environment variable is not set. OTP emails might fail.');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: { status: 'healthy' },
  });
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRouter);
app.use('/api/assess', assessRouter);
app.use('/api/portfolio', portfolioRouter);
app.use('/api/score', scoreRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/admin', adminRouter);

// Global Error Handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
