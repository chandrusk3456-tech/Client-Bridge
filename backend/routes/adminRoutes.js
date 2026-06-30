import express from 'express';
import {
  getAnalytics,
  getAllReviewsAdmin,
  getApprovedReviews,
  createReview,
  toggleReviewApproval,
  deleteReview,
  getClients,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public reviews endpoint
router.get('/reviews/approved', getApprovedReviews);

// Client review creation
router.post('/reviews', protect, createReview);

// General Notifications (Protected Client/Admin)
router.get('/notifications', protect, getNotifications);
router.put('/notifications/read-all', protect, markAllNotificationsRead);
router.put('/notifications/:id/read', protect, markNotificationRead);

// Protected Admin-only endpoints
router.get('/analytics', protect, adminOnly, getAnalytics);
router.get('/reviews', protect, adminOnly, getAllReviewsAdmin);
router.put('/reviews/:id/approve', protect, adminOnly, toggleReviewApproval);
router.delete('/reviews/:id', protect, adminOnly, deleteReview);
router.get('/clients', protect, adminOnly, getClients);

export default router;
