// src/layouts/PublicLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900">
      <main className="flex-1 flex flex-col">
        {/* Renders the matching child route component (Login, Register, etc.) */}
        <Outlet />
      </main>
    </div>
  );
}