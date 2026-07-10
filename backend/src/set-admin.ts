import dotenv from 'dotenv';
dotenv.config();

import { prisma } from './lib/prisma';
import { Role } from '@prisma/client';

async function main() {
  const email = process.argv[2]?.toLowerCase();

  if (!email) {
    console.error('Usage: ts-node set-admin.ts <email>');
    console.error('Example: ts-node set-admin.ts admin@example.com');
    process.exit(1);
  }

  // Basic email format check
  if (!email.includes('@') || !email.includes('.')) {
    console.error('Error: Invalid email format');
    process.exit(1);
  }
  
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: Role.ADMIN,
    },
    create: {
      email,
      role: Role.ADMIN,
    },
  });

  console.log('Successfully set/created admin user:', user.id, user.email);
  process.exit(0);
}

main().catch((err) => {
  console.error('Error running set-admin script:', err);
  process.exit(1);
});
