import React, { useEffect, useState } from 'react';
import { Briefcase, Plus, Edit, Trash, Star } from 'lucide-react';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import API_BASE from '../../utils/apiBase';

export const AdminPortfolio = () => {
  const { toast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProj, setEditingProj] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'web_development',
    problem: '',
    solution: '',
    technologies: '',
    results: '',
    coverImage: '',
    gallery: '',
    isFeatured: false,
    liveUrl: '',
    githubUrl: '',
    clientName: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchPortfolio = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/portfolio`);
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects);
      }
    } catch (err) {
      console.error('Error fetching admin portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleOpenCreate = () => {
    setEditingProj(null);
    setForm({
      title: '',
      description: '',
      category: 'web_development',
      problem: '',
      solution: '',
      technologies: '',
      results: '',
      coverImage: '',
      gallery: '',
      isFeatured: false,
      liveUrl: '',
      githubUrl: '',
      clientName: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (proj) => {
    setEditingProj(proj);
    setForm({
      title: proj.title,
      description: proj.description,
      category: proj.category,
      problem: proj.problem,
      solution: proj.solution,
      technologies: proj.technologies.join(', '),
      results: proj.results.join('\n'),
      coverImage: proj.coverImage,
      gallery: proj.gallery.join(', '),
      isFeatured: proj.isFeatured,
      liveUrl: proj.liveUrl || '',
      githubUrl: proj.githubUrl || '',
      clientName: proj.clientName || '',
    });
    setModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      ...form,
      technologies: form.technologies.split(',').map((t) => t.trim()).filter(Boolean),
      results: form.results.split('\n').map((r) => r.trim()).filter(Boolean),
      gallery: form.gallery.split(',').map((g) => g.trim()).filter(Boolean),
    };

    try {
      let res, data;
      if (editingProj) {
        res = await fetch(`${API_BASE}/api/portfolio/${editingProj._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_BASE}/api/portfolio`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      data = await res.json();
      setSubmitting(false);
      setModalOpen(false);

      if (data.success) {
        toast(`Case study ${editingProj ? 'updated' : 'created'} successfully`, 'success');
        fetchPortfolio();
      } else {
        toast(data.message || 'Action failed', 'error');
      }
    } catch (err) {
      toast('Server error during CMS actions', 'error');
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this portfolio project?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/portfolio/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast('Portfolio project deleted', 'success');
        fetchPortfolio();
      }
    } catch (err) {
      toast('Error deleting project', 'error');
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
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 font-heading">Portfolio CMS Manager</h1>
          <p className="text-xs text-slate-500 mt-1">
            Display detailed case studies, technical summaries, and live demo routes.
          </p>
        </div>
        <Button size="sm" onClick={handleOpenCreate} icon={<Plus className="w-4 h-4" />}>
          Add Showcase Work
        </Button>
      </div>

      {/* Table grid */}
      {projects.length > 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Client Name</th>
                  <th className="px-6 py-4">Featured</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                {projects.map((proj) => (
                  <tr key={proj._id} className="hover:bg-slate-55/20">
                    <td className="px-6 py-4 font-bold text-slate-800 max-w-[200px] truncate">{proj.title}</td>
                    <td className="px-6 py-4 uppercase tracking-wider text-[10px] text-slate-400">
                      {proj.category.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-500">{proj.clientName || 'Confidential'}</td>
                    <td className="px-6 py-4">
                      {proj.isFeatured ? (
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0 animate-pulse" />
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleOpenEdit(proj)}
                          className="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-500 transition-colors shrink-0"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(proj._id)}
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
          No portfolio items compiled yet. Add one above!
        </div>
      )}

      {/* Editor Modal */}
      {modalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setModalOpen(false)}
          title={editingProj ? `Edit Case Study: ${editingProj.title}` : 'Add New Portfolio Project'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Case Title"
                name="title"
                required
                value={form.title}
                onChange={handleFormChange}
                placeholder="e.g. Pizza Palace"
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
                </select>
              </div>
            </div>

            <Input
              label="Brief Summary"
              name="description"
              required
              value={form.description}
              onChange={handleFormChange}
              placeholder="Short elevator pitch displayed on list card..."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Cover Image URL"
                name="coverImage"
                required
                value={form.coverImage}
                onChange={handleFormChange}
                placeholder="https://unsplash.com/..."
              />
              <Input
                label="Client Name"
                name="clientName"
                value={form.clientName}
                onChange={handleFormChange}
                placeholder="e.g. Pizza Palace Franchise Ltd."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Live Demo URL"
                name="liveUrl"
                value={form.liveUrl}
                onChange={handleFormChange}
                placeholder="https://pizza-palace.example.com"
              />
              <Input
                label="GitHub Codebase URL"
                name="githubUrl"
                value={form.githubUrl}
                onChange={handleFormChange}
                placeholder="https://github.com/..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Technologies (Comma separated)"
                name="technologies"
                required
                value={form.technologies}
                onChange={handleFormChange}
                placeholder="React, Express, Socket.io"
              />
              <Input
                label="Gallery Screenshots (Comma separated)"
                name="gallery"
                value={form.gallery}
                onChange={handleFormChange}
                placeholder="https://img1.com, https://img2.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <Input
                label="The Problem Description"
                name="problem"
                required
                textarea
                rows={3}
                value={form.problem}
                onChange={handleFormChange}
                placeholder="What bottlenecks did the client face?"
              />
              <Input
                label="The Solution Description"
                name="solution"
                required
                textarea
                rows={3}
                value={form.solution}
                onChange={handleFormChange}
                placeholder="How did you implement software/creative tools to solve it?"
              />
            </div>

            <Input
              label="Key Results & Achievements (Line separated)"
              name="results"
              required
              textarea
              rows={3}
              value={form.results}
              onChange={handleFormChange}
              placeholder="e.g. Boosted Direct Sales by 42%&#10;Reduced latency by 18 minutes"
            />

            <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-150 rounded-2xl cursor-pointer hover:bg-slate-100/40 transition-colors">
              <input
                type="checkbox"
                name="isFeatured"
                checked={form.isFeatured}
                onChange={handleFormChange}
                className="w-4 h-4 text-secondary rounded border-slate-300 focus:ring-secondary shrink-0"
              />
              <div>
                <p className="text-xs font-bold text-slate-700">Mark as Featured Project</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Displays with visual highlight layouts on landing showcase modules</p>
              </div>
            </label>

            <div className="flex gap-3 justify-end pt-2">
              <Button type="submit" loading={submitting}>
                Save Showcase Project
              </Button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};

export default AdminPortfolio;
