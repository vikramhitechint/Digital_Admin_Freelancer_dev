import { Role } from '@prisma/client';
import prisma from '../config/prisma';

export const getAllUsers = async (role?: string) => {
  const filter = role ? { role: role.toUpperCase() as Role } : {};
  return await prisma.user.findMany({
    where: filter,
    include: {
      profile: true,
    },
  });
};

export const createUser = async (data: any) => {
  return await prisma.user.create({
    data: {
      email: data.email,
      fullName: data.fullName,
      role: data.role as Role,
      phone: data.phone,
      profile: {
        create: data.profile || {},
      },
    },
    include: { profile: true },
  });
};
