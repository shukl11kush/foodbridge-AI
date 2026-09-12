import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import DonorDashboard from './pages/DonorDashboard';
import CreateListing from './pages/CreateListing';
import ShelterDashboard from './pages/ShelterDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { authAPI } from './services/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('fb_user');
    const token = localStorage.getItem('fb_token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('fb_token');
    localStorage.removeItem('fb_user');
    setUser(null);
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-900 text-slate-400 flex items-center justify-center">Loading FoodBridge-AI...</div>;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
        <Navbar user={user} onLogout={handleLogout} />

        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login onLoginSuccess={setUser} />} />
            <Route path="/register" element={<Register onLoginSuccess={setUser} />} />

            {/* Protected Routes */}
            <Route
              path="/donor-dashboard"
              element={
                <ProtectedRoute user={user} allowedRoles={['restaurant']}>
                  <DonorDashboard user={user} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/create-listing"
              element={
                <ProtectedRoute user={user} allowedRoles={['restaurant']}>
                  <CreateListing />
                </ProtectedRoute>
              }
            />

            <Route
              path="/shelter-dashboard"
              element={
                <ProtectedRoute user={user} allowedRoles={['shelter']}>
                  <ShelterDashboard user={user} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute user={user} allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Root Redirection */}
            <Route
              path="/"
              element={
                !user ? (
                  <Navigate to="/login" replace />
                ) : user.role === 'restaurant' ? (
                  <Navigate to="/donor-dashboard" replace />
                ) : user.role === 'shelter' ? (
                  <Navigate to="/shelter-dashboard" replace />
                ) : (
                  <Navigate to="/admin-dashboard" replace />
                )
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
