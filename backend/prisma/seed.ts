import { PrismaClient, ProjectStatus, Role } from '@prisma/client';

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

  // 3. Create Projects
  const p1 = await prisma.project.create({
    data: {
      title: 'Zero-Knowledge Rollup Settlement Bridge',
      description: 'We need a robust layer-2 settlement bridge built on Ethereum. The freelancer must have deep knowledge of Cairo, Solidity, and zero-knowledge proofs. We expect full test coverage and audited smart contracts.',
      budget: 480000,
      timeline: '4 Weeks',
      status: ProjectStatus.PUBLISHED,
      clientId: c1.id,
    }
  });

  const p2 = await prisma.project.create({
    data: {
      title: 'PCI-DSS V4 Token Vault & SDK',
      description: 'Looking to build a completely isolated tokenization vault to store credit card data for our payment gateway. Requires strict compliance with PCI-DSS v4 guidelines and an easy-to-use Node.js SDK.',
      budget: 620000,
      timeline: '6 Weeks',
      status: ProjectStatus.PUBLISHED,
      clientId: c2.id,
      freelancers: {
        create: [
          { freelancerId: f1.id }
        ]
      }
    }
  });

  console.log('Seeding finished.');
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
