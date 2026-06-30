import React from 'react';

export const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="bg-white/80 border border-slate-100 rounded-2xl p-6 shadow-sm animate-pulse space-y-4">
            <div className="h-48 bg-slate-200 rounded-xl w-full"></div>
            <div className="h-5 bg-slate-200 rounded w-2/3"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="space-y-2 pt-2">
              <div className="h-3 bg-slate-200 rounded w-full"></div>
              <div className="h-3 bg-slate-200 rounded w-5/6"></div>
            </div>
          </div>
        );
      case 'list':
        return (
          <div className="bg-white/80 border border-slate-100 rounded-xl p-4 shadow-sm animate-pulse flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full">
              <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0"></div>
              <div className="space-y-2 w-full">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="h-8 bg-slate-200 rounded w-24 shrink-0"></div>
          </div>
        );
      case 'text':
        return (
          <div className="space-y-3 animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-1/4"></div>
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            <div className="h-4 bg-slate-200 rounded w-4/5"></div>
          </div>
        );
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-3">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-8 bg-slate-200 rounded w-1/2"></div>
                <div className="h-3 bg-slate-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        );
      default:
        return <div className="h-10 bg-slate-200 rounded animate-pulse w-full"></div>;
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <React.Fragment key={idx}>{renderSkeleton()}</React.Fragment>
      ))}
    </>
  );
};

export default SkeletonLoader;
