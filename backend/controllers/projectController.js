import Project from '../models/Project.js';
import ProjectRequest from '../models/ProjectRequest.js';
import Notification from '../models/Notification.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

// ==========================================
// CLIENT ACTIONS
// ==========================================

// @desc    Submit a new Project Request
// @route   POST /api/projects/requests
// @access  Protected (Client)
export const createRequest = async (req, res) => {
  const { title, description, category, budget, timeline, requirements } = req.body;

  try {
    const request = await ProjectRequest.create({
      client: req.user._id,
      title,
      description,
      category,
      budget,
      timeline,
      requirements,
    });

    // Notify all admin users
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        sender: req.user._id,
        title: 'New Project Request',
        message: `${req.user.name} submitted a request: "${title}"`,
        type: 'request_status',
        link: `/admin/requests`,
      });
    }

    return res.status(201).json({ success: true, request });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Client's own Project Requests
// @route   GET /api/projects/requests
// @access  Protected (Client)
export const getClientRequests = async (req, res) => {
  try {
    const requests = await ProjectRequest.find({ client: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, requests });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Client's own active Projects
// @route   GET /api/projects
// @access  Protected (Client)
export const getClientProjects = async (req, res) => {
  try {
    const projects = await Project.find({ client: req.user._id })
      .populate('client', 'name email avatar')
      .sort({ updatedAt: -1 });
    return res.status(200).json({ success: true, projects });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get specific Project details
// @route   GET /api/projects/:id
// @access  Protected (Client/Admin)
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'name email avatar phone whatsapp telegram company')
      .populate('projectRequest');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Security: Check if user is the client or is admin
    if (req.user.role !== 'admin' && project.client._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied: Unauthorized project inspection' });
    }

    return res.status(200).json({ success: true, project });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Client responds to quote (Accept / Decline)
// @route   POST /api/projects/requests/:id/action
// @access  Protected (Client)
export const respondToQuote = async (req, res) => {
  const { action, clientNotes } = req.body; // action: 'accept' or 'decline'

  try {
    const request = await ProjectRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized action' });
    }

    if (action === 'accept') {
      request.status = 'accepted';
      request.clientNotes = clientNotes || '';
      await request.save();

      // Automatically convert this request into a Project database entry
      const project = await Project.create({
        client: request.client,
        projectRequest: request._id,
        title: request.title,
        description: request.description,
        category: request.category,
        quoteAmount: request.quoteAmount,
        status: 'pending', // Waiting for initial payment
        milestones: [
          { title: 'Project Kickoff & Deposit', description: 'Initial payment verification', targetDate: new Date(), completed: false },
          { title: 'Development / Design Phase', description: 'Core work implementation', completed: false },
          { title: 'Final Review & Deliverables', description: 'Handover and approval', completed: false }
        ],
        invoices: [
          {
            invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
            amount: request.quoteAmount,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            status: 'unpaid'
          }
        ]
      });

      // Send automated message log
      const admins = await User.find({ role: 'admin' });
      const firstAdmin = admins[0] || { _id: req.user._id };

      await Message.create({
        sender: req.user._id,
        recipient: firstAdmin._id,
        content: `I accepted the quote of ₹${request.quoteAmount} for the project: "${request.title}". Invoice generated.`,
        systemMessage: true
      });

      // Notify Admin
      for (const admin of admins) {
        await Notification.create({
          user: admin._id,
          sender: req.user._id,
          title: 'Quote Accepted',
          message: `${req.user.name} accepted the quote for "${request.title}"`,
          type: 'request_status',
          link: `/admin/projects`,
        });
      }

      return res.status(200).json({ success: true, message: 'Quote accepted. Project generated.', project });
    } else {
      request.status = 'declined';
      request.clientNotes = clientNotes || 'Declined by client';
      await request.save();

      // Notify Admin
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await Notification.create({
          user: admin._id,
          sender: req.user._id,
          title: 'Quote Declined',
          message: `${req.user.name} declined the quote for "${request.title}"`,
          type: 'request_status',
          link: `/admin/requests`,
        });
      }

      return res.status(200).json({ success: true, message: 'Quote declined.' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// ADMIN ACTIONS
// ==========================================

// @desc    Get all Project Requests
// @route   GET /api/admin/requests
// @access  Protected (Admin only)
export const getAllRequests = async (req, res) => {
  try {
    const requests = await ProjectRequest.find({})
      .populate('client', 'name email avatar company')
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, requests });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit Quote for a Project Request
// @route   POST /api/admin/requests/:id/quote
// @access  Protected (Admin only)
export const quoteRequest = async (req, res) => {
  const { quoteAmount, adminNotes } = req.body;

  try {
    const request = await ProjectRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    request.quoteAmount = quoteAmount;
    request.adminNotes = adminNotes || '';
    request.status = 'quoted';
    await request.save();

    // Notify Client
    await Notification.create({
      user: request.client,
      sender: req.user._id,
      title: 'Quote Received',
      message: `You received a quote of ₹${quoteAmount} for your request: "${request.title}"`,
      type: 'request_status',
      link: `/dashboard`,
    });

    // Create system message log
    await Message.create({
      sender: req.user._id,
      recipient: request.client,
      content: `Quote of ₹${quoteAmount} has been offered for "${request.title}". Details: ${adminNotes || 'N/A'}.`,
      systemMessage: true
    });

    return res.status(200).json({ success: true, request });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Project status
// @route   PUT /api/admin/projects/:id/status
// @access  Protected (Admin only)
export const updateProjectStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project.status = status;
    await project.save();

    // Notify Client
    await Notification.create({
      user: project.client,
      sender: req.user._id,
      title: 'Project Status Updated',
      message: `Project "${project.title}" status changed to ${status.replace('_', ' ')}`,
      type: 'project_status',
      link: `/dashboard/project/${project._id}`,
    });

    // Create system message
    await Message.create({
      sender: req.user._id,
      recipient: project.client,
      content: `Project status changed to: ${status.toUpperCase().replace('_', ' ')}`,
      systemMessage: true
    });

    return res.status(200).json({ success: true, project });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Project Milestones (Mark completed/add)
// @route   PUT /api/admin/projects/:id/milestones
// @access  Protected (Admin only)
export const updateMilestones = async (req, res) => {
  const { milestones } = req.body; // Array of milestone objects

  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project.milestones = milestones;
    await project.save();

    // Notify Client
    await Notification.create({
      user: project.client,
      sender: req.user._id,
      title: 'Milestones Updated',
      message: `Project milestones for "${project.title}" have been updated.`,
      type: 'project_status',
      link: `/dashboard/project/${project._id}`,
    });

    return res.status(200).json({ success: true, project });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload Project Deliverable
// @route   POST /api/admin/projects/:id/deliverable
// @access  Protected (Admin only)
export const uploadDeliverable = async (req, res) => {
  const { title, description } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const deliverable = {
      title,
      description: description || '',
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      uploadedAt: new Date(),
    };

    project.deliverables.push(deliverable);
    await project.save();

    // Notify Client
    await Notification.create({
      user: project.client,
      sender: req.user._id,
      title: 'Deliverable Uploaded',
      message: `A new deliverable "${title}" has been uploaded for "${project.title}"`,
      type: 'project_status',
      link: `/dashboard/project/${project._id}`,
    });

    // Message Log
    await Message.create({
      sender: req.user._id,
      recipient: project.client,
      content: `Deliverable uploaded: "${title}". File: ${req.file.originalname}`,
      systemMessage: true
    });

    return res.status(200).json({ success: true, project });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate a custom Invoice
// @route   POST /api/admin/projects/:id/invoice
// @access  Protected (Admin only)
export const generateInvoice = async (req, res) => {
  const { amount, dueDate } = req.body;

  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const newInvoice = {
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      amount,
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'unpaid'
    };

    project.invoices.push(newInvoice);
    await project.save();

    // Notify Client
    await Notification.create({
      user: project.client,
      sender: req.user._id,
      title: 'New Invoice Issued',
      message: `Invoice ${newInvoice.invoiceNumber} for ₹${amount} has been generated.`,
      type: 'payment',
      link: `/dashboard/project/${project._id}`,
    });

    return res.status(200).json({ success: true, project });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get All Projects (Admin overview)
// @route   GET /api/admin/projects
// @access  Protected (Admin only)
export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({})
      .populate('client', 'name email avatar company')
      .sort({ updatedAt: -1 });
    return res.status(200).json({ success: true, projects });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
