import React from 'react';
import { Sparkles, MapPin, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function MatchCard({ match, onRespond, isShelterView = false }) {
  const getScoreColor = (score) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 70) return 'text-blue-400 border-blue-500/40 bg-blue-500/10';
    return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
  };

  return (
    <div className="glass-card rounded-xl p-5 border border-slate-700/60 shadow-lg relative overflow-hidden transition hover:border-slate-600">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
            {match.shelter_name}
            {match.is_fallback ? (
              <span className="text-[11px] font-normal px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                Rule Engine
              </span>
            ) : (
              <span className="badge-ai text-[11px] font-semibold px-2 py-0.5 rounded text-white flex items-center gap-1 shadow-sm">
                <Sparkles className="w-3 h-3" />
                Gemini AI Ranked
              </span>
            )}
          </h4>
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            {match.shelter_address}
          </p>
        </div>

        <div className={`px-3 py-1.5 rounded-xl border text-center font-bold text-sm ${getScoreColor(match.ai_score)}`}>
          {Math.round(match.ai_score)}%
          <span className="block text-[9px] font-normal uppercase tracking-wider text-slate-400">Fit Score</span>
        </div>
      </div>

      <div className="bg-slate-900/60 rounded-lg p-3 my-3 border border-slate-800 text-xs text-slate-300">
        <span className="font-semibold text-blue-400 flex items-center gap-1 mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          Matching Rationale:
        </span>
        <p className="leading-relaxed text-slate-300">{match.ai_rationale}</p>
      </div>

      <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <span>Status:</span>
          <StatusBadge status={match.status} />
        </div>

        {isShelterView && match.status === 'pending' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onRespond(match.match_id || match.id, 'decline')}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-rose-950/40 hover:border-rose-600/50 hover:text-rose-400 text-slate-300 transition font-medium flex items-center gap-1"
            >
              <XCircle className="w-3.5 h-3.5" />
              Decline
            </button>
            <button
              onClick={() => onRespond(match.match_id || match.id, 'accept')}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition font-medium shadow-sm flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Accept Offer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
