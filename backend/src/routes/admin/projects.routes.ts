import { Router } from 'express';
import { getProjects } from '../../controllers/admin/projects.controller';

const router = Router();
router.get('/', getProjects);

export default router;
