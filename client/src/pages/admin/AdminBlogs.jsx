import React, { useEffect, useState } from 'react';
import { FileText, Plus, Edit, Trash, Eye } from 'lucide-react';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';

export const AdminBlogs = () => {
  const { toast } = useToast();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  
  const [form, setForm] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'web_development',
    tags: '',
    coverImage: '',
    status: 'draft',
    readTime: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchBlogs = async () => {
    try {
      const res = await fetch('/api/blogs?includeDrafts=true');
      const data = await res.json();
      if (data.success) {
        setBlogs(data.posts);
      }
    } catch (err) {
      console.error('Error fetching admin blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleOpenCreate = () => {
    setEditingPost(null);
    setForm({
      title: '',
      summary: '',
      content: '',
      category: 'web_development',
      tags: '',
      coverImage: '',
      status: 'draft',
      readTime: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (post) => {
    setEditingPost(post);
    setForm({
      title: post.title,
      summary: post.summary,
      content: post.content,
      category: post.category,
      tags: post.tags.join(', '),
      coverImage: post.coverImage,
      status: post.status,
      readTime: post.readTime,
    });
    setModalOpen(true);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      readTime: Number(form.readTime) || undefined,
    };

    try {
      let res, data;
      if (editingPost) {
        res = await fetch(`/api/blogs/${editingPost._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/blogs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      data = await res.json();
      setSubmitting(false);
      setModalOpen(false);

      if (data.success) {
        toast(`Article ${editingPost ? 'updated' : 'created'} successfully`, 'success');
        fetchBlogs();
      } else {
        toast(data.message || 'Action failed', 'error');
      }
    } catch (err) {
      toast('Server error during CMS actions', 'error');
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this article?')) return;
    try {
      const res = await fetch(`/api/blogs/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast('Article deleted successfully', 'success');
        fetchBlogs();
      }
    } catch (err) {
      toast('Error deleting post', 'error');
    }
  };

  if (loading) {
    return <SkeletonLoader type="list" count={3} />;
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 font-heading">Blog CMS Manager</h1>
          <p className="text-xs text-slate-500 mt-1">
            Write guides, publish tech reports, and optimize article listings.
          </p>
        </div>
        <Button size="sm" onClick={handleOpenCreate} icon={<Plus className="w-4 h-4" />}>
          Write New Post
        </Button>
      </div>

      {/* Table grid */}
      {blogs.length > 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Read Time</th>
                  <th className="px-6 py-4">Views</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                {blogs.map((post) => (
                  <tr key={post._id} className="hover:bg-slate-55/20">
                    <td className="px-6 py-4 font-bold text-slate-800 max-w-[240px] truncate">{post.title}</td>
                    <td className="px-6 py-4 uppercase tracking-wider text-[10px] text-slate-400">
                      {post.category.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-500">{post.readTime} min</td>
                    <td className="px-6 py-4 font-bold text-slate-700 flex items-center gap-1.5 pt-4">
                      <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {post.views}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${
                        post.status === 'published'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50'
                          : 'bg-slate-50 text-slate-500 border-slate-150'
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleOpenEdit(post)}
                          className="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-500 transition-colors shrink-0"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(post._id)}
                          className="p-1.5 border border-rose-100 hover:bg-rose-50 rounded-xl text-rose-500 transition-colors shrink-0"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-slate-200 rounded-2xl bg-white text-slate-400 font-medium text-xs">
          No articles written yet. Write one above!
        </div>
      )}

      {/* Editor Modal */}
      {modalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setModalOpen(false)}
          title={editingPost ? `Edit Post: ${editingPost.title}` : 'Write New Article'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Article Title"
                name="title"
                required
                value={form.title}
                onChange={handleFormChange}
                placeholder="e.g. Master React Context in 5 Steps"
              />
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-800 text-xs focus:bg-white focus:ring-2 focus:ring-secondary/20"
                >
                  <option value="web_development">Web Development</option>
                  <option value="video_editing">Video Editing</option>
                  <option value="freelance">Freelance Life</option>
                </select>
              </div>
            </div>

            <Input
              label="Short Summary"
              name="summary"
              required
              value={form.summary}
              onChange={handleFormChange}
              placeholder="Brief summary displayed on listings..."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Cover Image URL"
                name="coverImage"
                value={form.coverImage}
                onChange={handleFormChange}
                placeholder="https://unsplash.com/..."
              />
              <Input
                label="Tags (Comma separated)"
                name="tags"
                value={form.tags}
                onChange={handleFormChange}
                placeholder="react, context, frontend"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Publishing Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-800 text-xs focus:bg-white focus:ring-2 focus:ring-secondary/20"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <Input
                label="Read Time (Minutes)"
                name="readTime"
                type="number"
                value={form.readTime}
                onChange={handleFormChange}
                placeholder="Auto-calculated if empty"
              />
            </div>

            <Input
              label="Article Markdown Content"
              name="content"
              required
              textarea
              rows={8}
              value={form.content}
              onChange={handleFormChange}
              placeholder="Write detailed tutorials or design updates here..."
            />

            <div className="flex gap-3 justify-end pt-2">
              <Button type="submit" loading={submitting}>
                Save Article
              </Button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};

export default AdminBlogs;
