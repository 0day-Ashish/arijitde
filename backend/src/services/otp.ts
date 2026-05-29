import { randomInt } from 'crypto';
import { transporter } from './email';

// Memory store for OTPs: email (lowercase) -> { otp: string, expiresAt: Date, attempts: number }
const otpStore = new Map<string, { otp: string; expiresAt: Date; attempts: number }>();

/**
 * Generates a cryptographically secure random 6-digit OTP string.
 */
export function generateOTP(): string {
  return randomInt(100000, 999999).toString();
}

/**
 * Sends OTP to the specified email address using Gmail SMTP.
 */
export async function sendOTP(email: string, otp: string): Promise<void> {
  const mailOptions = {
    from: `"FinAnalysis" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Your FinAnalysis Verification Code',
    text: `Your verification code is ${otp}. It will expire in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #0F172A; text-align: center;">FinAnalysis</h2>
        <p style="font-size: 16px; color: #334155;">Hello,</p>
        <p style="font-size: 16px; color: #334155;">Please use the following 6-digit OTP to complete your sign-in process. This OTP is valid for 10 minutes.</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; text-align: center; padding: 15px; margin: 20px 0; background-color: #F1F5F9; border-radius: 6px; color: #2563EB;">
          ${otp}
        </div>
        <p style="font-size: 14px; color: #64748B; text-align: center;">If you did not request this verification code, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

/**
 * Saves OTP in the in-memory map with a 10-minute expiry time limit.
 */
export function saveOTP(email: string, otp: string): void {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  otpStore.set(email.toLowerCase(), { otp, expiresAt, attempts: 0 });
}

/**
 * Verifies if the OTP is correct and has not expired.
 * Removes OTP from the store upon successful or unsuccessful validation.
 */
const MAX_OTP_ATTEMPTS = 5;

export function verifyOTP(email: string, otp: string): boolean {
  const key = email.toLowerCase();
  const record = otpStore.get(key);

  if (!record) {
    return false;
  }

  // Check if expired
  if (record.expiresAt.getTime() < Date.now()) {
    otpStore.delete(key);
    return false;
  }

  // Check if max attempts exceeded
  if (record.attempts >= MAX_OTP_ATTEMPTS) {
    otpStore.delete(key);
    return false;
  }

  // Validate OTP
  if (record.otp !== otp) {
    record.attempts += 1;
    return false;
  }

  // Clear OTP from memory after successful verification
  otpStore.delete(key);
  return true;
}
