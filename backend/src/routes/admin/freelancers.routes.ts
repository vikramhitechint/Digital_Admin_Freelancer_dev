import { Router } from 'express';
import { getFreelancers } from '../../controllers/admin/freelancers.controller';

const router = Router();
router.get('/', getFreelancers);

export default router;
