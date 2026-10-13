// src/layouts/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth'; // Assumes your hooks folder lives under src/

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { isAuthenticated, user, loading } = useAuth();

  // 1. Prevent premature redirection while checking auth tokens
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-sm font-semibold text-slate-500 gap-2">
        <div className="h-5 w-5 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
        <span>Authenticating session parameters...</span>
      </div>
    );
  }

  // 2. Bounce back to login if unauthorized
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Send to unauthorized deck if the role doesn't match
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. Upgraded: Pass user data down via Outlet Context!
  // This allows any inner page to access the logged-in user instantly.
  return <Outlet context={{ user }} />;
}