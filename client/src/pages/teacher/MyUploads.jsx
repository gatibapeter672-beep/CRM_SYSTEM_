import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  FileText, 
  Eye, 
  Download, 
  Trash2, 
  Archive, 
  RefreshCw 
} from 'lucide-react';
import { 
  getMyUploads, 
  updateResourceStatus, 
  deleteResource 
} from '../../api/teacher_uploads'; // Adjust relative import path as needed

export default function MyUploads() {
  const [myResources, setMyResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI Filtering Engine States
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL');

  // =========================================================================
  // FETCH USER UPLOADS FROM API
  // =========================================================================
  const fetchUploads = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyUploads();
      if (data) {
        setMyResources(Array.isArray(data) ? data : data.uploads || []);
      }
    } catch (err) {
      console.error("Failed to fetch uploaded resources:", err);
      setError("Unable to load your uploads. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  // =========================================================================
  // INTERACTIVE API HANDLERS (PATCH & DELETE)
  // =========================================================================
  const handleToggleStatus = async (id) => {
    // Optimistic UI update for snappy response
    const currentRes = myResources.find(r => r.id === id);
    if (!currentRes) return;

    const nextStatus = currentRes.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE';
    setMyResources(prev => 
      prev.map(res => res.id === id ? { ...res, status: nextStatus } : res)
    );

    try {
      await updateResourceStatus(id);
      console.log(`✅ Status toggled successfully for resource ID [${id}]`);
    } catch (err) {
      console.error(`⚠️ Failed to update status for resource ID [${id}]:`, err);
      // Revert state if backend request fails
      setMyResources(prev => 
        prev.map(res => res.id === id ? { ...res, status: currentRes.status } : res)
      );
      alert("Failed to update status on the server.");
    }
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this resource? This action cannot be undone.")) {
      return;
    }

    // Optimistic UI Removal
    const previousResources = [...myResources];
    setMyResources(prev => prev.filter(res => res.id !== id));

    try {
      await deleteResource(id);
      console.log(`✅ Resource ID [${id}] successfully deleted from backend.`);
    } catch (err) {
      console.error(`⚠️ Failed to delete resource ID [${id}]:`, err);
      // Revert if API fails
      setMyResources(previousResources);
      alert("Failed to delete resource. Please check server logs.");
    }
  };

  // Extract unique class names dynamically for filtering dropdown
  const uniqueClasses = Array.from(
    new Set(myResources.map(res => res.class_name || res.classroom?.name).filter(Boolean))
  );

  // Client-side filtering logic
  const filteredResources = myResources.filter(res => {
    const title = res.title || res.file_name || '';
    const description = res.description || '';
    const className = res.class_name || res.classroom?.name || '';

    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || res.resource_type === typeFilter;
    const matchesClass = classFilter === 'ALL' || className === classFilter;

    return matchesSearch && matchesType && matchesClass;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">My Uploaded Resources</h1>
          <p className="text-xs text-zinc-500">Monitor engagement loops, alter live visibility deployment statuses, or prune old learning materials.</p>
        </div>

        <button 
          onClick={fetchUploads} 
          disabled={loading}
          className="self-start sm:self-auto p-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors flex items-center gap-2 text-xs font-mono cursor-pointer"
          title="Refresh Uploads List"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          <span>Sync</span>
        </button>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs p-3 rounded-lg flex justify-between items-center font-mono">
          <span>{error}</span>
          <button onClick={fetchUploads} className="underline hover:text-amber-200">Retry</button>
        </div>
      )}

      {/* SEARCH AND FILTER CONTROL PANEL */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resources by keyword..." 
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700 placeholder-zinc-600 transition-colors"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <select 
            value={classFilter} 
            onChange={(e) => setClassFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-400 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-zinc-700 transition-colors cursor-pointer"
          >
            <option value="ALL">All Classes</option>
            {uniqueClasses.map((cls, idx) => (
              <option key={idx} value={cls}>{cls}</option>
            ))}
          </select>

          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-400 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-zinc-700 font-mono transition-colors cursor-pointer"
          >
            <option value="ALL">All Content Enums</option>
            <option value="NOTE">NOTE</option>
            <option value="PAST_PAPER">PAST_PAPER</option>
            <option value="ASSIGNMENT">ASSIGNMENT</option>
            <option value="REVISION_QUESTION">REVISION_QUESTION</option>
          </select>
        </div>
      </div>

      {/* CORE DATA ENTITY REPOSITORY GRID */}
      <div className="space-y-3">
        {loading ? (
          <div className="h-44 border border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-500 gap-2 font-mono text-xs">
            <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
            <span>Fetching uploaded artifacts from server...</span>
          </div>
        ) : filteredResources.length > 0 ? (
          filteredResources.map((resource) => {
            const displayTitle = resource.title || resource.file_name || 'Untitled Document';
            const className = resource.class_name || resource.classroom?.name || 'Unassigned Class';
            const subjectName = resource.subject_name || resource.subject?.subject_name || 'General';
            const fileSizeDisplay = typeof resource.file_size === 'number' 
              ? `${(resource.file_size / (1024 * 1024)).toFixed(2)} MB` 
              : (resource.file_size || 'N/A');

            return (
              <div 
                key={resource.id} 
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-lg group"
              >
                
                {/* LEFT CONTAINER: METADATA & DESCRIPTIONS */}
                <div className="flex items-start gap-4 max-w-2xl">
                  <div className={`p-3 rounded-xl border shrink-0 mt-0.5 transition-colors ${
                    resource.status === 'ACTIVE' 
                      ? 'bg-amber-500/5 text-amber-400 border-amber-500/10 group-hover:border-amber-500/20' 
                      : 'bg-zinc-950 text-zinc-600 border-zinc-800'
                  }`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold tracking-wide text-zinc-200 font-mono">
                        "{displayTitle}"
                      </h3>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-zinc-950 text-zinc-500 border border-zinc-800/80 rounded">
                        {resource.resource_type || 'RESOURCE'}
                      </span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                        resource.status === 'ACTIVE'
                          ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/20'
                          : 'bg-zinc-950 text-zinc-500 border-zinc-800'
                      }`}>
                        {resource.status || 'UNKNOWN'}
                      </span>
                    </div>
                    
                    <p className="text-xs text-zinc-400 font-normal leading-relaxed">
                      {resource.description || "No attached resource description metadata."}
                    </p>
                    
                    {/* BOTTOM REPOSITORIES LABELS MATRIX */}
                    <div className="flex items-center gap-3 pt-1 text-[10px] text-zinc-500 font-medium">
                      <span className="text-zinc-400 font-semibold">{className}</span>
                      <span className="text-zinc-600">•</span>
                      <span>{subjectName}</span>
                      <span className="text-zinc-600">•</span>
                      <span className="font-mono text-zinc-600">{fileSizeDisplay}</span>
                    </div>
                  </div>
                </div>

                {/* RIGHT CONTAINER: METRICS MONITOR & CORE TRANSACTIONS */}
                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-zinc-800/60 pt-3 md:pt-0 shrink-0">
                  
                  {/* LIVE AGGREGATED QUANTITIES */}
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="text-center md:text-right min-w-[50px]">
                      <span className="text-zinc-500 block text-[9px] uppercase font-sans font-medium tracking-wider mb-0.5">Views</span>
                      <span className="text-zinc-300 font-bold flex items-center justify-center md:justify-end gap-1 text-xs">
                        <Eye className="w-3 h-3 text-zinc-600" /> {resource.views_count ?? resource.views ?? 0}
                      </span>
                    </div>
                    <div className="text-center md:text-right min-w-[65px]">
                      <span className="text-zinc-500 block text-[9px] uppercase font-sans font-medium tracking-wider mb-0.5">Downloads</span>
                      <span className="text-zinc-300 font-bold flex items-center justify-center md:justify-end gap-1 text-xs">
                        <Download className="w-3 h-3 text-zinc-600" /> {resource.downloads_count ?? resource.downloads ?? 0}
                      </span>
                    </div>
                  </div>

                  {/* OPERATIONAL INTERACTION ROW */}
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => handleToggleStatus(resource.id)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-200 text-zinc-400 transition-colors cursor-pointer"
                      title={resource.status === 'ACTIVE' ? "Archive Material" : "Set Material Live"}
                    >
                      <Archive className="w-3 h-3" />
                      <span>{resource.status === 'ACTIVE' ? 'Archive' : 'Activate'}</span>
                    </button>

                    <button 
                      onClick={() => handleDeleteResource(resource.id)}
                      className="p-1.5 rounded-lg text-xs font-medium bg-zinc-950 border border-zinc-800 hover:border-red-900/50 hover:bg-red-950/20 text-zinc-500 hover:text-red-400 transition-all cursor-pointer"
                      title="Delete Resource Permanently"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>

              </div>
            );
          })
        ) : (
          /* EMPTY SEARCH / NO DATA STATE LAYOUT */
          <div className="h-44 border border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-600 gap-1.5 text-center p-6">
            <BookOpen className="w-6 h-6 text-zinc-700" />
            <p className="text-xs font-medium text-zinc-500">No content artifacts match the current query criteria.</p>
            <p className="text-[10px] text-zinc-600 font-mono">Reset filtering menus or modify search patterns.</p>
          </div>
        )}
      </div>

    </div>
  );
}












// import React, { useState } from 'react';
// import { 
//   BookOpen, 
//   Search, 
//   FileText, 
//   Eye, 
//   Download, 
//   Trash2, 
//   Archive, 
//   CheckCircle2 
// } from 'lucide-react';

// export default function MyUploads() {
//   // Mock relational resource records matching your database schema definitions
//   const [myResources, setMyResources] = useState([
//     {
//       id: 101,
//       title: '2026_Math_Mock_Solutions.pdf',
//       description: 'Complete step-by-step resolution guide for the mid-term mock exam structures.',
//       file_size: '4.2 MB',
//       resource_type: 'PAST_PAPER',
//       status: 'ACTIVE',
//       class_name: 'Class 10A',
//       subject_name: 'Advanced Mathematics',
//       views_count: 84,
//       downloads_count: 72
//     },
//     {
//       id: 102,
//       title: 'Calculus_Ch3_Notes.pdf',
//       description: 'Handwritten lecture breakdowns detailing derivation proofs, limits, and trigonometric chains.',
//       file_size: '1.8 MB',
//       resource_type: 'NOTE',
//       status: 'ACTIVE',
//       class_name: 'Class 10A',
//       subject_name: 'Advanced Mathematics',
//       views_count: 124,
//       downloads_count: 95
//     },
//     {
//       id: 103,
//       title: 'Physics_Lab_Safety_v2.pdf',
//       description: 'Mandatory standard operation procedures for electrical bench experiments and grounding.',
//       file_size: '950 KB',
//       resource_type: 'ASSIGNMENT',
//       status: 'ARCHIVED',
//       class_name: 'Class 11B',
//       subject_name: 'Applied Physics',
//       views_count: 42,
//       downloads_count: 18
//     }
//   ]);

//   // UI Filtering Engine States
//   const [searchQuery, setSearchQuery] = useState('');
//   const [typeFilter, setTypeFilter] = useState('ALL');
//   const [classFilter, setClassFilter] = useState('ALL');

//   // Interactive UI Handler Triggers (Mimicking API updates)
//   const handleToggleStatus = (id) => {
//     setMyResources(prev => prev.map(res => {
//       if (res.id === id) {
//         const targetStatus = res.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE';
//         console.log(`[API MOCK] Patching resource ID ${id} -> setting status to ${targetStatus}`);
//         return { ...res, status: targetStatus };
//       }
//       return res;
//     }));
//   };

//   const handleDeleteResource = (id) => {
//     console.log(`[API MOCK] Firing structural cascade deletion sequence for resource ID: ${id}`);
//     setMyResources(prev => prev.filter(res => res.id !== id));
//   };

//   // Live client-side computation filtering
//   const filteredResources = myResources.filter(res => {
//     const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
//                           res.description.toLowerCase().includes(searchQuery.toLowerCase());
//     const matchesType = typeFilter === 'ALL' || res.resource_type === typeFilter;
//     const matchesClass = classFilter === 'ALL' || res.class_name === classFilter;
//     return matchesSearch && matchesType && matchesClass;
//   });

//   return (
//     <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      
//       {/* HEADER SECTION */}
//       <div>
//         <h1 className="text-xl font-bold tracking-tight text-zinc-100">My Uploaded Resources</h1>
//         <p className="text-xs text-zinc-500">Monitor engagement loops, alter live visibility deployment statuses, or prune old learning materials.</p>
//       </div>

//       {/* SEARCH AND FILTER CONTROL PANEL */}
//       <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xl">
//         <div className="relative w-full sm:w-80">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
//           <input 
//             type="text" 
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             placeholder="Search resources by keyword..." 
//             className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700 placeholder-zinc-600 transition-colors"
//           />
//         </div>

//         <div className="flex gap-2 w-full sm:w-auto justify-end">
//           <select 
//             value={classFilter} 
//             onChange={(e) => setClassFilter(e.target.value)}
//             className="bg-zinc-950 border border-zinc-800 text-zinc-400 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-zinc-700 transition-colors"
//           >
//             <option value="ALL">All Classes</option>
//             <option value="Class 10A">Class 10A</option>
//             <option value="Class 11B">Class 11B</option>
//           </select>

//           <select 
//             value={typeFilter} 
//             onChange={(e) => setTypeFilter(e.target.value)}
//             className="bg-zinc-950 border border-zinc-800 text-zinc-400 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-zinc-700 font-mono transition-colors"
//           >
//             <option value="ALL">All Content Enums</option>
//             <option value="NOTE">NOTE</option>
//             <option value="PAST_PAPER">PAST_PAPER</option>
//             <option value="ASSIGNMENT">ASSIGNMENT</option>
//             <option value="REVISION_QUESTION">REVISION_QUESTION</option>
//           </select>
//         </div>
//       </div>

//       {/* CORE DATA ENTITY REPOSITORY GRID */}
//       <div className="space-y-3">
//         {filteredResources.length > 0 ? (
//           filteredResources.map((resource) => (
//             <div 
//               key={resource.id} 
//               className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-lg group"
//             >
              
//               {/* LEFT CONTAINER: METADATA & DESCRIPTIONS */}
//               <div className="flex items-start gap-4 max-w-2xl">
//                 <div className={`p-3 rounded-xl border shrink-0 mt-0.5 transition-colors ${
//                   resource.status === 'ACTIVE' 
//                     ? 'bg-amber-500/5 text-amber-400 border-amber-500/10 group-hover:border-amber-500/20' 
//                     : 'bg-zinc-950 text-zinc-600 border-zinc-800'
//                 }`}>
//                   <FileText className="w-5 h-5" />
//                 </div>
                
//                 <div className="space-y-1">
//                   <div className="flex items-center gap-2 flex-wrap">
//                     <h3 className="text-sm font-semibold tracking-wide text-zinc-200 font-mono">
//                       "{resource.title}"
//                     </h3>
//                     <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-zinc-950 text-zinc-500 border border-zinc-800/80 rounded">
//                       {resource.resource_type}
//                     </span>
//                     <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
//                       resource.status === 'ACTIVE'
//                         ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/20'
//                         : 'bg-zinc-950 text-zinc-500 border-zinc-800'
//                     }`}>
//                       {resource.status}
//                     </span>
//                   </div>
                  
//                   <p className="text-xs text-zinc-400 font-normal leading-relaxed">
//                     {resource.description || "No attached resource description metadata."}
//                   </p>
                  
//                   {/* BOTTOM REPOSITORIES LABELS MATRIX */}
//                   <div className="flex items-center gap-3 pt-1 text-[10px] text-zinc-500 font-medium">
//                     <span className="text-zinc-400 font-semibold">{resource.class_name}</span>
//                     <span className="text-zinc-600">•</span>
//                     <span>{resource.subject_name}</span>
//                     <span className="text-zinc-600">•</span>
//                     <span className="font-mono text-zinc-600">{resource.file_size}</span>
//                   </div>
//                 </div>
//               </div>

//               {/* RIGHT CONTAINER: METRICS MONITOR & CORE TRANSACTIONS */}
//               <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-zinc-800/60 pt-3 md:pt-0 shrink-0">
                
//                 {/* LIVE AGGREGATED QUANTITIES */}
//                 <div className="flex items-center gap-4 text-xs font-mono">
//                   <div className="text-center md:text-right min-w-[50px]">
//                     <span className="text-zinc-500 block text-[9px] uppercase font-sans font-medium tracking-wider mb-0.5">Views</span>
//                     <span className="text-zinc-300 font-bold flex items-center justify-center md:justify-end gap-1 text-xs">
//                       <Eye className="w-3 h-3 text-zinc-600" /> {resource.views_count}
//                     </span>
//                   </div>
//                   <div className="text-center md:text-right min-w-[65px]">
//                     <span className="text-zinc-500 block text-[9px] uppercase font-sans font-medium tracking-wider mb-0.5">Downloads</span>
//                     <span className="text-zinc-300 font-bold flex items-center justify-center md:justify-end gap-1 text-xs">
//                       <Download className="w-3 h-3 text-zinc-600" /> {resource.downloads_count}
//                     </span>
//                   </div>
//                 </div>

//                 {/* OPERATIONAL INTERACTION ROW */}
//                 <div className="flex items-center gap-1.5">
//                   <button 
//                     onClick={() => handleToggleStatus(resource.id)}
//                     className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-200 text-zinc-400 transition-colors"
//                     title={resource.status === 'ACTIVE' ? "Archive Material" : "Set Material Live"}
//                   >
//                     <Archive className="w-3 h-3" />
//                     <span>{resource.status === 'ACTIVE' ? 'Archive' : 'Activate'}</span>
//                   </button>
//                   <button 
//                     onClick={() => handleDeleteResource(resource.id)}
//                     className="p-1.5 rounded-lg text-xs font-medium bg-zinc-950 border border-zinc-800 hover:border-red-900/50 hover:bg-red-950/20 text-zinc-500 hover:text-red-400 transition-all"
//                     title="Delete Resource Permanently"
//                   >
//                     <Trash2 className="w-3.5 h-3.5" />
//                   </button>
//                 </div>
//               </div>

//             </div>
//           ))
//         ) : (
//           /* EMPTY SEARCH STATE LAYOUT */
//           <div className="h-44 border border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-600 gap-1.5 text-center p-6">
//             <BookOpen className="w-6 h-6 text-zinc-700" />
//             <p className="text-xs font-medium text-zinc-500">No content artifacts match the current query criteria.</p>
//             <p className="text-[10px] text-zinc-600 font-mono">Reset filtering menus or modify search patterns.</p>
//           </div>
//         )}
//       </div>

//     </div>
//   );
// }