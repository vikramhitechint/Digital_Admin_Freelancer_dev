import prisma from '../config/prisma';
import { ProjectStatus } from '@prisma/client';

export const getAllProjects = async (filters: { status?: ProjectStatus; clientId?: string; freelancerId?: string }) => {
  const where: any = {};
  
  if (filters.status) where.status = filters.status;
  if (filters.clientId) where.clientId = filters.clientId;
  if (filters.freelancerId) {
    where.freelancers = {
      some: {
        freelancerId: filters.freelancerId,
      },
    };
  }

  return await prisma.project.findMany({
    where,
    include: {
      client: {
        select: { id: true, fullName: true, email: true, profile: true },
      },
      freelancers: {
        include: {
          freelancer: {
            select: { id: true, fullName: true, email: true, profile: true },
          }
        }
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getProjectById = async (id: string) => {
  return await prisma.project.findUnique({
    where: { id },
    include: {
      client: {
        select: { id: true, fullName: true, email: true, profile: true },
      },
      freelancers: {
        include: {
          freelancer: {
            select: { id: true, fullName: true, email: true, profile: true },
          }
        }
      },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: {
          sender: {
            select: { id: true, fullName: true, role: true }
          }
        }
      },
    },
  });
};

export const createProject = async (data: any) => {
  return await prisma.project.create({
    data: {
      title: data.title,
      description: data.description,
      budget: data.budget,
      timeline: data.timeline,
      status: ProjectStatus.PUBLISHED,
      clientId: data.clientId,
    },
  });
};

export const assignFreelancers = async (projectId: string, freelancerIds: string[]) => {
  // First, verify project exists
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error('Project not found');

  // Create assignments
  // Note: For simplicity, ignoring existing duplicates in this draft.
  // In production, we'd use upsert or clear and recreate.
  const assignments = freelancerIds.map(fId => ({
    projectId,
    freelancerId: fId,
  }));

  await prisma.freelancerProject.createMany({
    data: assignments,
    skipDuplicates: true,
  });

  return await getProjectById(projectId);
};

export const updateProjectStatus = async (projectId: string, status: ProjectStatus) => {
  return await prisma.project.update({
    where: { id: projectId },
    data: { status },
  });
};

export const dropProject = async (projectId: string) => {
  // Simulates a 10% fee calculation and project deletion/archiving.
  // In a real system, this would trigger Stripe or Razorpay APIs to handle refunds.
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error('Project not found');

  const fee = Number(project.budget) * 0.10;
  
  // Archiving/deleting the project
  await prisma.project.delete({ where: { id: projectId } });
  
  return { success: true, message: `Project dropped. Platform fee of $${fee.toFixed(2)} retained.` };
};

export const completeProject = async (projectId: string) => {
  // Simulates releasing escrow to the freelancer
  return await updateProjectStatus(projectId, ProjectStatus.COMPLETED);
};
