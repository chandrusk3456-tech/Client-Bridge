import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'clientbridge_fallback_secret_key', {
    expiresIn: '30d',
  });
};

// @desc    Auth with Google (Verify token & Login/Register)
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req, res) => {
  const { credential, clientDetails } = req.body;

  try {
    let email, name, avatar, googleId;

    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential token is required' });
    }

    // In production, we fetch Google Token Info
    // GET https://oauth2.googleapis.com/tokeninfo?id_token=XYZ
    try {
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
      const data = await response.json();
      
      if (data.error_description) {
        throw new Error(data.error_description);
      }
      
      email = data.email;
      name = data.name;
      avatar = data.picture;
      googleId = data.sub;
    } catch (err) {
      console.warn('Google validation failed, using dev fallback logic:', err.message);
      // Dev Mode Bypass - If Google endpoint fails or is offline, we decode local JSON payload if provided
      if (clientDetails) {
        email = clientDetails.email;
        name = clientDetails.name;
        avatar = clientDetails.avatar || '';
        googleId = clientDetails.googleId || `dev-id-${Date.now()}`;
      } else {
        return res.status(400).json({ success: false, message: 'Invalid Google credential token' });
      }
    }

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      // First user registered becomes admin for convenience in testing, or default to client
      const isFirstUser = (await User.countDocuments({})) === 0;
      user = await User.create({
        googleId,
        email,
        name,
        avatar,
        role: isFirstUser ? 'admin' : 'client',
      });
    } else {
      // Update google ID and avatar if missing
      user.googleId = googleId;
      if (avatar) user.avatar = avatar;
      await user.save();
    }

    // Generate JWT
    const token = generateToken(user._id);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        phone: user.phone,
        whatsapp: user.whatsapp,
        telegram: user.telegram,
        company: user.company,
      },
      token,
    });
  } catch (error) {
    console.error('Google Auth Controller Error:', error);
    return res.status(500).json({ success: false, message: 'Server Authentication Error' });
  }
};

// @desc    Get Current User Profile
// @route   GET /api/auth/me
// @access  Protected
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update User Profile Contacts
// @route   PUT /api/auth/profile
// @access  Protected
export const updateProfile = async (req, res) => {
  const { name, avatar, phone, whatsapp, telegram, company } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = name || user.name;
    user.avatar = avatar || user.avatar;
    user.phone = phone !== undefined ? phone : user.phone;
    user.whatsapp = whatsapp !== undefined ? whatsapp : user.whatsapp;
    user.telegram = telegram !== undefined ? telegram : user.telegram;
    user.company = company !== undefined ? company : user.company;

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Logout User / Clear Cookie
// @route   POST /api/auth/logout
// @access  Public
export const logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @desc    Firebase Auth Session Synchronization
// @route   POST /api/auth/firebase-login
// @access  Public
export const firebaseLogin = async (req, res) => {
  const { uid, email, name, avatar, role } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required for session sync' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        googleId: `firebase-${uid}`,
        email,
        name,
        avatar: avatar || '',
        role: role || 'client',
      });
    } else {
      // Sync role and avatar
      user.role = role || user.role;
      if (avatar) user.avatar = avatar;
      await user.save();
    }

    // Generate JWT
    const token = generateToken(user._id);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        phone: user.phone,
        whatsapp: user.whatsapp,
        telegram: user.telegram,
        company: user.company,
      },
      token,
    });
  } catch (error) {
    console.error('Firebase Login Controller Error:', error);
    return res.status(500).json({ success: false, message: 'Server Session Synchronization Error' });
  }
};

