import React, { useEffect, useState } from 'react';
import { Star, CheckCircle, XCircle, Trash } from 'lucide-react';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import Button from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import API_BASE from '../../utils/apiBase';

export const AdminReviews = () => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/reviews`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (err) {
      console.error('Error fetching admin reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleApproval = async (id, currentState) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: !currentState }),
      });
      const data = await res.json();
      if (data.success) {
        toast(`Review ${!currentState ? 'Approved' : 'Unapproved'} successfully`, 'success');
        fetchReviews();
      }
    } catch (err) {
      toast('Error toggling review approval', 'error');
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast('Review deleted successfully', 'success');
        fetchReviews();
      }
    } catch (err) {
      toast('Error deleting review', 'error');
    }
  };

  if (loading) {
    return <SkeletonLoader type="list" count={3} />;
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 font-heading">Reviews Moderation</h1>
        <p className="text-xs text-slate-500 mt-1">
          Approve reviews to display on the public landing page testimonials carousel.
        </p>
      </div>

      {/* Grid List */}
      {reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((rev) => (
            <div key={rev._id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.client?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150'}
                      alt={rev.client?.name}
                      className="w-10 h-10 rounded-xl object-cover bg-slate-200"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{rev.client?.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{rev.project?.title || 'General Account'}</p>
                    </div>
                  </div>
                  
                  {/* Rating Stars */}
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-4 h-4 ${idx < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-500 italic leading-relaxed mt-4">
                  "{rev.comment}"
                </p>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${
                  rev.isApproved
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50'
                    : 'bg-slate-50 text-slate-500 border-slate-150'
                }`}>
                  {rev.isApproved ? 'Approved for Public' : 'Pending Moderation'}
                </span>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleApproval(rev._id, rev.isApproved)}
                    className="p-1 px-2.5 text-xs font-semibold"
                  >
                    {rev.isApproved ? 'Unapprove' : 'Approve'}
                  </Button>
                  <button
                    onClick={() => handleDeleteReview(rev._id)}
                    className="p-2 border border-rose-100 hover:bg-rose-50 rounded-xl text-rose-500 hover:text-rose-600 transition-colors shrink-0"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-slate-200 rounded-2xl bg-white text-slate-400 font-medium text-xs">
          No client reviews submitted yet
        </div>
      )}

    </div>
  );
};

export default AdminReviews;
