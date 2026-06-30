import Message from '../models/Message.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// @desc    Get Chat History
// @route   GET /api/messages/:userId
// @access  Protected
export const getMessages = async (req, res) => {
  const otherUserId = req.params.userId;
  const currentUserId = req.user._id;

  try {
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: otherUserId },
        { sender: otherUserId, recipient: currentUserId },
      ],
    })
      .populate('sender', 'name email avatar role')
      .populate('recipient', 'name email avatar role')
      .sort({ createdAt: 1 });

    return res.status(200).json({ success: true, messages });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send Message
// @route   POST /api/messages
// @access  Protected
export const sendMessage = async (req, res) => {
  const { recipientId, content, attachments } = req.body;

  try {
    const senderId = req.user._id;

    if (!recipientId) {
      return res.status(400).json({ success: false, message: 'Recipient is required' });
    }

    const message = await Message.create({
      sender: senderId,
      recipient: recipientId,
      content,
      attachments: attachments || [],
    });

    // Populate sender details for socket emissions
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email avatar role')
      .populate('recipient', 'name email avatar role');

    // Send a Notification to the recipient
    await Notification.create({
      user: recipientId,
      sender: senderId,
      title: `New message from ${req.user.name}`,
      message: content ? (content.length > 50 ? `${content.substring(0, 50)}...` : content) : 'Sent an attachment',
      type: 'message',
      link: req.user.role === 'admin' ? '/dashboard/chat' : `/admin/chat?client=${senderId}`,
    });

    return res.status(201).json({ success: true, message: populatedMessage });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark Messages as Read
// @route   PUT /api/messages/:senderId/read
// @access  Protected
export const readMessages = async (req, res) => {
  const senderId = req.params.senderId;
  const recipientId = req.user._id;

  try {
    await Message.updateMany(
      { sender: senderId, recipient: recipientId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    return res.status(200).json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload Attachment file (standalone)
// @route   POST /api/messages/upload
// @access  Protected
export const uploadAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const fileDetails = {
      url: `/uploads/${req.file.filename}`,
      name: req.file.originalname,
      fileType: req.file.mimetype,
      size: req.file.size,
    };

    return res.status(200).json({ success: true, file: fileDetails });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get active chat list (unique users who have messaged)
// @route   GET /api/messages/users/active
// @access  Protected (Admin only)
export const getActiveChatUsers = async (req, res) => {
  try {
    // We aggregate unique conversations
    const currentUserId = req.user._id;

    // Find all users who are not admin and have conversations
    const messages = await Message.find({
      $or: [{ sender: currentUserId }, { recipient: currentUserId }],
    }).sort({ createdAt: -1 });

    const userIds = new Set();
    messages.forEach((msg) => {
      if (msg.sender.toString() !== currentUserId.toString()) {
        userIds.add(msg.sender.toString());
      }
      if (msg.recipient.toString() !== currentUserId.toString()) {
        userIds.add(msg.recipient.toString());
      }
    });

    const activeUsers = await User.find({ _id: { $in: Array.from(userIds) } }).select(
      'name email avatar company lastActive'
    );

    // Sort active users by the date of their last message
    const sortedUsers = activeUsers.map(user => {
      const lastMsg = messages.find(
        m => m.sender.toString() === user._id.toString() || m.recipient.toString() === user._id.toString()
      );
      return {
        ...user.toObject(),
        lastMessage: lastMsg,
      };
    }).sort((a, b) => {
      const dateA = a.lastMessage ? new Date(a.lastMessage.createdAt) : 0;
      const dateB = b.lastMessage ? new Date(b.lastMessage.createdAt) : 0;
      return dateB - dateA;
    });

    return res.status(200).json({ success: true, users: sortedUsers });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
