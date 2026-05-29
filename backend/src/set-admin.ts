import { prisma } from './lib/prisma';
import { Role } from '@prisma/client';

async function main() {
  const email = '0day.ashish@gmail.com'.toLowerCase();
  
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: Role.ADMIN,
    },
    create: {
      email,
      role: Role.ADMIN,
      name: 'Ashish Ranjan Das',
    },
  });

  console.log('Successfully set/created admin user:', user);
  process.exit(0);
}

main().catch((err) => {
  console.error('Error running set-admin script:', err);
  process.exit(1);
});
