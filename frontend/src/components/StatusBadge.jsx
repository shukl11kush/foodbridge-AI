import React from 'react';

export default function StatusBadge({ status }) {
  const getBadgeStyle = (s) => {
    switch (s?.toLowerCase()) {
      case 'active':
      case 'pending':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'matched':
      case 'accepted':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'picked_up':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'declined':
      case 'cancelled':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getBadgeStyle(status)}`}>
      {status ? status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
    </span>
  );
}
