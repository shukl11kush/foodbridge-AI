import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Utensils, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('donor@bistrogourmet.com');
  const [password, setPassword] = useState('donor123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authAPI.login({ email, password });
      localStorage.setItem('fb_token', res.data.access_token);
      localStorage.setItem('fb_user', JSON.stringify(res.data));
      onLoginSuccess(res.data);

      if (res.data.role === 'restaurant') navigate('/donor-dashboard');
      else if (res.data.role === 'shelter') navigate('/shelter-dashboard');
      else if (res.data.role === 'admin') navigate('/admin-dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to login. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setQuickAccount = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full glass-card rounded-2xl p-8 border border-slate-800 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/20">
            <Utensils className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Welcome Back</h2>
          <p className="text-xs text-slate-400 mt-1">Sign in to manage surplus food listings & matches</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                placeholder="name@business.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-btn text-white py-3 rounded-xl font-semibold text-sm shadow-md flex items-center justify-center gap-2 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
            Quick Demo Credentials
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setQuickAccount('donor@bistrogourmet.com', 'donor123')}
              className="py-1.5 px-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-[11px] font-medium text-slate-300 text-center transition"
            >
              Restaurant
            </button>
            <button
              onClick={() => setQuickAccount('contact@bayhopeshelter.org', 'shelter123')}
              className="py-1.5 px-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-[11px] font-medium text-slate-300 text-center transition"
            >
              Shelter
            </button>
            <button
              onClick={() => setQuickAccount('admin@foodbridge.org', 'admin123')}
              className="py-1.5 px-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-[11px] font-medium text-slate-300 text-center transition"
            >
              Admin
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
