import { Request, Response } from 'express';
import prisma from '../../config/prisma';

export const getPayments = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        client: {
          include: {
            profile: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    let publishedTotal = 0;
    let ongoingTotal = 0;
    let completedTotal = 0;

    const formattedTransactions = projects.map(p => {
      const budget = Number(p.budget);
      
      if (p.status === 'PUBLISHED') publishedTotal += budget;
      else if (p.status === 'ONGOING') ongoingTotal += budget;
      else if (p.status === 'COMPLETED') completedTotal += budget;

      let paymentStatus = 'In Escrow';
      if (p.status === 'COMPLETED') paymentStatus = 'Released';
      if (p.status === 'PUBLISHED') paymentStatus = 'Pending';

      return {
        id: `txn_${p.id.substring(0, 8)}`,
        projectId: p.id,
        projectTitle: p.title,
        clientName: p.client.profile?.companyName || p.client.fullName,
        amount: `₹${budget.toLocaleString('en-IN')}`,
        status: paymentStatus,
        date: p.createdAt.toISOString()
      };
    });

    res.json({
      success: true,
      data: {
        totals: {
          published: `₹${publishedTotal.toLocaleString('en-IN')}`,
          ongoing: `₹${ongoingTotal.toLocaleString('en-IN')}`,
          completed: `₹${completedTotal.toLocaleString('en-IN')}`
        },
        transactions: formattedTransactions
      }
    });
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch payments' });
  }
};
