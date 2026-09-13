import { Request, Response } from 'express';
import prisma from '../../config/prisma';

export const getProjects = async (_req: Request, res: Response) => {
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

    res.json({
      success: true,
      data: projects
    });
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch projects' });
  }
};
