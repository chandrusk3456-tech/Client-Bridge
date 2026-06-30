import PortfolioProject from '../models/PortfolioProject.js';

// Helper to generate slug
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// @desc    Get all portfolio projects (supports filtering by category)
// @route   GET /api/portfolio
// @access  Public
export const getPortfolio = async (req, res) => {
  const { category, featuredOnly } = req.query;

  try {
    let query = {};
    if (category) {
      query.category = category;
    }
    if (featuredOnly === 'true') {
      query.isFeatured = true;
    }

    const projects = await PortfolioProject.find(query).sort({ createdAt: -1 });

    // Seed "Pizza Palace" dynamically if the DB is empty
    if (projects.length === 0 && !category && featuredOnly !== 'true') {
      const pizzaPalace = await seedPizzaPalace();
      if (pizzaPalace) {
        return res.status(200).json({ success: true, count: 1, projects: [pizzaPalace] });
      }
    }

    return res.status(200).json({ success: true, count: projects.length, projects });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Seed function for Pizza Palace
const seedPizzaPalace = async () => {
  try {
    const existing = await PortfolioProject.findOne({ slug: 'pizza-palace' });
    if (existing) return existing;

    return await PortfolioProject.create({
      title: 'Pizza Palace',
      slug: 'pizza-palace',
      description: 'A premium, high-speed SaaS online ordering and table reservation platform for a luxury pizzeria brand, built using the full MERN stack.',
      category: 'web_development',
      problem: 'The client needed to migrate from manual phone orders and third-party delivery aggregators (which cut up to 30% of their margins) to a fully brand-owned, real-time online ordering and dispatch tracking solution that could handle high-concurrency peak weekend orders and live kitchen queue rendering.',
      solution: 'We engineered a localized, geofenced real-time menu management system with optimized cart operations, an elegant dark-theme customer storefront, and a responsive kitchen dashboard displaying ticket pipelines using Socket.io. Integrated automated Stripe/Razorpay checkouts and optimized load capacity to support 1500+ orders/min.',
      technologies: ['MongoDB', 'Express.js', 'React.js', 'Node.js', 'Tailwind CSS', 'Socket.io', 'Framer Motion', 'Redux Toolkit'],
      results: [
        'Boosted direct web revenues by 42% in the first quarter of deployment.',
        'Reduced delivery delays by 18 minutes average through SMS and real-time live routing alerts.',
        'Eliminated aggregator commissions completely, saving over ₹3.4 Lakhs in the first month.',
        'Secured table reservations system showing zero overlapping schedules.'
      ],
      coverImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1200&auto=format&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1590947132387-155cc02f3212?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=800&auto=format&fit=crop'
      ],
      isFeatured: true,
      liveUrl: 'https://pizza-palace-demo.example.com',
      githubUrl: 'https://github.com/charlie/pizza-palace',
      clientName: 'Pizza Palace Pizzeria Ltd.',
    });
  } catch (error) {
    console.error('Error seeding Pizza Palace:', error.message);
    return null;
  }
};

// @desc    Get single portfolio project by slug
// @route   GET /api/portfolio/:slug
// @access  Public
export const getPortfolioBySlug = async (req, res) => {
  try {
    let project = await PortfolioProject.findOne({ slug: req.params.slug });
    if (!project) {
      if (req.params.slug === 'pizza-palace') {
        project = await seedPizzaPalace();
      }
      if (!project) {
        return res.status(404).json({ success: false, message: 'Portfolio project not found' });
      }
    }
    return res.status(200).json({ success: true, project });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new portfolio project
// @route   POST /api/portfolio
// @access  Protected (Admin only)
export const createPortfolioProject = async (req, res) => {
  const { title, description, category, problem, solution, technologies, results, coverImage, gallery, isFeatured, liveUrl, githubUrl, videoUrl, clientName } = req.body;

  try {
    const slug = generateSlug(title);
    
    // Check if slug is unique
    const existing = await PortfolioProject.findOne({ slug });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Portfolio item with a similar title already exists' });
    }

    const project = await PortfolioProject.create({
      title,
      slug,
      description,
      category,
      problem,
      solution,
      technologies: technologies || [],
      results: results || [],
      coverImage,
      gallery: gallery || [],
      isFeatured: isFeatured || false,
      liveUrl: liveUrl || '',
      githubUrl: githubUrl || '',
      videoUrl: videoUrl || '',
      clientName: clientName || '',
    });

    return res.status(201).json({ success: true, project });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update portfolio project
// @route   PUT /api/portfolio/:id
// @access  Protected (Admin only)
export const updatePortfolioProject = async (req, res) => {
  const { title, description, category, problem, solution, technologies, results, coverImage, gallery, isFeatured, liveUrl, githubUrl, videoUrl, clientName } = req.body;

  try {
    const project = await PortfolioProject.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Portfolio project not found' });
    }

    project.title = title || project.title;
    project.description = description || project.description;
    project.category = category || project.category;
    project.problem = problem || project.problem;
    project.solution = solution || project.solution;
    project.technologies = technologies || project.technologies;
    project.results = results || project.results;
    project.coverImage = coverImage || project.coverImage;
    project.gallery = gallery || project.gallery;
    project.isFeatured = isFeatured !== undefined ? isFeatured : project.isFeatured;
    project.liveUrl = liveUrl || project.liveUrl;
    project.githubUrl = githubUrl || project.githubUrl;
    project.videoUrl = videoUrl || project.videoUrl;
    project.clientName = clientName || project.clientName;

    if (title) {
      project.slug = generateSlug(title);
    }

    await project.save();
    return res.status(200).json({ success: true, project });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete portfolio project
// @route   DELETE /api/portfolio/:id
// @access  Protected (Admin only)
export const deletePortfolioProject = async (req, res) => {
  try {
    const project = await PortfolioProject.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Portfolio project not found' });
    }
    return res.status(200).json({ success: true, message: 'Portfolio project deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
