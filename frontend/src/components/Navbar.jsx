import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Utensils, Building2, ShieldCheck, LogOut, PlusCircle } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  return (
    <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Utensils className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  FoodBridge<span className="text-blue-400 font-extrabold">-AI</span>
                </span>
                <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Surplus Food Matching</span>
              </div>
            </Link>
          </div>

          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
                {user.role === 'restaurant' && <Utensils className="w-3.5 h-3.5 text-blue-400" />}
                {user.role === 'shelter' && <Building2 className="w-3.5 h-3.5 text-emerald-400" />}
                {user.role === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />}
                <span className="font-medium text-slate-200">{user.name}</span>
                <span className="text-slate-500 capitalize">({user.role})</span>
              </div>

              {user.role === 'restaurant' && (
                <Link
                  to="/create-listing"
                  className="gradient-btn text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center space-x-1.5 shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>List Surplus Food</span>
                </Link>
              )}

              <button
                onClick={() => {
                  onLogout();
                  navigate('/login');
                }}
                className="text-slate-400 hover:text-rose-400 p-2 rounded-lg hover:bg-slate-800 transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="text-slate-300 hover:text-white px-3 py-2 text-xs font-medium transition"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="gradient-btn text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
