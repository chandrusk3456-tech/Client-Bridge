import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  targetDate: { type: Date },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
});

const deliverableSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  fileUrl: { type: String, required: true },
  fileName: { type: String },
  uploadedAt: { type: Date, default: Date.now },
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date },
  status: { type: String, enum: ['unpaid', 'paid', 'cancelled'], default: 'unpaid' },
  paidAt: { type: Date },
});

const projectSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    projectRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProjectRequest',
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
    quoteAmount: {
      type: Number,
      default: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'quoted', 'paid', 'in_progress', 'completed', 'delivered'],
      default: 'pending',
    },
    milestones: [milestoneSchema],
    deliverables: [deliverableSchema],
    invoices: [invoiceSchema],
    startDate: { type: Date },
    endDate: { type: Date },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model('Project', projectSchema);
export default Project;
