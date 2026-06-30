import mongoose from 'mongoose';

const projectRequestSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
    },
    category: {
      type: String,
      enum: ['web_development', 'video_editing'],
      required: true,
    },
    budget: {
      type: String,
      required: true, // e.g. "$1,000 - $3,000", "$5,000+", etc.
    },
    timeline: {
      type: String, // e.g. "1 month", "2-3 months", "Urgent"
      required: true,
    },
    requirements: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'quoted', 'accepted', 'declined'],
      default: 'pending',
    },
    quoteAmount: {
      type: Number,
      default: 0,
    },
    adminNotes: {
      type: String,
    },
    clientNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const ProjectRequest = mongoose.model('ProjectRequest', projectRequestSchema);
export default ProjectRequest;
