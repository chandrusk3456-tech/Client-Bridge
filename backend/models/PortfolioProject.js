import mongoose from 'mongoose';

const portfolioProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Portfolio project title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Short description is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['web_development', 'video_editing'],
      required: true,
    },
    problem: {
      type: String,
      required: [true, 'Problem description is required'],
    },
    solution: {
      type: String,
      required: [true, 'Solution description is required'],
    },
    technologies: [
      {
        type: String,
        trim: true,
      },
    ],
    results: [
      {
        type: String,
        trim: true,
      },
    ],
    coverImage: {
      type: String,
      required: true,
    },
    gallery: [
      {
        type: String, // Additional screenshot/render URLs
      },
    ],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    liveUrl: {
      type: String,
      trim: true,
    },
    githubUrl: {
      type: String,
      trim: true,
    },
    videoUrl: {
      type: String, // For video editing highlights
      trim: true,
    },
    clientName: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const PortfolioProject = mongoose.model('PortfolioProject', portfolioProjectSchema);
export default PortfolioProject;
