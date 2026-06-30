import express from 'express';
import {
  getMessages,
  sendMessage,
  readMessages,
  uploadAttachment,
  getActiveChatUsers
} from '../controllers/messageController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/users/active', protect, adminOnly, getActiveChatUsers);
router.get('/:userId', protect, getMessages);
router.post('/', protect, sendMessage);
router.put('/:senderId/read', protect, readMessages);
router.post('/upload', protect, upload.single('file'), uploadAttachment);

export default router;
