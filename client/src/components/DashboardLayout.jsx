import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Import your icons here...

export default function DashboardLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-slate-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-4">
        <div>
          <div className="text-xl font-bold mb-8">Academa.</div>
          <nav className="space-y-2">
            <Link to="/dashboard" className="block p-2 rounded hover:bg-slate-800">Dashboard</Link>
            <Link to="/explore" className="block p-2 rounded hover:bg-slate-800">Explore Notes</Link>
          </nav>
        </div>
        <button onClick={logout} className="text-left p-2 hover:bg-slate-800 rounded">
          Sign Out
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOP BAR */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
          <span className="font-semibold text-slate-700">Workspace</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{user?.first_name} {user?.last_name}</span>
            <span className="text-xs bg-slate-200 px-2 py-1 rounded uppercase">{user?.role}</span>
          </div>
        </header>

        {/* 🚀 DYNAMIC CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* ❌ REMOVE the old hardcoded "Workspace Injected Successfully" container */}
          
          {/* ✅ ADD THIS: This renders AdminDashboard / TeacherDashboard / StudentDashboard dynamically! */}
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}




// import React, { useState } from 'react';
// import { 
//   GraduationCap, 
//   BookOpen, 
//   UploadCloud, 
//   LayoutDashboard, 
//   Settings, 
//   LogOut, 
//   Menu, 
//   X, 
//   Bell, 
//   Search,
//   User,
//   Tags
// } from 'lucide-react';

// export default function DashboardLayout({ user = { first_name: "Alex", last_name: "Doe", role: "student" }, onLogout, children }) {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [activeTab, setActiveTab] = useState('dashboard');

//   // Define dynamic links based directly on your backend User Role model structure
//   const navigationLinks = [
//     { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, roles: ['student', 'teacher'] },
//     { id: 'materials', name: 'Explore Notes', icon: BookOpen, roles: ['student', 'teacher'] },
//     { id: 'upload', name: 'Upload Center', icon: UploadCloud, roles: ['teacher'] }, // Teacher only!
//     { id: 'tags', name: 'Manage Tags', icon: Tags, roles: ['teacher'] },           // Teacher only!
//     { id: 'settings', name: 'Profile Settings', icon: Settings, roles: ['student', 'teacher'] },
//   ];

//   // Filter links based on logged-in user role
//   const visibleLinks = navigationLinks.filter(link => link.roles.includes(user.role));

//   return (
//     <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      
//       {/* 1. MOBILE SIDEBAR OVERLAY/DRAWER */}
//       <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
//         <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
//         <div className={`absolute inset-y-0 left-0 w-64 bg-slate-900 text-slate-300 p-5 flex flex-col justify-between transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
//           <div className="space-y-6">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-2">
//                 <div className="h-9 w-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white"><GraduationCap className="h-5 w-5" /></div>
//                 <span className="text-lg font-bold text-white">Academa.</span>
//               </div>
//               <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-md hover:bg-slate-800 text-slate-400"><X className="h-5 w-5" /></button>
//             </div>
            
//             <nav className="space-y-1">
//               {visibleLinks.map((item) => {
//                 const Icon = item.icon;
//                 return (
//                   <button
//                     key={item.id}
//                     onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
//                     className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === item.id ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
//                   >
//                     <Icon className="h-4 w-4" />
//                     <span>{item.name}</span>
//                   </button>
//                 );
//               })}
//             </nav>
//           </div>

//           <button onClick={onLogout} className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-950/30 hover:text-red-400 transition-all">
//             <LogOut className="h-4 w-4" />
//             <span>Sign Out</span>
//           </button>
//         </div>
//       </div>

//       {/* 2. PERMANENT DESKTOP SIDEBAR */}
//       <aside className="hidden lg:flex w-64 bg-slate-900 text-slate-300 p-5 flex-col justify-between shrink-0 border-r border-slate-800">
//         <div className="space-y-8">
//           {/* Dashboard Branding */}
//           <div className="flex items-center space-x-2.5 px-2">
//             <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
//               <GraduationCap className="h-5 w-5" />
//             </div>
//             <span className="text-xl font-bold tracking-tight text-white">
//               Academa<span className="text-amber-400">.</span>
//             </span>
//           </div>

//           {/* Navigation Links Grid */}
//           <nav className="space-y-1.5">
//             {visibleLinks.map((item) => {
//               const Icon = item.icon;
//               return (
//                 <button
//                   key={item.id}
//                   onClick={() => setActiveTab(item.id)}
//                   className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all group ${activeTab === item.id ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'hover:bg-slate-800/60 text-slate-400 hover:text-white'}`}
//                 >
//                   <Icon className={`h-4 w-4 transition-transform ${activeTab !== item.id && 'group-hover:scale-110'}`} />
//                   <span>{item.name}</span>
//                 </button>
//               );
//             })}
//           </nav>
//         </div>

//         {/* Global Exit */}
//         <button 
//           onClick={onLogout}
//           className="flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-950/20 hover:text-red-400 border border-transparent hover:border-red-900/30 transition-all"
//         >
//           <LogOut className="h-4 w-4" />
//           <span>Sign Out</span>
//         </button>
//       </aside>

//       {/* 3. MAIN WORKSPACE CONTENT CONTAINER */}
//       <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        
//         {/* TOP COMPACT BRAND NAVBAR */}
//         <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10 shrink-0">
//           <div className="flex items-center space-x-4">
//             <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden transition-colors"><Menu className="h-5 w-5" /></button>
            
//             {/* Global Search Interface Shell */}
//             <div className="hidden md:flex items-center space-x-2 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 w-64 lg:w-80 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/5 transition-all">
//               <Search className="h-4 w-4 text-slate-400" />
//               <input type="text" placeholder="Search resources, tags, subjects..." className="bg-transparent border-none text-xs w-full focus:outline-none placeholder-slate-400 text-slate-700" />
//             </div>
//           </div>

//           {/* User Meta Row */}
//           <div className="flex items-center space-x-4">
//             <button className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 relative transition-all">
//               <Bell className="h-5 w-5" />
//               <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white" />
//             </button>
            
//             {/* Splitter */}
//             <div className="h-6 w-px bg-slate-200" />

//             {/* Profile Pill */}
//             <div className="flex items-center space-x-2.5 pl-1">
//               <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-sm shadow-inner uppercase">
//                 {user.first_name[0]}{user.last_name[0]}
//               </div>
//               <div className="hidden sm:block text-left">
//                 <p className="text-xs font-bold text-slate-900 leading-tight">{user.first_name} {user.last_name}</p>
//                 <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{user.role}</p>
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* INJECTED PAGE BODY WORKSPACE */}
//         <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
//           {/* This is where our layout injects the child sections dynamic grids */}
//           {children ? children : (
//             <div className="border-2 border-dashed border-slate-200 rounded-2xl h-full flex flex-col items-center justify-center text-center p-6 bg-white shadow-sm">
//               <div className="p-4 bg-slate-50 text-slate-400 rounded-full mb-3"><LayoutDashboard className="h-8 w-8" /></div>
//               <h2 className="text-base font-bold text-slate-900">Workspace Injected Successfully</h2>
//               <p className="text-xs text-slate-500 max-w-xs mt-1">Active View State: <span className="font-mono text-emerald-600 font-bold uppercase">{activeTab}</span>. Ready to map data nodes.</p>
//             </div>
//           )}
//         </main>

//       </div>
//     </div>
//   );
// }