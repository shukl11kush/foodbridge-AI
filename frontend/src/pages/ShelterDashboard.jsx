import React, { useEffect, useState } from 'react';
import { shelterAPI, matchesAPI } from '../services/api';
import { Building2, Sparkles, MapPin, Package, Clock, RefreshCw, CheckCircle2 } from 'lucide-react';
import MatchCard from '../components/MatchCard';

export default function ShelterDashboard({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await shelterAPI.getDashboard();
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRespond = async (matchId, action) => {
    try {
      await matchesAPI.respond(matchId, action, `Shelter ${action}ed match via dashboard.`);
      fetchDashboard();
    } catch (err) {
      alert(`Failed to ${action} match offer`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Shelter Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-400" />
            {user.name} Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">Review AI-matched surplus food donations ready for pickup</p>
        </div>

        <button
          onClick={fetchDashboard}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          title="Refresh Dashboard"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading shelter matched offers...</div>
      ) : !data ? (
        <div className="text-center text-slate-400">Failed to load dashboard data.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Shelter Profile Info */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Shelter Status & Capacity</h3>
              
              <div className="space-y-3 text-xs">
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block mb-1">Serving Address</span>
                  <span className="text-slate-200 font-medium flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    {data.shelter_info.address}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block">Daily Capacity</span>
                    <span className="text-sm font-bold text-slate-100">{data.shelter_info.capacity_servings} Servings</span>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block">Storage Unit</span>
                    <span className="text-sm font-bold text-emerald-400">{data.shelter_info.storage_type}</span>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block mb-1">Dietary & Intake Notes</span>
                  <span className="text-slate-300">{data.shelter_info.dietary_notes}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Matched Offers */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Incoming Matched Offers ({data.offers?.length || 0})
              </h3>
            </div>

            {data.offers?.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center border border-slate-800">
                <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-300">No Matched Offers Right Now</h4>
                <p className="text-xs text-slate-400 mt-1">When restaurants in your vicinity list surplus food, the AI engine will score and deliver matches here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.offers.map((offer) => (
                  <div key={offer.match_id} className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{offer.category}</span>
                        <h3 className="text-lg font-bold text-slate-100 mt-1">{offer.description}</h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                          From: <span className="text-slate-200 font-semibold">{offer.restaurant_name}</span> ({offer.restaurant_address})
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Offer Status</span>
                        <span className={`text-xs font-bold capitalize ${offer.match_status === 'accepted' ? 'text-emerald-400' : offer.match_status === 'declined' ? 'text-rose-400' : 'text-amber-400'}`}>
                          {offer.match_status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-slate-500 block">Offer Quantity</span>
                        <span className="font-semibold text-slate-200">{offer.quantity_servings} Servings</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Perishability</span>
                        <span className="font-semibold text-amber-400">{offer.perishability_level}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Pickup Deadline</span>
                        <span className="font-semibold text-slate-200">{offer.pickup_window_end}</span>
                      </div>
                    </div>

                    <MatchCard
                      match={{
                        shelter_name: offer.restaurant_name,
                        shelter_address: offer.restaurant_address,
                        ai_score: offer.ai_score,
                        ai_rationale: offer.ai_rationale,
                        is_fallback: offer.is_fallback,
                        status: offer.match_status,
                        match_id: offer.match_id
                      }}
                      isShelterView={true}
                      onRespond={handleRespond}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
