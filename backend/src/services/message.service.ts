import prisma from '../config/prisma';

export const getMessagesForProject = async (projectId: string) => {
  return await prisma.message.findMany({
    where: { projectId },
    include: {
      sender: {
        select: {
          id: true,
          fullName: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
};

export const createMessage = async (projectId: string, senderId: string, content: string) => {
  return await prisma.message.create({
    data: {
      content,
      projectId,
      senderId,
    },
    include: {
      sender: {
        select: {
          id: true,
          fullName: true,
          role: true,
        },
      },
    },
  });
};
