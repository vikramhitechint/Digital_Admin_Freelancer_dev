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

export const getProfile = async (userId: string) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true }
  });
};

export const updateProfile = async (userId: string, data: any) => {
  const { companyName, industry, website, bankName, accountNumber, ifscCode, branchName, phone, email, fullName } = data;
  
  return await prisma.user.update({
    where: { id: userId },
    data: {
      phone,
      email,
      fullName,
      profile: {
        upsert: {
          create: { companyName, industry, website, bankName, accountNumber, ifscCode, branchName },
          update: { companyName, industry, website, bankName, accountNumber, ifscCode, branchName }
        }
      }
    },
    include: { profile: true }
  });
};
