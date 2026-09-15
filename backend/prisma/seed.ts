import { PrismaClient, ProjectStatus, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Create Mock Freelancers
  const f1 = await prisma.user.upsert({
    where: { email: 'alex@htge.in' },
    update: {},
    create: {
      email: 'alex@htge.in',
      fullName: 'Alex Chen',
      role: Role.FREELANCER,
      profile: {
        create: {
          skills: ['React', 'Node.js', 'AWS'],
        }
      }
    },
  });

  const f2 = await prisma.user.upsert({
    where: { email: 'maya@htge.in' },
    update: {},
    create: {
      email: 'maya@htge.in',
      fullName: 'Maya Lin',
      role: Role.FREELANCER,
      profile: {
        create: {
          skills: ['Figma', 'UI/UX', 'Framer'],
        }
      }
    },
  });

  const f3 = await prisma.user.upsert({
    where: { email: 'rajesh@htge.in' },
    update: {},
    create: {
      email: 'rajesh@htge.in',
      fullName: 'Rajesh Sharma',
      role: Role.FREELANCER,
      profile: {
        create: {
          skills: ['Kubernetes', 'Docker', 'GCP'],
        }
      }
    },
  });

  const f4 = await prisma.user.upsert({
    where: { email: 'sarah@htge.in' },
    update: {},
    create: {
      email: 'sarah@htge.in',
      fullName: 'Sarah Connor',
      role: Role.FREELANCER,
      profile: {
        create: {
          skills: ['Solidity', 'Cryptography', 'Python'],
        }
      }
    },
  });

  // 2. Create Mock Clients
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'adminhtge@gmail.org' },
    update: { password: hashedPassword },
    create: {
      email: 'adminhtge@gmail.org',
      password: hashedPassword,
      fullName: 'Super Admin',
      role: Role.ADMIN,
    },
  });

  const mainClient = await prisma.user.upsert({
    where: { email: 'admin@htge.in' },
    update: { password: hashedPassword },
    create: {
      email: 'admin@htge.in',
      password: hashedPassword,
      fullName: 'HTGE Main Client',
      role: Role.CLIENT,
      profile: {
        create: {
          companyName: 'HTGE',
        }
      }
    },
  });

  const c1 = await prisma.user.upsert({
    where: { email: 'client1@apex.io' },
    update: {},
    create: {
      email: 'client1@apex.io',
      fullName: 'Apex AI Rep',
      role: Role.CLIENT,
      profile: {
        create: {
          companyName: 'Apex AI Labs',
        }
      }
    },
  });

  const c2 = await prisma.user.upsert({
    where: { email: 'client2@quant.co' },
    update: {},
    create: {
      email: 'client2@quant.co',
      fullName: 'QuantMesh Rep',
      role: Role.CLIENT,
      profile: {
        create: {
          companyName: 'QuantMesh Tech',
        }
      }
    },
  });

  console.log('Seeding finished. User accounts and profiles are ready for end-to-end testing.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
