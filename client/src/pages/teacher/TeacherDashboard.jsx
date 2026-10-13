import React, { useState, useEffect } from 'react';
import Insights from './Insights'
import MyClasses from './MyClasses'
import MyUploads from './MyUploads';


 
import { 
  LayoutDashboard, 
  UploadCloud, 
  BookOpen, 
  BarChart3, 
  FolderSync, 
  Eye, 
  Download, 
  FileText,
  Search,
  CheckCircle2,
  FileUp,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { 
  getTeacherWorkspaceMetadata, 
  publishFacultyResource 
} from '../../api/teacher_dashboard_api';

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('Workspace');
  
  // Workspace State sourced from API
  const [stats, setStats] = useState({
    totalUploads: 0,
    uniqueViews: 0,
    totalDownloads: 0
  });
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [recentEngagement, setRecentEngagement] = useState([]);
  
  // Loading & Error states
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Interactive Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [resourceType, setResourceType] = useState('NOTE');
  const [selectedFile, setSelectedFile] = useState(null);

  // 1. Fetch metadata on component mount
  useEffect(() => {
    fetchWorkspaceData();
  }, []);

  const fetchWorkspaceData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getTeacherWorkspaceMetadata();
      if (data) {
        if (data.stats) setStats(data.stats);
        if (data.assignedClasses) setAssignedClasses(data.assignedClasses);
        if (data.recentEngagement) setRecentEngagement(data.recentEngagement);
        // if (data.assigned_classes) setAssignedClasses(data.assigned_classes);
        // if (data.recent_engagement) setRecentEngagement(data.recent_engagement);
      }
    } catch (err) {
      setErrorMessage("Failed to load workspace data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset selectedSubject whenever the user switches the selected class
  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    setSelectedSubject('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.split('.').slice(0, -1).join(' ').replaceAll('_', ' '));
      }
    }
  };

  // 2. Form submission linked to backend API

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!title || !selectedClass || !selectedSubject || !selectedFile) return;

    setIsPublishing(true);
    setErrorMessage(null);

    // Build FormData object for file uploads
    const formData = new FormData();
    formData.append("file", selectedFile); // Binary file object
    formData.append("title", title.trim());
    if (description.trim()) {
      formData.append("description", description.trim());
    }
    formData.append("class_id", parseInt(selectedClass, 10));
    formData.append("subject_id", parseInt(selectedSubject, 10));
    formData.append("resource_type", resourceType);

    try {
      await publishFacultyResource(formData);
      console.log(formData)
      setUploadSuccess(true);
      
      // Refresh statistics and engagement matrix after successful upload
      await fetchWorkspaceData();

      setTimeout(() => {
        setUploadSuccess(false);
        setTitle('');
        setDescription('');
        setSelectedClass('');
        setSelectedSubject('');
        setSelectedFile(null);
      }, 3000);
    } catch (err) {
      const backendError = err?.response?.data?.error || "Failed to publish resource.";
      setErrorMessage(typeof backendError === 'string' ? backendError : JSON.stringify(backendError));
    } finally {
      setIsPublishing(false);
    }
  };




  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      
      {/* 1. TEACHER NAVIGATION SIDEBAR */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col justify-between z-10">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-zinc-800 gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-bold tracking-wider text-xl bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              ACADEMA
            </span>
            <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded">Faculty</span>
          </div>

          <nav className="p-4 space-y-1.5">
            {[
              { name: 'Workspace', icon: LayoutDashboard },
              { name: 'My Uploads', icon: BookOpen },
              { name: 'My Classes', icon: FolderSync },
              // { name: 'Insights', icon: BarChart3 },
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
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-zinc-400 group-hover:text-zinc-300'}`} />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-sm text-amber-400">
            TR
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-zinc-300">Prof. Aris</span>
            <span className="text-[10px] text-zinc-500">STEM Department Faculty</span>
          </div>
        </div>
      </aside>

      {/* RIGHT WORKSPACE FLUID GRID */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        <header className="h-16 border-b border-zinc-800 bg-zinc-900/60 backdrop-blur-md flex items-center justify-between px-8 z-10">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search your resources, classes, documents..." 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-1.5 text-xs focus:outline-none focus:border-zinc-700 transition-colors text-zinc-300 placeholder-zinc-600"
            />
          </div>
          <div className="text-xs text-zinc-400 bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-md font-medium">
            Academic Term: <span className="text-amber-400 font-semibold">Active</span>
          </div>
        </header>

        {/* CANVAS WORKSPACE VIEW */}
        <main className="flex-1 overflow-y-auto p-8">
          {errorMessage && (
            <div className="mb-6 bg-red-950/40 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'Workspace' && (
            isLoading ? (
              <div className="h-96 flex flex-col items-center justify-center gap-3 text-zinc-500">
                <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                <span className="text-xs font-mono">Loading teacher workspace metrics...</span>
              </div>
            ) : (
              <div className="max-w-6xl mx-auto space-y-6">
                
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-zinc-100">Teacher Workspace</h1>
                  <p className="text-xs text-zinc-500">Deploy structural curriculum resources and track live student material engagement metrics.</p>
                </div>

                {/* THREE COLUMN STAT ROW */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl shadow-xl">
                    <span className="text-xs font-medium text-zinc-400 block mb-2">Total Content Pieces</span>
                    <div className="text-2xl font-bold tracking-tight text-zinc-100">{stats.totalUploads} <span className="text-xs font-normal text-zinc-500">Files Uploaded</span></div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl shadow-xl">
                    <span className="text-xs font-medium text-zinc-400 block mb-2">Unique Student Views</span>
                    <div className="text-2xl font-bold tracking-tight text-zinc-100 flex items-baseline gap-2">
                      <span>{stats.uniqueViews}</span>
                      <span className="text-xs font-normal text-amber-400 flex items-center gap-0.5"><Eye className="w-3 h-3" /> Reads</span>
                    </div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl shadow-xl">
                    <span className="text-xs font-medium text-zinc-400 block mb-2">Resource Downloads</span>
                    <div className="text-2xl font-bold tracking-tight text-zinc-100 flex items-baseline gap-2">
                      <span>{stats.totalDownloads}</span>
                      <span className="text-xs font-normal text-sky-400 flex items-center gap-0.5"><Download className="w-3 h-3" /> Times</span>
                    </div>
                  </div>
                </div>

                {/* TWIN CARD GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* ⚡ INSTANT RESOURCE PUBLISHER PANEL */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl">
                    <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-3">
                      <UploadCloud className="w-4 h-4 text-amber-400" />
                      <h3 className="text-sm font-semibold text-zinc-200">Instant Resource Publisher</h3>
                    </div>

                    <form onSubmit={handlePublish} className="space-y-3.5">
                      
                      {/* FILE SELECTION PORTAL */}
                      <div>
                        <label className="block text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1">Upload File Target</label>
                        {!selectedFile ? (
                          <div className="border border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-950 rounded-lg p-4 transition-colors relative flex flex-col items-center justify-center gap-2 group cursor-pointer">
                            <input 
                              type="file"
                              onChange={handleFileChange}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              required
                            />
                            <FileUp className="w-5 h-5 text-zinc-600 group-hover:text-amber-400 transition-colors" />
                            <div className="text-center">
                              <p className="text-[11px] text-zinc-400 font-medium">Click to select file repository</p>
                              <p className="text-[9px] text-zinc-600 font-mono mt-0.5">PDF, DOCX, ZIP up to 50MB</p>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-md text-amber-400 shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="overflow-hidden">
                                <p className="text-xs font-mono font-medium text-zinc-300 truncate">{selectedFile.name}</p>
                                <p className="text-[10px] font-mono text-zinc-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                              </div>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => setSelectedFile(null)}
                              className="p-1 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 text-zinc-500 hover:text-zinc-300 rounded-md transition-all"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1">Display Title</label>
                        <input 
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g., Quantum Mechanics Introduction"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700 placeholder-zinc-700"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1">Description (Optional)</label>
                        <textarea 
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Provide deep structural descriptions, reading scope, or guidance parameters..."
                          rows={2}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700 placeholder-zinc-700 resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        {/* 1. SELECT TARGET CLASS */}
                        <div>
                          <label className="block text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1">Target Class</label>
                          <select 
                            value={selectedClass}
                            onChange={handleClassChange}
                            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-zinc-700"
                            required
                          >
                            <option value="">Choose Class...</option>
                            {assignedClasses.map(c => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* 2. SELECT SUBJECT */}
                        <div>
                          <label className="block text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1">Target Subject</label>
                          <select 
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            disabled={!selectedClass}
                            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-zinc-700 disabled:opacity-40"
                            required
                          >
                            <option value="">Choose Subject...</option>
                            {selectedClass && 
                              assignedClasses
                                .find(c => c.id === parseInt(selectedClass, 10))
                                ?.subjects.map(s => (
                                  <option key={s.id} value={s.id}>
                                    {s.name}
                                  </option>
                                ))
                            }
                          </select>
                        </div>

                        {/* 3. CONTENT TYPE */}
                        <div>
                          <label className="block text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1">Content Type</label>
                          <select 
                            value={resourceType}
                            onChange={(e) => setResourceType(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-zinc-700 font-mono"
                          >
                            <option value="NOTE">NOTE</option>
                            <option value="REVISION_QUESTION">REVISION_QUESTION</option>
                            <option value="PAST_PAPER">PAST_PAPER</option>
                            <option value="ASSIGNMENT">ASSIGNMENT</option>
                          </select>
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        disabled={isPublishing}
                        className={`w-full font-semibold text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 border ${
                          uploadSuccess 
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40' 
                            : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-950 border-transparent disabled:opacity-50'
                        }`}
                      >
                        {isPublishing ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Publishing...
                          </>
                        ) : uploadSuccess ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 animate-bounce" /> Published Complete!
                          </>
                        ) : (
                          "Publish to Class Library 🚀"
                        )}
                      </button>
                    </form>
                  </div>

                  {/* 📊 CONTENT ENGAGEMENT TRACKER PANEL */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-3">
                        <BarChart3 className="w-4 h-4 text-sky-400" />
                        <h3 className="text-sm font-semibold text-zinc-200">Content Engagement Insights</h3>
                      </div>
                      <div className="space-y-3">
                        {recentEngagement.length > 0 ? (
                          recentEngagement.map((resource) => (
                            <div key={resource.id} className="bg-zinc-950/40 border border-zinc-800/80 rounded-lg p-3 flex flex-col gap-2">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-mono font-medium text-zinc-200 truncate max-w-[240px] block">"{resource.title}"</span>
                                <span className="text-[9px] font-mono font-bold bg-zinc-900 text-zinc-500 border border-zinc-800 px-1 py-0.5 rounded">{resource.type}</span>
                              </div>
                              <div className="flex gap-4 items-center text-[11px] text-zinc-500">
                                <span className="flex items-center gap-1"><Eye className="w-3 h-3 text-zinc-600" /> <strong className="text-zinc-400">{resource.views}</strong> views</span>
                                <span className="flex items-center gap-1"><Download className="w-3 h-3 text-zinc-600" /> <strong className="text-zinc-400">{resource.downloads}</strong> downloads</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-zinc-600 font-mono italic">No recent engagement history found.</p>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-600 text-right font-mono mt-4 block">Linked to ResourceView Relations</span>
                  </div>
                </div>

                {/* BOTTOM ROW: CLASS SUBJECTS MAPPER ASSIGNMENTS MATRIX */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl">
                  <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-3">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-semibold text-zinc-200">My Assigned Classes & Active Subjects Matrix</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {assignedClasses.map((item) => (
                      <div key={item.id} className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-4 flex items-center justify-between group hover:border-zinc-700 transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-baseline gap-2">
                            <h4 className="text-sm font-bold text-zinc-200">{item.name}</h4>
                            <span className="text-[10px] text-zinc-500 font-mono tracking-wider">[{item.code}]</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.subjects?.map(s => (
                              <span key={s.id} className="text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                                {s.name}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono block text-zinc-400 font-bold">{item.uploadsCount} <span className="text-[10px] font-normal text-zinc-600">files</span></span>
                          <button className="text-[10px] text-amber-400 font-semibold hover:underline mt-1 block">
                            Manage Library 🔗
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )
          )}

          {activeTab === 'My Classes' && <MyClasses />}
          {activeTab === 'My Uploads' && <MyUploads/>}
          {activeTab === 'Insights' && <Insights/>}


          {activeTab !== 'Workspace' && activeTab !=='My Classes' && activeTab !=='My Uploads' && activeTab !=='Insights' && (
            <div className="max-w-6xl mx-auto h-64 border border-dashed border-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 text-sm">
              {activeTab} Workspace Frame Core Controller Placeholder
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
