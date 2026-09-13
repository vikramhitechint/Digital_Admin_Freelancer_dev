import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main(): Promise<void> {
  await prisma.freelancerProject.deleteMany({ where: { projectId: '812d664b-6383-485d-8cc1-67d1b108541b' } });
  await prisma.project.delete({ where: { id: '812d664b-6383-485d-8cc1-67d1b108541b' } });
  console.log('Deleted project');
}

main()
  .catch((e: Error) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
