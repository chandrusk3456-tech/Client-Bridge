import express from 'express';
import { createOrder, verifyPayment, getPaymentHistory, handleWebhook } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/history', protect, getPaymentHistory);
router.post('/webhook', handleWebhook); // Razorpay webhooks call public urls

export default router;
