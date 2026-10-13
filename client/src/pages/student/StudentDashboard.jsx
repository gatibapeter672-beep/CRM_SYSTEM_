import React, { useState, useEffect } from 'react';
import MySubjectsPortal from './MySubjectsPortal';
import DownloadsPortal from './DownloadsPortal';

import { 
  LayoutDashboard, 
  BookOpen, 
  DownloadCloud, 
  Bookmark, 
  Clock, 
  FileText, 
  ArrowUpRight,
  CheckCircle,
  Eye,
  Search,
  Loader2
} from 'lucide-react';
import {get_std_dashboard} from '../../api/std_dashboard' // Update this path to match your layout layout

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const data = await get_std_dashboard();
        setDashboardData(data);
      } catch (err) {
        setError('Failed to sync student dashboard modules.');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  // Utility fallback styles array for subjects
  const colorBridges = [
    'from-amber-500/20 to-transparent border-amber-500/30 text-amber-400',
    'from-sky-500/20 to-transparent border-sky-500/30 text-sky-400',
    'from-emerald-500/20 to-transparent border-emerald-500/30 text-emerald-400',
    'from-purple-500/20 to-transparent border-purple-500/30 text-purple-400',
    'from-rose-500/20 to-transparent border-rose-500/30 text-rose-400'
  ];

  // Helper mapping function for dynamic activities icons
  const getActivityMeta = (type) => {
    if (type === 'DOWNLOAD') {
      return { icon: CheckCircle, color: 'text-sky-400 bg-sky-500/10' };
    }
    return { icon: Eye, color: 'text-emerald-400 bg-emerald-500/10' };
  };

  const getTypeBadgeStyle = (type) => {
    switch(type) {
      case 'NOTE': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'PAST_PAPER': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'ASSIGNMENT': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full bg-zinc-950 items-center justify-center text-zinc-400 gap-2 font-mono text-xs">
        <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
        Syncing live student pipeline grids...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full bg-zinc-950 items-center justify-center text-rose-400 font-mono text-xs border border-rose-500/20 bg-rose-500/5">
        {error}
      </div>
    );
  }

  const { student_context, subject_binder, fresh_drops, user_activity_logs } = dashboardData;

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      
      {/* 1. STUDENT CONTROL SIDEBAR */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col justify-between z-10">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-zinc-800 gap-2">
            <div className="w-3 h-3 rounded-full bg-sky-500 animate-pulse" />
            <span className="font-bold tracking-wider text-xl bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              ACADEMA
            </span>
            <span className="text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 px-1.5 py-0.5 rounded">Student</span>
          </div>

          <nav className="p-4 space-y-1.5">
            {[
              { name: 'Dashboard', icon: LayoutDashboard },
              { name: 'My Subjects', icon: BookOpen },
              { name: 'Downloads', icon: DownloadCloud },
              // { name: 'Bookmarks', icon: Bookmark },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group ${
                    isActive 
                      ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-lg' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-zinc-400 group-hover:text-zinc-300'}`} />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Dynamic Student Context Card */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center font-bold text-sm text-sky-400">
            ST
          </div>
          <div className="fle]x flex-col">
            <span className="text-xs font-medium text-zinc-300">Sam Simion</span>
            <span className="text-[10px] text-zinc-500">Class Matrix Route: {student_context.className}</span>
          </div>
        </div>
      </aside>

      {/* RIGHT CONTENT FRAME */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* GLOBAL COMMAND ARCHITECTURE BAR */}
        <header className="h-16 border-b border-zinc-800 bg-zinc-900/60 backdrop-blur-md flex items-center justify-between px-8 z-10">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search your notes, past papers, assignments..." 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-1.5 text-xs focus:outline-none focus:border-zinc-700 transition-colors text-zinc-300 placeholder-zinc-600"
            />
          </div>
          <div className="text-xs text-zinc-400 bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-md font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            Active Grid Context: <span className="text-zinc-200 font-bold">{student_context.className}</span>
          </div>
        </header>

        {/* WORKSPACE VIEW CANVAS */}
        <main className="flex-1 overflow-y-auto p-8">
          {activeTab === 'Dashboard' && (
            <div className="max-w-6xl mx-auto space-y-6">
              
              <div>
                <h1 className="text-xl font-bold tracking-tight text-zinc-100">My Academic Portal</h1>
                <p className="text-xs text-zinc-500">Quickly access class resources published directly down your curriculum timeline routes.</p>
              </div>

              {/* THREE CORE SCOPE METRIC CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl shadow-xl">
                  <span className="text-xs font-medium text-zinc-400 block mb-2">Active Subjects</span>
                  <div className="text-2xl font-bold tracking-tight text-zinc-100">{student_context.totalCourses} <span className="text-xs font-normal text-zinc-500">Linked Channels</span></div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl shadow-xl">
                  <span className="text-xs font-medium text-zinc-400 block mb-2">New Updates (This Week)</span>
                  <div className="text-2xl font-bold tracking-tight text-sky-400">{student_context.newFilesThisWeek} <span className="text-xs font-normal text-zinc-500">Unread Materials</span></div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl shadow-xl">
                  <span className="text-xs font-medium text-zinc-400 block mb-2">Completed Resource Reads</span>
                  <div className="text-2xl font-bold tracking-tight text-emerald-400">{student_context.completedReads} <span className="text-xs font-normal text-zinc-500">Files Audited</span></div>
                </div>
              </div>

              {/* MID GRID ROW: RECENT DROPS VS BINDER SECTIONS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 🔔 FRESH RESOURCE DROPS TIMELINE */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl">
                  <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-3">
                    <Clock className="w-4 h-4 text-sky-400" />
                    <h3 className="text-sm font-semibold text-zinc-200">Fresh Resource Drops (Recent)</h3>
                  </div>

                  <div className="space-y-3">
                    {fresh_drops.length > 0 ? (
                      fresh_drops.map((file) => (
                        <div key={file.id} className="bg-zinc-950/40 border border-zinc-800/80 rounded-xl p-3.5 flex items-center justify-between group hover:border-zinc-700 transition-colors">
                          <div className="space-y-1.5 max-w-[280px]">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 border rounded ${getTypeBadgeStyle(file.type)}`}>
                                {file.type}
                              </span>
                              <span className="text-[10px] text-zinc-500 font-medium">{file.time}</span>
                            </div>
                            <span className="text-xs font-mono font-medium text-zinc-200 block truncate">"{file.title}"</span>
                            <p className="text-[10px] text-zinc-500 font-medium">Published by <span className="text-zinc-400">{file.author}</span></p>
                          </div>
                          <button className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg border border-zinc-800 transition-colors">
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-zinc-600 font-mono text-[11px] border border-dashed border-zinc-800 rounded-xl">
                        No recent material uploads tracked on this class timeline.
                      </div>
                    )}
                  </div>
                </div>

                {/* 🏫 MY CLASS SUBJECTS BINDER */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-3">
                      <BookOpen className="w-4 h-4 text-amber-400" />
                      <h3 className="text-sm font-semibold text-zinc-200">My Class Subjects Binder</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {subject_binder.map((course, idx) => {
                        const styleTheme = colorBridges[idx % colorBridges.length];
                        return (
                          <div key={course.id} className={`bg-gradient-to-r border p-3.5 rounded-xl flex items-center justify-between transition-all hover:scale-[1.01] ${styleTheme}`}>
                            <div className="space-y-0.5">
                              <h4 className="text-xs font-bold tracking-wide text-zinc-100">{course.subject_name}</h4>
                              <span className="text-[10px] font-mono text-zinc-500">System Code: {course.subject_code}</span>
                            </div>
                            <button className="text-[11px] font-semibold bg-zinc-900 text-zinc-300 border border-zinc-800/60 px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors flex items-center gap-1">
                              <span>Open 📂</span>
                              <span className="text-[10px] font-mono font-bold text-zinc-500">({course.file_count})</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-600 font-mono mt-4 block text-right">Auto-Filtered via ClassSubject Entity Map</span>
                </div>
              </div>

              {/* BOTTOM TOOLKIT PANEL: RECENT VIEWS & DOWNLOADS HISTORY */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl">
                <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-3">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-zinc-200">Quick Offline Toolkit (My Recent Downloads)</h3>
                </div>

                <div className="space-y-2.5">
                  {user_activity_logs.map((log) => {
                    const meta = getActivityMeta(log.activity_type);
                    const LogIcon = meta.icon;
                    return (
                      <div key={log.id} className="flex items-center justify-between bg-zinc-950/60 border border-zinc-800/80 p-3 rounded-lg text-xs">
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded ${meta.color}`}>
                            <LogIcon className="w-3.5 h-3.5" />
                          </div>
                          <div className="space-y-0.5">
                            <span className="font-mono text-[11px] text-zinc-300">"{log.title}"</span>
                            <p className="text-[10px] text-zinc-500">{log.action}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                          {log.timestamp}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* WORKSPACE VIEW CANVAS */}
          <main className="flex-1 overflow-y-auto p-8">
            {activeTab === 'Dashboard' && (
              <div className="max-w-6xl mx-auto space-y-6">
                {/* Keep all your original dashboard elements here... */}
              </div>
            )}

            {/* MY SUBJECTS PORTAL INTERFACE RUNTIME */}
            {activeTab === 'My Subjects' && (
              <MySubjectsPortal 
                subjectBinder={subject_binder}
                studentContext={student_context}
                getTypeBadgeStyle={getTypeBadgeStyle}
                colorBridges={colorBridges}
              />
            )}

            {/* NEW DOWNLOADS ARCHIVE MODULE PIPELINE CONNECTION */}
            {activeTab === 'Downloads' && (
              <DownloadsPortal 
                downloadLogs={user_activity_logs} // Maps your dynamic dashboard activities mock array directly down to the grid
                getTypeBadgeStyle={getTypeBadgeStyle}
              />
            )}

            {/* REMAINDER PLACEHOLDER FALLBACK TABS */}
            {activeTab !== 'Dashboard' && activeTab !== 'My Subjects' && activeTab !== 'Downloads' && (
              <div className="max-w-6xl mx-auto h-64 border border-dashed border-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 text-sm">
                {activeTab} Portal Content Grid Core Placeholder
              </div>
            )}
          </main>
          
        </main>
      </div>
    </div>
  );
}