import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is missing');
}

const SECRET = JWT_SECRET;

export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, SECRET) as unknown as JWTPayload;
}
