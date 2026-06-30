import express from 'express';
import {
  getPortfolio,
  getPortfolioBySlug,
  createPortfolioProject,
  updatePortfolioProject,
  deletePortfolioProject,
} from '../controllers/portfolioController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getPortfolio);
router.get('/:slug', getPortfolioBySlug);

// Admin routes
router.post('/', protect, adminOnly, createPortfolioProject);
router.put('/:id', protect, adminOnly, updatePortfolioProject);
router.delete('/:id', protect, adminOnly, deletePortfolioProject);

export default router;
