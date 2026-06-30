import User from '../models/User.js';
import Project from '../models/Project.js';
import ProjectRequest from '../models/ProjectRequest.js';
import Payment from '../models/Payment.js';
import Review from '../models/Review.js';
import Message from '../models/Message.js';

// @desc    Get Admin Dashboard Analytics
// @route   GET /api/admin/analytics
// @access  Protected (Admin only)
export const getAnalytics = async (req, res) => {
  try {
    // 1. Total & Monthly Revenue
    const completedPayments = await Payment.find({ status: 'completed' });
    const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);

    // Current month revenue
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyPayments = completedPayments.filter(p => {
      const pDate = new Date(p.createdAt);
      return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
    });
    const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);

    // Pending/Unpaid invoices total
    const projectsWithInvoices = await Project.find({});
    let pendingInvoiceRevenue = 0;
    projectsWithInvoices.forEach(proj => {
      proj.invoices.forEach(inv => {
        if (inv.status === 'unpaid') {
          pendingInvoiceRevenue += inv.amount;
        }
      });
    });

    // 2. Counts
    const clientsWithRequests = await ProjectRequest.distinct('client');
    const totalClients = clientsWithRequests.length;
    const activeProjects = await Project.countDocuments({ status: 'in_progress' });
    const completedProjects = await Project.countDocuments({ status: 'completed' });
    const pendingRequests = await ProjectRequest.countDocuments({ status: 'pending' });

    // 3. Project Status Distribution
    const statusDistribution = {
      pending: await Project.countDocuments({ status: 'pending' }),
      quoted: await Project.countDocuments({ status: 'quoted' }),
      paid: await Project.countDocuments({ status: 'paid' }),
      in_progress: activeProjects,
      completed: completedProjects,
      delivered: await Project.countDocuments({ status: 'delivered' }),
    };

    // 4. Monthly Billing Trend Chart Data (Last 6 Months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mLabel = d.toLocaleString('default', { month: 'short' });
      const mVal = d.getMonth();
      const yVal = d.getFullYear();

      const mPayments = completedPayments.filter(p => {
        const pDate = new Date(p.createdAt);
        return pDate.getMonth() === mVal && pDate.getFullYear() === yVal;
      });
      const revenue = mPayments.reduce((sum, p) => sum + p.amount, 0);

      monthlyTrend.push({ month: mLabel, revenue });
    }

    return res.status(200).json({
      success: true,
      analytics: {
        totalRevenue,
        monthlyRevenue,
        pendingInvoiceRevenue,
        totalClients,
        activeProjects,
        completedProjects,
        pendingRequests,
        statusDistribution,
        monthlyTrend,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// REVIEW MODERATION & MANAGEMENT
// ==========================================

// @desc    Get all reviews (Admin gets all, public gets approved only)
// @route   GET /api/admin/reviews
// @access  Protected (Admin only)
export const getAllReviewsAdmin = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate('client', 'name email avatar')
      .populate('project', 'title category')
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get approved reviews for public Landing Page
// @route   GET /api/reviews/approved
// @access  Public
export const getApprovedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: true })
      .populate('client', 'name email avatar')
      .populate('project', 'title category')
      .sort({ rating: -1, createdAt: -1 });
    
    // Seed standard review if empty
    if (reviews.length === 0) {
      // Return a default mockup list for beautiful rendering
      const mockReviews = [
        {
          _id: 'mock-rev-1',
          rating: 5,
          comment: 'Charlie delivered Pizza Palace and it completely changed our restaurant operations. Super clean backend and the kitchen display sync works flawlessly. Will hire again!',
          client: {
            name: 'Sarah Jenkins',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
            company: 'Pizza Palace Ltd.',
          },
          project: { title: 'Pizza Palace' }
        },
        {
          _id: 'mock-rev-2',
          rating: 5,
          comment: 'Outstanding promotional videos! The motion graphics were highly engaging and custom tailored for our YouTube reels launch.',
          client: {
            name: 'David Carter',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
            company: 'TechPulse Media',
          },
          project: { title: 'YouTube Shorts Launch' }
        }
      ];
      return res.status(200).json({ success: true, reviews: mockReviews });
    }

    return res.status(200).json({ success: true, reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a project review (Client submits)
// @route   POST /api/reviews
// @access  Protected
export const createReview = async (req, res) => {
  const { projectId, rating, comment } = req.body;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized review submission' });
    }

    const review = await Review.create({
      client: req.user._id,
      project: projectId,
      rating,
      comment,
    });

    return res.status(201).json({ success: true, message: 'Review submitted. Awaiting moderation.', review });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve/Reject review status
// @route   PUT /api/admin/reviews/:id/approve
// @access  Protected (Admin only)
export const toggleReviewApproval = async (req, res) => {
  const { isApproved } = req.body;

  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.isApproved = isApproved;
    await review.save();

    return res.status(200).json({ success: true, review });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Review
// @route   DELETE /api/admin/reviews/:id
// @access  Protected (Admin only)
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    return res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// CLIENT LIST & NOTIFICATIONS
// ==========================================

// @desc    Get all clients
// @route   GET /api/admin/clients
// @access  Protected (Admin only)
export const getClients = async (req, res) => {
  try {
    const clients = await User.find({ role: 'client' }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, clients });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all notifications for user
// @route   GET /api/notifications
// @access  Protected
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    return res.status(200).json({ success: true, notifications });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Protected
export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized action' });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json({ success: true, notification });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Protected
export const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { $set: { isRead: true } });
    return res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
