import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, Clock, ArrowLeft, Eye, Tag } from 'lucide-react';
import SkeletonLoader from '../../components/common/SkeletonLoader';

export const BlogDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogPost = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/blogs/${slug}`);
        const data = await res.json();
        if (data.success) {
          setPost(data.post);
        }
      } catch (err) {
        console.error('Error fetching blog details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-24">
        <SkeletonLoader type="text" count={2} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Article Not Found</h2>
        <p className="text-slate-500 text-sm">The article you are searching for might have been draft-saved or deleted.</p>
        <Link to="/blog" className="text-secondary hover:underline font-semibold text-sm inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to blog list
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-6 py-12 md:py-20">
      
      {/* Back button */}
      <Link to="/blog" className="text-xs text-slate-400 hover:text-primary transition-colors font-bold inline-flex items-center gap-1.5 mb-8">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to articles
      </Link>

      {/* Category banner */}
      <span className="text-[10px] uppercase tracking-widest bg-secondary/10 text-secondary border border-secondary/20 px-3 py-1 rounded-full font-extrabold inline-block mb-4">
        {post.category.replace('_', ' ')}
      </span>

      {/* Title */}
      <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-primary">
        {post.title}
      </h1>

      {/* Meta details */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-400 font-semibold my-6 py-4 border-y border-slate-100 items-center justify-between">
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5">
            <User className="w-4 h-4 text-slate-300" />
            {post.author}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-300" />
            {new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-300" />
            {post.readTime} min read
          </span>
        </div>
        <span className="flex items-center gap-1 text-[11px]">
          <Eye className="w-3.5 h-3.5 text-slate-350" />
          {post.views} views
        </span>
      </div>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="rounded-2xl overflow-hidden shadow-md bg-slate-50 aspect-video mb-10 border border-slate-100">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Article content markup */}
      <div className="prose prose-slate max-w-none text-slate-700 text-sm md:text-base leading-relaxed space-y-6">
        {post.content.split('\n\n').map((para, i) => (
          <p key={i} className="whitespace-pre-line">{para}</p>
        ))}
      </div>

      {/* Tags list */}
      {post.tags && post.tags.length > 0 && (
        <div className="mt-12 pt-6 border-t border-slate-100 flex gap-2 items-center">
          <Tag className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <span key={tag} className="text-[10px] bg-slate-50 border border-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

    </article>
  );
};

export default BlogDetail;
