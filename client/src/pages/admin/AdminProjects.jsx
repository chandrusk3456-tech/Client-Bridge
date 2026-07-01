import React, { useEffect, useState } from 'react';
import { FolderKanban, Plus, Check, Clock, Upload, ArrowRight, DollarSign } from 'lucide-react';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import API_BASE from '../../utils/apiBase';

export const AdminProjects = () => {
  const { toast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProj, setSelectedProj] = useState(null);

  // Sub-actions states
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusVal, setStatusVal] = useState('');

  const [uploadingDel, setUploadingDel] = useState(false);
  const [delForm, setDelForm] = useState({ title: '', description: '', file: null });

  const [generatingInv, setGeneratingInv] = useState(false);
  const [invForm, setInvForm] = useState({ amount: '', dueDate: '' });

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/projects/admin/projects`);
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects);
      }
    } catch (err) {
      console.error('Error fetching admin projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenProjModal = (proj) => {
    setSelectedProj(proj);
    setStatusVal(proj.status);
  };

  const handleStatusChange = async () => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/projects/admin/projects/${selectedProj._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusVal }),
      });
      const data = await res.json();
      setUpdatingStatus(false);
      if (data.success) {
        toast(`Status updated to ${statusVal}`, 'success');
        setSelectedProj(data.project);
        fetchProjects();
      } else {
        toast(data.message || 'Status update failed', 'error');
      }
    } catch (err) {
      toast('Error updating status', 'error');
      setUpdatingStatus(false);
    }
  };

  const handleMilestoneToggle = async (milestoneId) => {
    const updatedMilestones = selectedProj.milestones.map((m) => {
      if (m._id === milestoneId) {
        const nextState = !m.completed;
        return {
          ...m,
          completed: nextState,
          completedAt: nextState ? new Date() : null,
        };
      }
      return m;
    });

    try {
      const res = await fetch(`/api/projects/admin/projects/${selectedProj._id}/milestones`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestones: updatedMilestones }),
      });
      const data = await res.json();
      if (data.success) {
        toast('Milestone state toggled successfully', 'success');
        setSelectedProj(data.project);
        fetchProjects();
      }
    } catch (err) {
      toast('Error toggling milestone', 'error');
    }
  };

  const handleDeliverableUpload = async (e) => {
    e.preventDefault();
    if (!delForm.file) return;

    setUploadingDel(true);
    const formData = new FormData();
    formData.append('file', delForm.file);
    formData.append('title', delForm.title);
    formData.append('description', delForm.description);

    try {
      const res = await fetch(`/api/projects/admin/projects/${selectedProj._id}/deliverable`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setUploadingDel(false);
      if (data.success) {
        toast('Deliverable asset uploaded cleanly!', 'success');
        setSelectedProj(data.project);
        setDelForm({ title: '', description: '', file: null });
        fetchProjects();
      } else {
        toast(data.message || 'Upload failed', 'error');
      }
    } catch (err) {
      toast('Error uploading deliverable', 'error');
      setUploadingDel(false);
    }
  };

  const handleInvoiceCreate = async (e) => {
    e.preventDefault();
    setGeneratingInv(true);
    try {
      const res = await fetch(`/api/projects/admin/projects/${selectedProj._id}/invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(invForm.amount),
          dueDate: invForm.dueDate,
        }),
      });
      const data = await res.json();
      setGeneratingInv(false);
      if (data.success) {
        toast('New unpaid invoice generated successfully!', 'success');
        setSelectedProj(data.project);
        setInvForm({ amount: '', dueDate: '' });
        fetchProjects();
      } else {
        toast(data.message || 'Invoice failed', 'error');
      }
    } catch (err) {
      toast('Error generating invoice', 'error');
      setGeneratingInv(false);
    }
  };

  if (loading) {
    return <SkeletonLoader type="list" count={3} />;
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 font-heading">Active Workflows</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor milestone states, dispatch deliverables, and generate billings.
        </p>
      </div>

      {/* Grid */}
      {projects.length > 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Project Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Amount Paid</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                {projects.map((proj) => (
                  <tr key={proj._id} className="hover:bg-slate-50/40">
                    <td className="px-6 py-4 font-bold text-slate-800">{proj.client?.name}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700 max-w-[200px] truncate">{proj.title}</td>
                    <td className="px-6 py-4 uppercase tracking-wider text-[10px] text-slate-400">
                      {proj.category.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      ₹{proj.paidAmount} / ₹{proj.quoteAmount}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${
                        proj.status === 'in_progress'
                          ? 'bg-blue-50 text-blue-600 border-blue-100/50 animate-pulse'
                          : proj.status === 'completed' || proj.status === 'delivered'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50'
                          : 'bg-amber-50 text-amber-600 border-amber-100/50'
                      }`}>
                        {proj.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenProjModal(proj)}
                      >
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-slate-200 rounded-2xl bg-white text-slate-400 font-medium text-xs">
          No active projects found
        </div>
      )}

      {/* Project detail management modal */}
      {selectedProj && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedProj(null)}
          title={`Manage Project: ${selectedProj.title}`}
          size="lg"
        >
          <div className="space-y-8">
            
            {/* Status change block */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col sm:flex-row items-center gap-4 justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-700">Project Status Guard</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Toggle overall project workflow status</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl outline-none text-xs text-slate-700"
                >
                  <option value="pending">Pending</option>
                  <option value="quoted">Quoted</option>
                  <option value="paid">Paid</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="delivered">Delivered</option>
                </select>
                <Button
                  size="sm"
                  loading={updatingStatus}
                  onClick={handleStatusChange}
                >
                  Apply
                </Button>
              </div>
            </div>

            {/* Milestones checkmarks */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Milestones Checklist</h4>
              <div className="space-y-2.5">
                {selectedProj.milestones && selectedProj.milestones.map((m) => (
                  <label key={m._id} className="flex gap-3 items-start p-3 bg-white border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={m.completed}
                      onChange={() => handleMilestoneToggle(m._id)}
                      className="mt-0.5 w-4 h-4 text-secondary rounded border-slate-300 focus:ring-secondary shrink-0"
                    />
                    <div>
                      <p className={`text-xs font-bold ${m.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                        {m.title}
                      </p>
                      <p className="text-[10px] text-slate-450 mt-0.5">{m.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-100">
              
              {/* Deliverable upload form */}
              <form onSubmit={handleDeliverableUpload} className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-secondary" /> Upload Deliverable
                </h4>
                <Input
                  label="Deliverable Title"
                  required
                  value={delForm.title}
                  onChange={(e) => setDelForm({ ...delForm, title: e.target.value })}
                  placeholder="e.g. Prototype Draft, Final Render Zip"
                />
                <Input
                  label="Short Description"
                  textarea
                  rows={2}
                  value={delForm.description}
                  onChange={(e) => setDelForm({ ...delForm, description: e.target.value })}
                  placeholder="Describe files content..."
                />
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">File Asset</label>
                  <input
                    type="file"
                    required
                    onChange={(e) => setDelForm({ ...delForm, file: e.target.files[0] })}
                    className="text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-secondary hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>
                <Button
                  type="submit"
                  loading={uploadingDel}
                  className="w-full justify-center text-xs py-2"
                >
                  Upload File Deliverable
                </Button>
              </form>

              {/* Invoice generation form */}
              <form onSubmit={handleInvoiceCreate} className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-500" /> Issue Custom Invoice
                </h4>
                <Input
                  label="Invoice Amount (₹)"
                  type="number"
                  required
                  value={invForm.amount}
                  onChange={(e) => setInvForm({ ...invForm, amount: e.target.value })}
                  placeholder="e.g. 15000"
                />
                <Input
                  label="Due Date"
                  type="date"
                  required
                  value={invForm.dueDate}
                  onChange={(e) => setInvForm({ ...invForm, dueDate: e.target.value })}
                />
                <Button
                  type="submit"
                  loading={generatingInv}
                  className="w-full justify-center text-xs py-2"
                >
                  Generate Invoice
                </Button>
              </form>

            </div>

          </div>
        </Modal>
      )}

    </div>
  );
};

export default AdminProjects;
