import { Request, Response } from 'express';
import prisma from '../../config/prisma';
import { ProjectStatus, Role } from '@prisma/client';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // 1. Total Revenue (Budget of Completed Projects)
    const completedProjects = await prisma.project.aggregate({
      where: { status: ProjectStatus.COMPLETED },
      _sum: { budget: true }
    });
    const totalRevenue = completedProjects._sum.budget || 0;

    // 2. Pending Payouts (Budget of Ongoing Projects in escrow simulation)
    const ongoingProjects = await prisma.project.aggregate({
      where: { status: ProjectStatus.ONGOING },
      _sum: { budget: true }
    });
    const pendingPayouts = ongoingProjects._sum.budget || 0;

    // 3. Awaiting Review (Count of Published Projects waiting for assignment)
    const awaitingReview = await prisma.project.count({
      where: { status: ProjectStatus.PUBLISHED }
    });

    // 4. Active Disputes (Count of Dropped Projects)
    const activeDisputes = await prisma.project.count({
      where: { status: ProjectStatus.DROPPED }
    });

    // 5. Pipeline Breakdown
    const pipelineGroups = await prisma.project.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    const pipelineCounts = {
      pendingReview: 0,
      assigned: 0, // In this model, if it's assigned but not ongoing, maybe we don't have this status. We'll map ONGOING to Ongoing Milestone Work.
      ongoing: 0,
      completed: 0,
      dropped: 0,
      total: 0
    };

    let totalProjects = 0;
    pipelineGroups.forEach(group => {
      totalProjects += group._count.status;
      if (group.status === ProjectStatus.PUBLISHED) pipelineCounts.pendingReview = group._count.status;
      if (group.status === ProjectStatus.ONGOING) pipelineCounts.ongoing = group._count.status;
      if (group.status === ProjectStatus.COMPLETED) pipelineCounts.completed = group._count.status;
      if (group.status === ProjectStatus.DROPPED) pipelineCounts.dropped = group._count.status;
    });
    pipelineCounts.total = totalProjects;

    res.json({
      success: true,
      data: {
        totalRevenue,
        pendingPayouts,
        awaitingReview,
        activeDisputes,
        pipelineCounts
      }
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard stats' });
  }
};
