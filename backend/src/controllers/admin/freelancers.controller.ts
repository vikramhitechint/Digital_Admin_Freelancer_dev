import { Request, Response } from 'express';
import prisma from '../../config/prisma';
import { Role } from '@prisma/client';

export const getFreelancers = async (req: Request, res: Response) => {
  try {
    const freelancers = await prisma.user.findMany({
      where: { role: Role.FREELANCER },
      include: {
        profile: true,
        freelancerProjects: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedFreelancers = freelancers.map(f => ({
      id: f.id,
      name: f.fullName,
      email: f.email,
      initials: f.fullName.substring(0, 2).toUpperCase(),
      title: 'Freelance Professional',
      location: 'Remote',
      skills: f.profile?.skills || [],
      rating: f.profile?.rating || 5.0,
      projectsCount: f.freelancerProjects?.length || 0,
      status: f.freelancerProjects?.some(p => p.assignedAt != null) ? 'BUSY' : 'AVAILABLE'
    }));

    res.json({
      success: true,
      data: formattedFreelancers
    });
  } catch (error: any) {
    console.error('Error fetching freelancers:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch freelancers' });
  }
};
