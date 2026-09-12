import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import { ShieldCheck, Users, Utensils, Building2, Sparkles, CheckCircle2, TrendingUp, RefreshCw } from 'lucide-react';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [overviewRes, usersRes] = await Promise.all([
        adminAPI.getOverview(),
        adminAPI.getUsers()
      ]);
      setMetrics(overviewRes.data.metrics);
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
            Platform Admin Control & Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">Real-time metrics, AI matching performance & user management</p>
        </div>

        <button
          onClick={fetchData}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          title="Refresh Analytics"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading platform stats...</div>
      ) : (
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-slate-400">Total Users</span>
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-slate-100">{metrics?.total_users || 0}</div>
              <div className="text-[11px] text-slate-500 mt-1">
                {metrics?.restaurants_count} Restaurants • {metrics?.shelters_count} Shelters
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-slate-400">Surplus Listings</span>
                <Utensils className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-slate-100">{metrics?.total_listings || 0}</div>
              <div className="text-[11px] text-slate-500 mt-1">
                {metrics?.active_listings} Active • {metrics?.matched_listings} Matched
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-slate-400">AI Matches Generated</span>
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-slate-100">{metrics?.ai_matches_count || 0}</div>
              <div className="text-[11px] text-slate-500 mt-1">
                {metrics?.rule_matches_count} Rule Engine Fallbacks
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-emerald-500/30 bg-emerald-500/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-emerald-400">Conversion Rate</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-300">{metrics?.conversion_rate_pct || 0}%</div>
              <div className="text-[11px] text-slate-400 mt-1">
                {metrics?.accepted_matches} Matches Accepted
              </div>
            </div>
          </div>

          {/* User Directory Table */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800">
            <h3 className="text-base font-bold text-slate-100 mb-4">Platform User Directory</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 uppercase text-[10px] text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">User / Org Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-slate-200">{u.name}</td>
                      <td className="p-3 text-slate-400">{u.email}</td>
                      <td className="p-3 capitalize">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${u.role === 'restaurant' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : u.role === 'shelter' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
