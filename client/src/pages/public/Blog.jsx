import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, User, Clock, ArrowRight } from 'lucide-react';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import Input from '../../components/common/Input';

export const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        let query = `/api/blogs?includeDrafts=false`;
        if (search) query += `&search=${search}`;
        if (category) query += `&category=${category}`;
        const res = await fetch(query);
        const data = await res.json();
        if (data.success) {
          setBlogs(data.posts);
        }
      } catch (err) {
        console.error('Error fetching blogs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [search, category]);

  const categories = [
    { label: 'All Tech', value: '' },
    { label: 'Web Dev', value: 'web_development' },
    { label: 'Video Production', value: 'video_editing' },
    { label: 'Freelance Life', value: 'freelance' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs uppercase tracking-widest text-secondary font-bold mb-2 block">Insights & Guides</span>
        <h1 className="text-4xl md:text-6xl font-extrabold text-primary">ClientBridge Blog</h1>
        <p className="text-slate-500 text-sm md:text-base mt-4 leading-relaxed">
          Actionable tutorials and case studies on scaling software platforms and optimizing brand layouts.
        </p>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row gap-6 mb-16 items-center justify-between">
        
        {/* Category filters */}
        <div className="flex gap-2.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 border transition-all ${
                category === cat.value
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white text-slate-500 border-slate-200/60 hover:text-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input bar */}
        <div className="w-full md:w-80 relative shrink-0">
          <Input
            placeholder="Search article title or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>

      </div>

      {/* Blogs listing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {loading ? (
          <SkeletonLoader type="card" count={3} />
        ) : blogs.length > 0 ? (
          blogs.map((post) => (
            <Link
              key={post._id}
              to={`/blog/${post.slug}`}
              className="glass-card rounded-2xl overflow-hidden border-slate-200/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="aspect-video relative overflow-hidden bg-slate-100">
                  <img
                    src={post.coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=600&auto=format&fit=crop'}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  />
                  <span className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">
                    {post.category.replace('_', ' ')}
                  </span>
                </div>

                <div className="p-6">
                  {/* Meta items */}
                  <div className="flex gap-4 text-[10px] text-slate-400 font-semibold mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime} min read
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 leading-snug group-hover:text-secondary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-slate-500 text-xs mt-2 leading-relaxed line-clamp-2">
                    {post.summary}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-slate-50 mt-4 flex items-center justify-between text-xs font-bold text-secondary">
                <span>Read Full Article</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-3 text-center py-20 text-slate-400 font-medium text-sm">
            No articles found matching filters
          </div>
        )}
      </div>

    </div>
  );
};

export default Blog;
