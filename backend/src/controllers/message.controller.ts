import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getMessages = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.projectId as string;
    const { freelancerId } = req.query; // optional

    const whereClause: any = { projectId };
    if (freelancerId) {
      whereClause.freelancerId = freelancerId as string;
    }

    const messages = await prisma.message.findMany({
      where: whereClause,
      include: {
        sender: true
      },
      orderBy: { createdAt: 'asc' }
    });

    const formattedMessages = messages.map(m => ({
      id: m.id,
      text: m.content,
      sender: m.sender.fullName,
      senderId: m.senderId,
      freelancerId: m.freelancerId,
      time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      createdAt: m.createdAt
    }));

    res.json({ success: true, data: formattedMessages });
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
};

export const postMessage = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.projectId as string;
    const { content, senderId, freelancerId } = req.body;

    if (!content || !senderId) {
      res.status(400).json({ success: false, error: 'Missing content or senderId' });
      return;
    }

    const message = await prisma.message.create({
      data: {
        content,
        projectId,
        senderId,
        freelancerId: freelancerId || null
      },
      include: {
        sender: true
      }
    });

    res.json({
      success: true,
      data: {
        id: message.id,
        text: message.content,
        sender: message.sender.fullName,
        senderId: message.senderId,
        time: new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
        createdAt: message.createdAt
      }
    });
  } catch (error: any) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
};
