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
      payments: true,
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
      payments: true,
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
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error('Project not found');

  // Update status to DROP_REQUESTED
  await prisma.project.update({
    where: { id: projectId },
    data: { status: 'DROP_REQUESTED' as any }
  });
  
  return { success: true, message: 'Drop requested successfully. Awaiting Admin Approval.' };
};

export const approveDrop = async (projectId: string) => {
  const project = await prisma.project.findUnique({ 
    where: { id: projectId },
    include: { payments: true } 
  });
  if (!project) throw new Error('Project not found');

  let message = '';
  // Determine if it was ONGOING based on ESCROW payment
  const hasEscrow = project.payments.some((p) => p.type === 'ESCROW');
  
  if (hasEscrow) {
    // 90% refund (10% penalty)
    const refundAmount = Number(project.budget) * 0.90;
    
    // Create refund payment record
    await prisma.payment.create({
      data: {
        projectId,
        userId: project.clientId,
        amount: refundAmount,
        type: 'REFUND_75', // Keeping type name for compatibility, but it's 90%
        status: 'COMPLETED'
      }
    });

    // We subtract the 90% refund from their wallet (total spent)
    await prisma.user.update({
      where: { id: project.clientId },
      data: { walletBalance: { decrement: refundAmount } }
    });
    message = `Project dropped. 10% penalty applied. 90% (₹${refundAmount.toLocaleString()}) refunded.`;
  } else {
    // Dropped from PUBLISHED: client pays 10% penalty
    const penaltyAmount = Number(project.budget) * 0.10;
    await prisma.payment.create({
      data: {
        projectId,
        userId: project.clientId,
        amount: penaltyAmount,
        type: 'PENALTY_10',
        status: 'COMPLETED'
      }
    });
    // Add penalty to wallet total spent
    await prisma.user.update({
      where: { id: project.clientId },
      data: { walletBalance: { increment: penaltyAmount } }
    });
    message = `Project dropped. 10% (₹${penaltyAmount.toLocaleString()}) penalty paid.`;
  }

  // Update status to DROPPED
  await prisma.project.update({
    where: { id: projectId },
    data: { status: 'DROPPED' }
  });
  
  return { success: true, message };
};

export const completeProject = async (projectId: string) => {
  // Simulates releasing escrow to the freelancer
  return await updateProjectStatus(projectId, ProjectStatus.COMPLETED);
};

export const updateProjectProgress = async (projectId: string, completionPercentage: number, googleDriveLink?: string) => {
  const data: any = { completionPercentage };
  if (googleDriveLink !== undefined) {
    data.googleDriveLink = googleDriveLink;
  }
  return await prisma.project.update({
    where: { id: projectId },
    data,
  });
};

export const rateProject = async (projectId: string, rating: number, review?: string) => {
  return await prisma.project.update({
    where: { id: projectId },
    data: { rating, review },
  });
};
