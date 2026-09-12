import { Request, Response } from 'express';
import prisma from '../../config/prisma';

export const getProjects = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        client: {
          include: {
            profile: true
          }
        },
        freelancers: {
          include: {
            freelancer: true
          }
        },
        assets: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedProjects = projects.map(p => ({
      id: p.id,
      title: p.title,
      budget: p.budget,
      status: p.status,
      clientName: p.client.profile?.companyName || p.client.fullName,
      engineer: p.freelancers.length > 0 ? p.freelancers[0].freelancer.fullName : 'Unassigned',
      date: p.createdAt.toISOString(),
      assetsCount: p.assets?.length || 0,
      description: p.description
    }));

    res.json({
      success: true,
      data: formattedProjects
    });
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch projects' });
  }
};
