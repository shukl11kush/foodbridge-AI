import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingsAPI } from '../services/api';
import { Sparkles, Utensils, Clock, Package, AlertTriangle, ArrowLeft, CheckCircle } from 'lucide-react';
import MatchCard from '../components/MatchCard';

export default function CreateListing() {
  const [category, setCategory] = useState('Prepared Meals');
  const [description, setDescription] = useState('Fresh tray of warm vegetable lasagna, salad bowls, and artisan bread loaves from evening service.');
  const [quantityServings, setQuantityServings] = useState(45);
  const [perishabilityLevel, setPerishabilityLevel] = useState('High');
  const [readyBy, setReadyBy] = useState('Immediately (Ready Now)');
  const [pickupWindowEnd, setPickupWindowEnd] = useState('10:30 PM Today');

  const [loading, setLoading] = useState(false);
  const [resultListing, setResultListing] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await listingsAPI.create({
        category,
        description,
        quantity_servings: Number(quantityServings),
        perishability_level: perishabilityLevel,
        ready_by: readyBy,
        pickup_window_end: pickupWindowEnd
      });
      setResultListing(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create food listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/donor-dashboard')}
        className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {!resultListing ? (
        <div className="glass-card rounded-2xl p-8 border border-slate-800 shadow-2xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-100">List Surplus Food</h2>
              <p className="text-xs text-slate-400">Takes less than 2 minutes • Instant Gemini AI recipient matching</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Food Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="Prepared Meals">Prepared Hot/Cold Meals</option>
                  <option value="Bakery">Bakery & Pastries</option>
                  <option value="Produce">Fresh Fruit & Vegetables</option>
                  <option value="Dairy">Dairy & Refrigerated Items</option>
                  <option value="Packaged">Packaged / Shelf-Stable Goods</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Estimated Servings / Quantity</label>
                <div className="relative">
                  <Package className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="number"
                    required
                    min="1"
                    value={quantityServings}
                    onChange={(e) => setQuantityServings(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Food Description & Notes</label>
              <textarea
                required
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-4 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                placeholder="Include dietary info, packaging details, or temperature requirements..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Perishability Level</label>
                <select
                  value={perishabilityLevel}
                  onChange={(e) => setPerishabilityLevel(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="High">High (Perishes within 4 hours)</option>
                  <option value="Medium">Medium (Perishes within 24 hours)</option>
                  <option value="Low">Low (Shelf-stable / Days)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Ready For Pickup By</label>
                <input
                  type="text"
                  required
                  value={readyBy}
                  onChange={(e) => setReadyBy(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Pickup Window Ends</label>
                <input
                  type="text"
                  required
                  value={pickupWindowEnd}
                  onChange={(e) => setPickupWindowEnd(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-btn text-white py-3.5 rounded-xl font-bold text-sm shadow-xl flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin" />
                  <span>Running AI Matching Engine...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>Publish Listing & Get AI Shelter Matches</span>
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Results View */
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-emerald-500/40 bg-emerald-500/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
                <div>
                  <h3 className="text-xl font-bold text-slate-100">Listing Published & AI Matched!</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Category: <span className="text-slate-200 font-semibold">{resultListing.category}</span> • Servings: <span className="text-slate-200 font-semibold">{resultListing.quantity_servings}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/donor-dashboard')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700"
              >
                Go to Dashboard
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                AI-Ranked Recipient Shelters
              </h3>
              <span className="text-xs text-slate-400">Found {resultListing.matches?.length || 0} best-fit matches</span>
            </div>

            <div className="space-y-4">
              {resultListing.matches?.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
