import { Router } from 'express';
import * as messageController from '../controllers/message.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/:projectId', authenticateToken, messageController.getMessages);
router.post('/:projectId', authenticateToken, messageController.postMessage);

export default router;
