import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, FolderKanban, Users, Clock, AlertCircle, PlusCircle, Star } from 'lucide-react';
import SkeletonLoader from '../../components/common/SkeletonLoader';

export const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/admin/analytics');
        const data = await res.json();
        if (data.success) {
          setAnalytics(data.analytics);
        }
      } catch (err) {
        console.error('Error fetching admin analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <SkeletonLoader type="dashboard" />;
  }

  const {
    totalRevenue = 0,
    monthlyRevenue = 0,
    pendingInvoiceRevenue = 0,
    totalClients = 0,
    activeProjects = 0,
    completedProjects = 0,
    pendingRequests = 0,
    statusDistribution = {},
    monthlyTrend = [],
  } = analytics || {};

  return (
    <div className="space-y-10">
      
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">Admin Control Center</h1>
          <p className="text-xs text-slate-500 mt-1">
            Aggregate overview of operations, cashflows, and client milestone tracking.
          </p>
        </div>
      </div>

      {/* Analytics Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenues', val: `₹${totalRevenue}`, desc: 'Cleared payment transactions', icon: <DollarSign className="text-emerald-500" /> },
          { label: 'Monthly Cashflow', val: `₹${monthlyRevenue}`, desc: 'Earned this current month', icon: <DollarSign className="text-secondary" /> },
          { label: 'Unpaid Invoices', val: `₹${pendingInvoiceRevenue}`, desc: 'Invoices due', icon: <AlertCircle className="text-rose-500" /> },
          { label: 'Total Clients', val: totalClients, desc: 'Registered user profiles', icon: <Users className="text-highlight" /> },
        ].map((card, i) => (
          <div key={i} className="glass-card rounded-2xl p-6 border-slate-200/50 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
              {card.icon}
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-800 truncate max-w-[150px]">{card.val}</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Grid section: Chart & Operations checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Billing Trend Chart (Custom styled CSS graph) */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Revenue Performance Trend</h3>
            <p className="text-xs text-slate-400 mt-0.5">Calculated monthly cashflow clearances (Last 6 Months)</p>
          </div>

          <div className="h-64 flex items-end gap-6 pt-10 px-4">
            {monthlyTrend.map((trend, idx) => {
              // Calculate relative height bar percentage
              const maxRev = Math.max(...monthlyTrend.map(t => t.revenue)) || 1;
              const pct = (trend.revenue / maxRev) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    ₹{trend.revenue}
                  </span>
                  <div
                    style={{ height: `${Math.max(pct, 5)}%` }}
                    className="w-full bg-gradient-to-t from-secondary to-accent hover:to-highlight rounded-lg transition-all duration-300 shadow-sm"
                  />
                  <span className="text-[10px] font-semibold text-slate-400">{trend.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Operations panel */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-800 font-heading">Control Panel Tasks</h3>
          <div className="flex flex-col gap-3">
            
            <Link
              to="/admin/requests"
              className="p-4 bg-slate-50 border border-slate-100 hover:bg-slate-100/60 rounded-2xl flex justify-between items-center transition-all group"
            >
              <div>
                <p className="text-xs font-bold text-slate-700">Proposal Requests</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Awaiting quotes: {pendingRequests}</p>
              </div>
              <ChevronArrow />
            </Link>

            <Link
              to="/admin/projects"
              className="p-4 bg-slate-50 border border-slate-100 hover:bg-slate-100/60 rounded-2xl flex justify-between items-center transition-all group"
            >
              <div>
                <p className="text-xs font-bold text-slate-700">Active Workflows</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Projects in-dev: {activeProjects}</p>
              </div>
              <ChevronArrow />
            </Link>

            <Link
              to="/admin/reviews"
              className="p-4 bg-slate-50 border border-slate-100 hover:bg-slate-100/60 rounded-2xl flex justify-between items-center transition-all group"
            >
              <div>
                <p className="text-xs font-bold text-slate-700">Review Moderation</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Approve comments for landing</p>
              </div>
              <ChevronArrow />
            </Link>

          </div>
        </div>

      </div>

    </div>
  );
};

const ChevronArrow = () => (
  <span className="w-7 h-7 rounded-xl bg-white flex items-center justify-center border border-slate-100 text-slate-400 group-hover:text-primary transition-colors shrink-0">
    →
  </span>
);

export default AdminDashboard;
