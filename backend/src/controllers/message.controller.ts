import { Request, Response } from 'express';
import * as messageService from '../services/message.service';
import { AuthRequest } from '../middleware/auth.middleware';

export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = req.params.projectId as string;
    const messages = await messageService.getMessagesForProject(projectId);
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const postMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projectId = req.params.projectId as string;
    const { content } = req.body;
    const senderId = req.user?.userId;

    if (!senderId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const message = await messageService.createMessage(projectId, senderId, content);
    res.status(201).json(message);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
