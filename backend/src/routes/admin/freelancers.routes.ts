import { Router } from 'express';
import { getFreelancers, createFreelancer } from '../../controllers/admin/freelancers.controller';

const router = Router();
router.get('/', getFreelancers);
router.post('/', createFreelancer);

export default router;
