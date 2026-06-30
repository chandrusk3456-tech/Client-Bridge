import BlogPost from '../models/BlogPost.js';

// Helper to generate slug
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// @desc    Get all blog posts (supports search, category, tag, status filters)
// @route   GET /api/blogs
// @access  Public
export const getBlogs = async (req, res) => {
  const { search, category, tag, includeDrafts } = req.query;

  try {
    let query = {};

    // Filter by status (public sees only published, admin can see drafts)
    if (includeDrafts === 'true' && req.user && req.user.role === 'admin') {
      // Allow draft checking
    } else {
      query.status = 'published';
    }

    // Filter by Category
    if (category) {
      query.category = { $regex: new RegExp(category, 'i') };
    }

    // Filter by Tag
    if (tag) {
      query.tags = tag;
    }

    // Filter by Search Query (Title/Summary)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const posts = await BlogPost.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: posts.length, posts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single blog post by slug
// @route   GET /api/blogs/:slug
// @access  Public
export const getBlogBySlug = async (req, res) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    // Increment view count asynchronously
    post.views += 1;
    await post.save();

    return res.status(200).json({ success: true, post });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new blog post
// @route   POST /api/blogs
// @access  Protected (Admin only)
export const createBlog = async (req, res) => {
  const { title, content, summary, category, tags, coverImage, status, readTime } = req.body;

  try {
    const slug = generateSlug(title);
    
    // Check if slug is unique
    const existing = await BlogPost.findOne({ slug });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Blog post with a similar title already exists' });
    }

    const post = await BlogPost.create({
      title,
      slug,
      content,
      summary,
      category,
      tags: tags || [],
      coverImage: coverImage || '',
      status: status || 'draft',
      readTime: readTime || Math.ceil(content.split(' ').length / 200), // ~200 WPM reading speed
      author: req.user.name || 'Admin',
    });

    return res.status(201).json({ success: true, post });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update blog post
// @route   PUT /api/blogs/:id
// @access  Protected (Admin only)
export const updateBlog = async (req, res) => {
  const { title, content, summary, category, tags, coverImage, status, readTime } = req.body;

  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.summary = summary || post.summary;
    post.category = category || post.category;
    post.tags = tags || post.tags;
    post.coverImage = coverImage || post.coverImage;
    post.status = status || post.status;
    post.readTime = readTime || (content ? Math.ceil(content.split(' ').length / 200) : post.readTime);

    if (title) {
      post.slug = generateSlug(title);
    }

    await post.save();
    return res.status(200).json({ success: true, post });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete blog post
// @route   DELETE /api/blogs/:id
// @access  Protected (Admin only)
export const deleteBlog = async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }
    return res.status(200).json({ success: true, message: 'Blog post deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
