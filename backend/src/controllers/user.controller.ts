import { Request, Response } from 'express';
import * as userService from '../services/user.service';

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.query;
    const users = await userService.getAllUsers(role as string);
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Temp method for creating mock users via Postman/API
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
