import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main(): Promise<void> {
  const mockEmails = [
    'alex@htge.in',
    'maya@htge.in',
    'rajesh@htge.in',
    'sarah@htge.in',
    'client1@apex.io',
    'client2@quant.co'
  ];

  for (const email of mockEmails) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      // Delete any freelancer projects
      await prisma.freelancerProject.deleteMany({ where: { freelancerId: user.id } });
      
      // Delete any projects where they are the client
      await prisma.project.deleteMany({ where: { clientId: user.id } });
      
      // Delete their profile
      await prisma.profile.deleteMany({ where: { userId: user.id } });
      
      // Delete the user
      await prisma.user.delete({ where: { id: user.id } });
      console.log(`Deleted mock user: ${email}`);
    }
  }
}

main()
  .catch((e: Error) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
