import { Router } from 'express';
import * as projectController from '../controllers/project.controller';

const router = Router();

router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);
router.post('/', projectController.createProject);
router.put('/:id/assign', projectController.assignFreelancers);
router.put('/:id/status', projectController.updateProjectStatus);
router.put('/:id/drop', projectController.dropProject);
router.put('/:id/complete', projectController.completeProject);

export default router;
