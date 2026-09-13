import { Request, Response } from 'express';
import prisma from '../../config/prisma';
import { Role } from '@prisma/client';

export const getCompanies = async (_req: Request, res: Response) => {
  try {
    const companies = await prisma.user.findMany({
      where: { role: Role.CLIENT },
      include: {
        profile: true,
        clientProjects: {
          select: {
            id: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedCompanies = companies.map((c: any) => {
      const totalProjects = c.clientProjects ? c.clientProjects.length : 0;
      const ongoingProjects = c.clientProjects ? c.clientProjects.filter((p: any) => p.status === 'ONGOING').length : 0;

      return {
        id: c.id,
        name: c.profile?.companyName || c.fullName,
        email: c.email,
        initials: (c.profile?.companyName || c.fullName || '??').substring(0, 2).toUpperCase(),
        industry: 'Tech / Services', // Hardcoded as we don't have industry in schema
        status: 'Approved', // Hardcoded as we don't have user approval status
        projects: {
          total: totalProjects,
          ongoing: ongoingProjects
        },
        dateJoined: c.createdAt.toISOString()
      };
    });

    res.json({
      success: true,
      data: formattedCompanies
    });
  } catch (error: any) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch companies' });
  }
};
