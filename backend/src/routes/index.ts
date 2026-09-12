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

// Admin Routes
import adminDashboardRoutes from './admin/dashboard.routes';
import adminCompaniesRoutes from './admin/companies.routes';
import adminProjectsRoutes from './admin/projects.routes';
import adminFreelancersRoutes from './admin/freelancers.routes';
import adminPaymentsRoutes from './admin/payments.routes';

router.use('/admin/dashboard', adminDashboardRoutes);
router.use('/admin/companies', adminCompaniesRoutes);
router.use('/admin/projects', adminProjectsRoutes);
router.use('/admin/freelancers', adminFreelancersRoutes);
router.use('/admin/payments', adminPaymentsRoutes);

export default router;
