import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });
    console.log(adminUser);
  } catch (error) {
    console.error('Error fetching admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
