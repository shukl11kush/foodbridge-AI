import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listingsAPI } from '../services/api';
import { PlusCircle, Utensils, Sparkles, CheckCircle2, Clock, MapPin, RefreshCw } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import MatchCard from '../components/MatchCard';

export default function DonorDashboard({ user }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await listingsAPI.getAll();
      setListings(res.data);
      if (res.data.length > 0) {
        setSelectedListing(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleUpdateStatus = async (listingId, status) => {
    try {
      await listingsAPI.updateStatus(listingId, status);
      fetchListings();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Utensils className="w-6 h-6 text-blue-400" />
            {user.name} Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage surplus food donations & view AI shelter shortlists</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchListings}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Refresh Listings"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/create-listing"
            className="gradient-btn text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>List Surplus Food</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading your surplus listings...</div>
      ) : listings.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-slate-800 max-w-xl mx-auto my-12">
          <Utensils className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-200">No Active Listings Yet</h3>
          <p className="text-xs text-slate-400 mt-1 mb-6">List surplus food from your kitchen or service to automatically trigger AI shelter matching.</p>
          <Link
            to="/create-listing"
            className="gradient-btn text-white text-xs font-semibold px-5 py-3 rounded-xl inline-flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create First Listing</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Listings List */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Your Listings ({listings.length})</h3>
            
            <div className="space-y-3">
              {listings.map((l) => (
                <div
                  key={l.id}
                  onClick={() => setSelectedListing(l)}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    selectedListing?.id === l.id
                      ? 'bg-slate-800/90 border-blue-500 shadow-md ring-1 ring-blue-500/50'
                      : 'glass-card border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">{l.category}</span>
                    <StatusBadge status={l.status} />
                  </div>

                  <h4 className="text-sm font-semibold text-slate-200 line-clamp-1">{l.description}</h4>
                  
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-2 border-t border-slate-800">
                    <span>{l.quantity_servings} Servings</span>
                    <span className="flex items-center gap-1 text-purple-400 font-medium">
                      <Sparkles className="w-3 h-3" />
                      {l.matches?.length || 0} Matches
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Selected Listing & Matches Detail */}
          {selectedListing && (
            <div className="lg:col-span-7 space-y-6">
              <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">{selectedListing.category}</span>
                    <h2 className="text-xl font-bold text-slate-100 mt-1">{selectedListing.description}</h2>
                  </div>
                  <StatusBadge status={selectedListing.status} />
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-500 block">Servings</span>
                    <span className="font-semibold text-slate-200">{selectedListing.quantity_servings}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Perishability</span>
                    <span className="font-semibold text-amber-400">{selectedListing.perishability_level}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Pickup End</span>
                    <span className="font-semibold text-slate-200">{selectedListing.pickup_window_end}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  {selectedListing.status !== 'picked_up' && selectedListing.status !== 'cancelled' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(selectedListing.id, 'cancelled')}
                        className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-rose-950/30 text-rose-400 text-xs font-medium transition"
                      >
                        Cancel Listing
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedListing.id, 'picked_up')}
                        className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mark as Picked Up
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  AI Shelter Shortlist ({selectedListing.matches?.length || 0})
                </h3>

                <div className="space-y-4">
                  {selectedListing.matches?.map((m) => (
                    <MatchCard key={m.id} match={m} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
