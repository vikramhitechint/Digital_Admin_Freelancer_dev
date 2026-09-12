import { Router } from 'express';
import userRoutes from './user.routes';
import projectRoutes from './project.routes';
import authRoutes from './auth.routes';
import messageRoutes from './message.routes';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/messages', messageRoutes);

export default router;
