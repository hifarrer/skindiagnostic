import { Router } from 'express';
import { adminAuthenticate } from '../middleware/adminAuth.js';
import * as ctrl from '../controllers/adminController.js';

const router = Router();

// Public
router.post('/login', ctrl.login);

// Protected — everything below requires admin JWT
router.use(adminAuthenticate);

router.get('/me', ctrl.getMe);

// Users
router.get('/users', ctrl.getUsers);
router.get('/users/:id', ctrl.getUser);
router.get('/users/:id/tasks', ctrl.getUserTasks);
router.get('/users/:id/analyses', ctrl.getUserAnalyses);
router.put('/users/:id', ctrl.updateUser);
router.delete('/users/:id', ctrl.deleteUser);

// Plans
router.get('/plans', ctrl.getPlans);
router.post('/plans', ctrl.createPlan);
router.put('/plans/:id', ctrl.updatePlan);
router.delete('/plans/:id/permanent', ctrl.deletePlanPermanent);
router.delete('/plans/:id', ctrl.deletePlan);

// Statistics
router.get('/stats/overview', ctrl.getOverview);
router.get('/stats/users-over-time', ctrl.getUsersOverTime);
router.get('/stats/tasks-over-time', ctrl.getTasksOverTime);
router.get('/stats/subscriptions', ctrl.getSubscriptionStats);

// Settings
router.get('/settings', ctrl.getSettings);
router.put('/settings', ctrl.updateSettings);
router.put('/password', ctrl.changePassword);

export default router;
