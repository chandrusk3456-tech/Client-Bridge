import express from 'express';
import { googleAuth, getMe, updateProfile, logout, firebaseLogin } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/google', googleAuth);
router.post('/firebase-login', firebaseLogin);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/logout', logout);

// Profile photo/file upload
router.post('/upload', protect, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  return res.status(200).json({ success: true, fileUrl });
});

export default router;
