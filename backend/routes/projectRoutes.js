import express from 'express';
import {
  createRequest,
  getClientRequests,
  getClientProjects,
  getProjectById,
  respondToQuote,
  getAllRequests,
  quoteRequest,
  updateProjectStatus,
  updateMilestones,
  uploadDeliverable,
  generateInvoice,
  getAllProjects
} from '../controllers/projectController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// ==========================================
// CLIENT ROUTES
// ==========================================
router.post('/requests', protect, createRequest);
router.get('/requests', protect, getClientRequests);
router.get('/', protect, getClientProjects);
router.get('/:id', protect, getProjectById);
router.post('/requests/:id/action', protect, respondToQuote);

// ==========================================
// ADMIN ROUTES
// ==========================================
router.get('/admin/requests', protect, adminOnly, getAllRequests);
router.post('/admin/requests/:id/quote', protect, adminOnly, quoteRequest);
router.put('/admin/projects/:id/status', protect, adminOnly, updateProjectStatus);
router.put('/admin/projects/:id/milestones', protect, adminOnly, updateMilestones);
router.post('/admin/projects/:id/deliverable', protect, adminOnly, upload.single('file'), uploadDeliverable);
router.post('/admin/projects/:id/invoice', protect, adminOnly, generateInvoice);
router.get('/admin/projects', protect, adminOnly, getAllProjects);

export default router;
