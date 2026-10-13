import React, { useEffect, useState } from 'react';
import ClassesManagement from '../admin/ClassesManagement';
import UsersManagement from '../admin/UsersManagement';
import LibraryManagement from '../admin/LibraryManagement';

/* INTEGRATION CHANGES HERE:
   Updated the import string to match your dashboard.js exports.
   We pull in all the functions you implemented in your API file. */
import { 
  getOverview, 
  getTrending, 
  getGaps, 
  getAudit, 
  getTagCloud, 
  searchDashoard 
} from '../../api/dashboard';

import { 
  LayoutDashboard, 
  School, 
  Users, 
  Library, 
  ShieldAlert, 
  TrendingUp, 
  AlertTriangle, 
  Link2, 
  Tag, 
  Activity,
  Search,
  CheckCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalStudents: 0,
    systemFlags: 0,
    systemStatus: "Loading..."
  });

  /* INTEGRATION STATES:
     We created dedicated hooks for the live data arriving from your asynchronous endpoints. */
  const [trendingMaterials, setTrendingMaterials] = useState([]); // Stores dynamic array from getTrending()
  const [curriculumGaps, setCurriculumGaps] = useState([]);       // Stores dynamic array from getGaps()
  const [systemTags, setSystemTags] = useState([]);               // Stores tags from getTagCloud()
  const [auditLogs, setAuditLogs] = useState([]);                 // Stores security alerts from getAudit()
  
  // Search state variables to control your API query parameter configurations
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  /* INTEGRATION EFFECT HOOK:
     Fires once on component mount to gather asynchronous responses parallelly across your endpoints. */
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Fetch static metrics overview
        const overviewData = await getOverview();
        if (overviewData) {
          setStats({
            totalTeachers: overviewData.teachers || 0,
            totalStudents: overviewData.students || 0,
            systemFlags: overviewData.system_health?.blocked_tokens || 0,
            systemStatus: overviewData.system_health?.status || "Unknown"
          });
        }

        // Fetch trending downloads feed
        const trendingData = await getTrending();
        if (trendingData) setTrendingMaterials(trendingData);

        // Fetch curriculum error gaps
        const gapsData = await getGaps();
        if (gapsData) setCurriculumGaps(gapsData);

        // Fetch calculated tag clouds
        const tagsData = await getTagCloud();
        if (tagsData) setSystemTags(tagsData);

        // Fetch security level audit trail logs
        const auditData = await getAudit();
        if (auditData) setAuditLogs(auditData);

      } catch (err) {
        console.error("Error executing asynchronous data integration pipeline:", err);
      }
    };
    
    loadDashboardData();
  }, []);

  /* INTEGRATION SEARCH HANDLER:
     Triggered when typing inside your header search component. It manages your dynamic queries directly. */
  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      // Calls your custom endpoint structure with fallback defaults page=1, perPage=5
      const response = await searchDashoard(query);
      setSearchResults(response);
    } catch (err) {
      console.error("Dashboard multi-resource query failing:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const navigationItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Classes', icon: School },
    // { name: 'Users', icon: Users },
    // { name: 'Library', icon: Library },
  ];

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      
      {/* 1. FIXED GLOBAL NAVIGATION SIDEBAR */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col justify-between z-10">
        <div>
          {/* Branding Header */}
          <div className="h-16 flex items-center px-6 border-b border-zinc-800 gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold tracking-wider text-xl bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              ACADEMA
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group ${
                    isActive 
                      ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-lg shadow-black/40' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-zinc-300'}`} />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Workspace Info Footnote */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-sm text-zinc-300">
            AV
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-zinc-300">Admin Workspace</span>
            <span className="text-[10px] text-zinc-500">System Level Control</span>
          </div>
        </div>
      </aside>

      {/* RIGHT SIDE LAYOUT CONTAINER */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* 2. COMMAND BAR (TOP NAVIGATION) */}
        <header className="h-16 border-b border-zinc-800 bg-zinc-900/60 backdrop-blur-md flex items-center justify-between px-8 z-10 relative">
          
          {/* INTEGRATION INPUT CONTROL:
             Bound to dynamic search query functions inside your API schema layout. */}
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search resources, users, classes..." 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-1.5 text-xs focus:outline-none focus:border-zinc-700 transition-colors text-zinc-300 placeholder-zinc-600"
            />

            {/* INTEGRATION RESULTS LIST OVERLAY:
               Displays inline response matches beneath the input field contextually. */}
            {searchQuery && (
              <div className="absolute left-0 mt-2 w-full bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl p-3 max-h-60 overflow-y-auto text-xs z-50">
                {isSearching ? (
                  <span className="text-zinc-500 italic block p-1">Searching network indices...</span>
                ) : searchResults && searchResults.results?.length > 0 ? (
                  <ul className="space-y-1">
                    {searchResults.results.map((res, index) => (
                      <li key={res.id || index} className="p-2 hover:bg-zinc-800 rounded text-zinc-300 border-b border-zinc-800/40 last:border-0 cursor-pointer">
                        <div className="font-semibold text-zinc-200">{res.title || res.name}</div>
                        <div className="text-[10px] text-zinc-500 capitalize">{res.type}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-zinc-500 italic block p-1">No infrastructure records found matching criteria.</span>
                )}
              </div>
            )}
          </div>

          {/* System Health Indicators */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-zinc-400">System Status: <span className="text-zinc-200 font-medium">{stats.systemStatus}</span></span>
            </div>
          </div>
        </header>

        {/* 3. MAIN CANVA CANVAS FLUID GRID */}
        <main className="flex-1 overflow-y-auto p-8 bg-zinc-950/40">
          
          {activeTab === 'Dashboard' && (
            <div className="max-w-6xl mx-auto space-y-6">
              
              {/* Context Header */}
              <div>
                <h1 className="text-xl font-bold tracking-tight text-zinc-100">Academa Mission Control</h1>
                <p className="text-xs text-zinc-500">Real-time status management and analytics metrics.</p>
              </div>

              {/* TOP INTERACTIVE METRIC CARDS ROW */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Teachers Card */}
                <div 
                  onClick={() => setActiveTab('Users')}
                  className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl hover:border-zinc-700 cursor-pointer transition-all hover:translate-y-[-2px] group shadow-xl shadow-black/10"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-zinc-400">Total Teachers</span>
                    <Users className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                  </div>
                  <div className="text-2xl font-bold tracking-tight text-zinc-100">{stats.totalTeachers} <span className="text-xs font-normal text-zinc-500">Active</span></div>
                  <span className="text-[10px] text-emerald-400 mt-2 block hover:underline">View Directory 👥 →</span>
                </div>

                {/* Total Students Card */}
                <div 
                  onClick={() => setActiveTab('Users')}
                  className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl hover:border-zinc-700 cursor-pointer transition-all hover:translate-y-[-2px] group shadow-xl shadow-black/10"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-zinc-400">Total Students</span>
                    <Users className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                  </div>
                  <div className="text-2xl font-bold tracking-tight text-zinc-100">{stats.totalStudents} <span className="text-xs font-normal text-zinc-500">Enrolled</span></div>
                  <span className="text-[10px] text-emerald-400 mt-2 block hover:underline">View Directory 👥 →</span>
                </div>

                {/* System Health Status Card */}
                <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl shadow-xl shadow-black/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-zinc-400">System Health</span>
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-bold tracking-tight text-zinc-100">{stats.systemFlags} <span className="text-xs font-normal text-zinc-500">Flags</span></div>
                  <span className="text-[10px] text-zinc-500 mt-2 block">Token Status OK</span>
                </div>
              </div>

              {/* SECOND GRID ROW: TRENDING & GAPS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Widget: Trending Materials (Using ResourceView/Download models) */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl shadow-black/10">
                  <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-3">
                    <TrendingUp className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-semibold text-zinc-200">Trending Materials (Downloads)</h3>
                  </div>
                  <ul className="space-y-3">
                    {/* INTEGRATION LOOP FEED:
                       Replaces static arrays with dynamically evaluated item collections from getTrending() */}
                    {trendingMaterials.length > 0 ? (
                      trendingMaterials.map((doc, idx) => (
                        <li key={doc.id || idx} className="flex items-center justify-between text-xs bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800/60">
                          <span className="text-zinc-300 font-mono text-[11px]">{idx + 1}. "{doc.name || doc.title}"</span>
                          <span className="text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 text-[10px] font-medium">
                            <strong className="text-amber-400">{doc.count || doc.downloads}</strong> dls
                          </span>
                        </li>
                      ))
                    ) : (
                      <span className="text-xs italic text-zinc-600">No active trend patterns calculated.</span>
                    )}
                  </ul>
                </div>

                {/* Widget: Curriculum Coverage Gaps */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl shadow-black/10">
                  <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-3">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <h3 className="text-sm font-semibold text-zinc-200">Curriculum Coverage Gaps</h3>
                  </div>
                  <div className="space-y-3.5 text-xs text-zinc-400">
                    {/* INTEGRATION LOOP FEED:
                       Maps live structures arriving from getGaps() payload arrays. */}
                    {curriculumGaps.length > 0 ? (
                      curriculumGaps.map((gap, idx) => (
                        <div key={gap.id || idx} className={`flex items-start gap-2.5 p-3 rounded-lg ${gap.severity === 'high' ? 'bg-rose-950/10 border border-rose-950/40' : 'bg-amber-950/10 border border-amber-950/40'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${gap.severity === 'high' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                          <p className="leading-normal">
                            <strong className="text-zinc-200">{gap.class_name || gap.target}:</strong> {gap.description || gap.message}
                          </p>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs italic text-zinc-600">Curriculum mappings currently evaluated intact.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* THIRD GRID ROW: ACTIONS & TAG CLOUD */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Widget: Quick Class-Subject Bridge (ClassSubject mapper) */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl shadow-black/10">
                  <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-3">
                    <Link2 className="w-4 h-4 text-sky-400" />
                    <h3 className="text-sm font-semibold text-zinc-200">Quick Class-Subject Bridge</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1">Select Subject</label>
                        <select 
                          value={selectedSubject}
                          onChange={(e) => setSelectedSubject(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-zinc-700"
                        >
                          <option value="">Choose...</option>
                          <option value="1">Mathematics</option>
                          <option value="2">Physics</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1">Select Class</label>
                        <select 
                          value={selectedClass}
                          onChange={(e) => setSelectedClass(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-zinc-700"
                        >
                          <option value="">Choose...</option>
                          <option value="1">Class 10A</option>
                          <option value="2">Class 11B</option>
                        </select>
                      </div>
                    </div>
                    <button className="w-full mt-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5">
                      Link Architecture Resource 🔗
                    </button>
                  </div>
                </div>

                {/* Widget: System Tag Cloud */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl shadow-black/10">
                  <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-3">
                    <Tag className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-semibold text-zinc-200">System Tag Cloud</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {/* INTEGRATION LOOP FEED:
                       Binds elements directly to tag collections returned by getTagCloud() */}
                    {systemTags.length > 0 ? (
                      systemTags.map((tag, idx) => (
                        <span key={tag.name || idx} className="text-[11px] font-mono px-2.5 py-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 rounded-lg cursor-pointer transition-colors">
                          {tag.name} <span className="text-zinc-600 font-sans text-[10px]">({tag.count || tag.usages})</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs italic text-zinc-600">No indexed system metrics discovered.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* BOTTOM SECURITY LOG PANELS BLOCK */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl shadow-black/10">
                <div className="flex items-center gap-2 mb-3 border-b border-zinc-800 pb-3">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-semibold text-zinc-200">Real-Time Audit Log & Token Revocations</h3>
                </div>
                <div className="font-mono text-[11px] space-y-2 text-zinc-500">
                  {/* INTEGRATION LOOP FEED:
                     Swaps placeholder audit data rows out with security feeds returned by getAudit() */}
                  {auditLogs.length > 0 ? (
                    auditLogs.map((log, idx) => (
                      <div key={log.id || idx} className="flex items-center gap-2 py-1 border-b border-zinc-800/40 last:border-0">
                        <span className="text-zinc-600">[{log.timestamp || log.time || "LOG"}]</span>
                        <span className={`${log.type === 'critical' || log.level === 'error' ? 'text-rose-400' : 'text-purple-400'}`}>
                          {log.action || log.event}
                        </span>
                        <span className="text-zinc-400">— {log.details || log.message}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs italic text-zinc-600">No authorization flags recorded.</span>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* Fallback space screens for structural integrity */}
          {activeTab !== 'Dashboard' && (
            <div className="max-w-6xl mx-auto">
              {activeTab === 'Classes' && <ClassesManagement />}
              {/* {activeTab === 'Users' && <UsersManagement />} */}
              {/* {activeTab === 'Library' && <LibraryManagement />} */}
              {activeTab !== 'Classes' && activeTab !== 'Users' && activeTab !== 'Library' && (
                <div className="h-64 border border-dashed border-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 text-sm">
                  {activeTab} Management View Canvas Core Placeholder
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}