import React, { useEffect, useState } from 'react';
import { FileText, Clock, FilePlus, ChevronRight } from 'lucide-react';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import API_BASE from '../../utils/apiBase';

export const AdminRequests = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState(null);
  const [quoting, setQuoting] = useState(false);
  const [quoteForm, setQuoteForm] = useState({ quoteAmount: '', adminNotes: '' });

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/projects/admin/requests`);
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests);
      }
    } catch (err) {
      console.error('Error fetching admin requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleOpenQuoteModal = (req) => {
    setSelectedReq(req);
    setQuoteForm({ quoteAmount: req.quoteAmount || '', adminNotes: req.adminNotes || '' });
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    setQuoting(true);
    try {
      const res = await fetch(`/api/projects/admin/requests/${selectedReq._id}/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteAmount: Number(quoteForm.quoteAmount),
          adminNotes: quoteForm.adminNotes,
        }),
      });
      const data = await res.json();
      setQuoting(false);
      setSelectedReq(null);
      if (data.success) {
        toast('Quote submitted successfully and sent to client!', 'success');
        fetchRequests();
      } else {
        toast(data.message || 'Failed to submit quote', 'error');
      }
    } catch (err) {
      toast('Server error quoting request', 'error');
      setQuoting(false);
    }
  };

  if (loading) {
    return <SkeletonLoader type="list" count={3} />;
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 font-heading">Project Proposals</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review details of client requests and submit project quotes.
        </p>
      </div>

      {/* List */}
      {requests.length > 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-55 border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Budget Range</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-50/40">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={req.client?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150'}
                          alt={req.client?.name}
                          className="w-8 h-8 rounded-lg object-cover bg-slate-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-700">{req.client?.name}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{req.client?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800 max-w-[200px] truncate">{req.title}</td>
                    <td className="px-6 py-4 uppercase tracking-wider text-[10px] text-slate-400">
                      {req.category.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-500">{req.budget}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${
                        req.status === 'quoted'
                          ? 'bg-cyan-50 text-cyan-600 border-cyan-100/50'
                          : req.status === 'accepted'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50'
                          : req.status === 'declined'
                          ? 'bg-rose-50 text-rose-600 border-rose-100/50'
                          : 'bg-amber-50 text-amber-600 border-amber-100/50 animate-pulse'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenQuoteModal(req)}
                      >
                        Details
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
          No pending project inquiries found
        </div>
      )}

      {/* Quote details modal */}
      {selectedReq && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedReq(null)}
          title={`Review Proposal: ${selectedReq.title}`}
          size="md"
        >
          <form onSubmit={handleQuoteSubmit} className="space-y-6">
            <div className="space-y-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-600 leading-relaxed">
              <p><strong>Description:</strong> {selectedReq.description}</p>
              <p><strong>Client Budget Expectation:</strong> {selectedReq.budget}</p>
              <p><strong>Timeline Request:</strong> {selectedReq.timeline}</p>
              {selectedReq.requirements && (
                <p><strong>Link attachments:</strong> <a href={selectedReq.requirements} target="_blank" rel="noreferrer" className="text-secondary hover:underline truncate inline-block max-w-[200px] align-bottom">{selectedReq.requirements}</a></p>
              )}
            </div>

            <div className="border-t border-slate-100 my-4" />

            {selectedReq.status === 'pending' || selectedReq.status === 'quoted' ? (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Offer Budget Quote</h4>
                <Input
                  label="Quote Amount (₹)"
                  name="quoteAmount"
                  type="number"
                  required
                  value={quoteForm.quoteAmount}
                  onChange={(e) => setQuoteForm({ ...quoteForm, quoteAmount: e.target.value })}
                  placeholder="e.g. 50000"
                />
                <Input
                  label="Admin Quotation Notes"
                  name="adminNotes"
                  textarea
                  value={quoteForm.adminNotes}
                  onChange={(e) => setQuoteForm({ ...quoteForm, adminNotes: e.target.value })}
                  placeholder="Provide scope guidelines, pricing details, and milestone allocations..."
                />
                <div className="flex gap-3 justify-end pt-2">
                  <Button
                    type="submit"
                    loading={quoting}
                  >
                    Submit Quotation Quote
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-xs font-bold text-center">
                This project request has already been {selectedReq.status} by the client.
              </div>
            )}
          </form>
        </Modal>
      )}

    </div>
  );
};

export default AdminRequests;
