import React, { useState, useEffect } from 'react';
import { Download, ExternalLink } from 'lucide-react';
import { 
  getStudentCurriculum, 
  trackResourceView, 
  trackResourceDownload 
} from '../../api/student_portal_subj'; 

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

export default function MySubjectsPortal({ 
  subjectBinder: initialSubjectBinder = [], 
  studentContext: initialStudentContext = null, 
  getTypeBadgeStyle, 
  colorBridges = ['from-zinc-900 to-zinc-950 border-zinc-800'] 
}) {
  const [subjectBinder, setSubjectBinder] = useState(initialSubjectBinder);
  const [studentContext, setStudentContext] = useState(initialStudentContext);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter states
  const [selectedType, setSelectedType] = useState('ALL');

  // Helper to convert relative server paths to full backend URLs
  const getFullFileUrl = (filePath, isDownload = false) => {
    if (!filePath || filePath === '#') return '#';
    
    let base = filePath;
    if (!filePath.startsWith('http://') && !filePath.startsWith('https://')) {
      base = `${API_BASE_URL}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
    }

    if (isDownload) {
      const separator = base.includes('?') ? '&' : '?';
      return `${base}${separator}download=true`;
    }
    return base;
  };

  // =========================================================================
  // FETCH CURRICULUM DATA FROM API
  // =========================================================================
  const fetchCurriculum = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStudentCurriculum();
      if (data) {
        setSubjectBinder(Array.isArray(data) ? data : data.subject_binder || []);
        if (data.student_context) {
          setStudentContext(data.student_context);
        }
      }
    } catch (err) {
      console.error("Failed to fetch curriculum from API:", err);
      setError("Unable to load latest curriculum data. Showing cached/provided content.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurriculum();
  }, []);

  // Sync internal state if prop updates externally
  useEffect(() => {
    if (initialSubjectBinder.length > 0 && subjectBinder.length === 0) {
      setSubjectBinder(initialSubjectBinder);
    }
  }, [initialSubjectBinder]);

  // Sync studentContext if prop updates externally
  useEffect(() => {
    if (initialStudentContext) {
      setStudentContext(initialStudentContext);
    }
  }, [initialStudentContext]);

  // =========================================================================
  // RESOURCE ACTIONS (VIEW & DOWNLOAD WITH TRACKING)
  // =========================================================================

  const handleViewResource = async (file) => {
    if (file?.id && !file.id.toString().startsWith('mock-')) {
      try {
        await trackResourceView(file.id);
        console.log(`✅ Tracked view for resource ID [${file.id}]`);
      } catch (err) {
        console.error(`⚠️ Failed to track view for resource ID [${file.id}]:`, err);
      }
    }

    // Explicitly pass false for view mode
    const fullUrl = getFullFileUrl(file?.file_path, false);
    if (fullUrl !== '#') {
      window.open(fullUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert(`Opening preview stream for: "${file.file_name}"`);
    }
  };

  const handleDownloadResource = async (file) => {
    if (file?.id && !file.id.toString().startsWith('mock-')) {
      try {
        await trackResourceDownload(file.id);
        console.log(`✅ Tracked download for resource ID [${file.id}]`);
      } catch (err) {
        console.error(`⚠️ Failed to track download for resource ID [${file.id}]:`, err);
      }
    }

    executeLocalCompDownload(file);
  };

  const executeLocalCompDownload = (file) => {
    // Explicitly pass true for download mode (?download=true)
    const fullUrl = getFullFileUrl(file?.file_path, true);

    if (!file || fullUrl === '#') {
      console.log(`📡 Simulating direct download file stream for: ${file?.file_name}`);
      alert(`Piping "${file?.file_name}" straight to your local downloads folder!`);
      return;
    }

    try {
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = fullUrl;
      downloadAnchor.download = file.file_name || 'download';
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
    } catch (err) {
      console.error("Download pipeline execution failure:", err);
    }
  };

  const rawResources = selectedSubject?.resources && selectedSubject.resources.length > 0 
    ? selectedSubject.resources 
    : [];

  const activeResources = selectedType === 'ALL' 
    ? rawResources 
    : rawResources.filter(r => r.resource_type === selectedType);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      
      {error && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs p-3 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={fetchCurriculum} className="underline hover:text-amber-200 font-mono">Retry</button>
        </div>
      )}

      {!selectedSubject ? (
        <>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-100">My Enrolled Curriculum</h1>
              <p className="text-xs text-zinc-500">Select a subject channel path to browse distributed resources and academic timelines.</p>
            </div>
            {loading && <span className="text-xs font-mono text-sky-400 animate-pulse">Syncing catalog...</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {subjectBinder.map((course, idx) => {
              const styleTheme = colorBridges[idx % colorBridges.length];
              
              return (
                <div 
                  key={course.id || idx} 
                  className={`bg-gradient-to-r border p-5 rounded-xl flex flex-col justify-between transition-all hover:scale-[1.01] hover:shadow-lg duration-200 ${styleTheme}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold tracking-wide text-zinc-100">{course.subject_name}</h4>
                      <span className="text-[10px] font-mono bg-zinc-950/50 px-2 py-0.5 border border-zinc-800 rounded text-zinc-400">
                        {course.subject_code}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400/80 line-clamp-2 pr-4">
                      {course.description || "No curriculum description cataloged for this specific routing block."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 my-5 bg-zinc-950/40 p-3 rounded-lg border border-zinc-800/40 font-mono text-[10px] text-zinc-400">
                    <div className="flex items-center gap-1">
                      <span>📁 Notes:</span>
                      <span className="text-zinc-200 font-bold">{course.metrics?.NOTE || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>📝 Past Papers:</span>
                      <span className="text-zinc-200 font-bold">{course.metrics?.PAST_PAPER || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>📋 Assignments:</span>
                      <span className="text-zinc-200 font-bold">{course.metrics?.ASSIGNMENT || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>❓ Revisions:</span>
                      <span className="text-zinc-200 font-bold">{course.metrics?.REVISION_QUESTION || 0}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedSubject(course)}
                    className="w-full text-xs font-semibold bg-zinc-900 text-zinc-300 border border-zinc-800/80 py-2 rounded-lg hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-center cursor-pointer"
                  >
                    View Document Repository &rarr;
                  </button>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <div className="space-y-4">
            <button 
              onClick={() => {
                setSelectedSubject(null);
                setSelectedType('ALL');
              }}
              className="text-[11px] font-mono text-zinc-500 hover:text-sky-400 transition-colors flex items-center gap-1 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-md cursor-pointer"
            >
              &larr; Back to All Subjects
            </button>

            <div className="flex justify-between items-start border-b border-zinc-800 pb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
                  {selectedSubject.subject_name} 
                  <span className="text-xs font-mono font-normal bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded border border-zinc-800">
                    {selectedSubject.subject_code}
                  </span>
                </h2>
                <p className="text-xs text-zinc-500 mt-1">{selectedSubject.description}</p>
              </div>
              <div className="text-[10px] font-mono font-medium text-zinc-500 bg-zinc-900 px-3 py-1.5 border border-zinc-800 rounded-md">
                Channel Instance: <span className="text-sky-400 font-bold">{studentContext?.className || "N/A"}</span>
              </div>
            </div>

            <div className="flex gap-2 text-[11px] font-mono">
              <select 
                value={selectedType} 
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 text-zinc-400 px-2.5 py-1 rounded-md outline-none focus:border-zinc-700 cursor-pointer"
              >
                <option value="ALL">All Types</option>
                <option value="NOTE">Notes</option>
                <option value="PAST_PAPER">Past Papers</option>
                <option value="ASSIGNMENT">Assignments</option>
                <option value="REVISION_QUESTION">Revisions</option>
              </select>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-950 border-b border-zinc-800 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                      <th className="py-3 px-4">Document Name</th>
                      <th className="py-3 px-4">Type Alignment</th>
                      <th className="py-3 px-4">Allocated Size</th>
                      <th className="py-3 px-4">Published By</th>
                      <th className="py-3 px-4 text-right">Repository Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-xs">
                    {activeResources.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-zinc-500 font-mono text-xs">
                          No matching resources found for this filter selection.
                        </td>
                      </tr>
                    ) : (
                      activeResources.map((file) => (
                        <tr key={file.id} className="hover:bg-zinc-950/40 transition-colors group">
                          <td className="py-3.5 px-4 font-mono font-medium text-zinc-200">
                            "{file.file_name}"
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 border rounded ${getTypeBadgeStyle ? getTypeBadgeStyle(file.resource_type) : 'bg-zinc-800 text-zinc-300 border-zinc-700'}`}>
                              {file.resource_type}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-zinc-400 text-[11px]">
                            {file.file_size ? `${(file.file_size / (1024 * 1024)).toFixed(2)} MB` : 'N/A'}
                          </td>
                          <td className="py-3.5 px-4 text-zinc-400">
                            {file.uploader ? `${file.uploader.first_name} ${file.uploader.last_name}` : "System Admin"}
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <button 
                              onClick={() => handleViewResource(file)}
                              className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded text-[11px] text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all inline-flex items-center gap-1 font-medium cursor-pointer"
                            >
                              <span>View</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                            
                            <button 
                              onClick={() => handleDownloadResource(file)}
                              className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded text-[11px] text-zinc-400 hover:text-sky-400 hover:border-sky-500/30 transition-all inline-flex items-center gap-1 font-medium shadow-sm cursor-pointer"
                            >
                              <span>Download</span>
                              <Download className="w-2.5 h-2.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}















// import React, { useState, useEffect } from 'react';
// import { Download, ExternalLink } from 'lucide-react';
// import { 
//   getStudentCurriculum, 
//   trackResourceView, 
//   trackResourceDownload 
// } from '../../api/student_portal_subj'; 

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

// export default function MySubjectsPortal({ 
//   subjectBinder: initialSubjectBinder = [], 
//   studentContext: initialStudentContext = null, 
//   getTypeBadgeStyle, 
//   colorBridges = ['from-zinc-900 to-zinc-950 border-zinc-800'] 
// }) {
//   const [subjectBinder, setSubjectBinder] = useState(initialSubjectBinder);
//   // Ensure setStudentContext is declared here with useState:
//   const [studentContext, setStudentContext] = useState(initialStudentContext);
//   const [selectedSubject, setSelectedSubject] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Filter states
//   const [selectedType, setSelectedType] = useState('ALL');

//   // Helper to convert relative server paths to full backend URLs
//   const getFullFileUrl = (filePath, isDownload = false) => {
//     if (!filePath || filePath === '#') return '#';
    
//     let base = filePath;
//     if (!filePath.startsWith('http://') && !filePath.startsWith('https://')) {
//       base = `${API_BASE_URL}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
//     }

//     if (isDownload) {
//       const separator = base.includes('?') ? '&' : '?';
//       return `${base}${separator}download=true`;
//     }
//     return base;
//   };
//   // const getFullFileUrl = (filePath) => {
//   //   if (!filePath || filePath === '#') return '#';
//   //   if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
//   //     return filePath;
//   //   }
//   //   return `${API_BASE_URL}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
//   // };

//   // =========================================================================
//   // FETCH CURRICULUM DATA FROM API
//   // =========================================================================
//   const fetchCurriculum = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await getStudentCurriculum();
//       if (data) {
//         setSubjectBinder(Array.isArray(data) ? data : data.subject_binder || []);
//         if (data.student_context) {
//           setStudentContext(data.student_context);
//         }
//       }
//     } catch (err) {
//       console.error("Failed to fetch curriculum from API:", err);
//       setError("Unable to load latest curriculum data. Showing cached/provided content.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCurriculum();
//   }, []);

//   // Sync internal state if prop updates externally
//   useEffect(() => {
//     if (initialSubjectBinder.length > 0 && subjectBinder.length === 0) {
//       setSubjectBinder(initialSubjectBinder);
//     }
//   }, [initialSubjectBinder]);

//   // Sync studentContext if prop updates externally
//   useEffect(() => {
//     if (initialStudentContext) {
//       setStudentContext(initialStudentContext);
//     }
//   }, [initialStudentContext]);

//   // =========================================================================
//   // RESOURCE ACTIONS (VIEW & DOWNLOAD WITH TRACKING)
//   // =========================================================================

//   const handleViewResource = async (file) => {
//     if (file?.id && !file.id.toString().startsWith('mock-')) {
//       try {
//         await trackResourceView(file.id);
//         console.log(`✅ Tracked view for resource ID [${file.id}]`);
//       } catch (err) {
//         console.error(`⚠️ Failed to track view for resource ID [${file.id}]:`, err);
//       }
//     }

//     const fullUrl = getFullFileUrl(file?.file_path);
//     if (fullUrl !== '#') {
//       window.open(fullUrl, '_blank', 'noopener,noreferrer');
//     } else {
//       alert(`Opening preview stream for: "${file.file_name}"`);
//     }
//   };

//   const handleDownloadResource = async (file) => {
//     if (file?.id && !file.id.toString().startsWith('mock-')) {
//       try {
//         await trackResourceDownload(file.id);
//         console.log(`✅ Tracked download for resource ID [${file.id}]`);
//       } catch (err) {
//         console.error(`⚠️ Failed to track download for resource ID [${file.id}]:`, err);
//       }
//     }

//     executeLocalCompDownload(file);
//   };

//   // View mode: passes isDownload = false
//     const fullUrl = getFullFileUrl(file?.file_path, false);
//     if (fullUrl !== '#') {
//       window.open(fullUrl, '_blank', 'noopener,noreferrer');
//     } else {
//       alert(`Opening preview stream for: "${file.file_name}"`);
//     }
//   };

//   const executeLocalCompDownload = (file) => {
//     // Download mode: passes isDownload = true to append ?download=true
//     const fullUrl = getFullFileUrl(file?.file_path, true);

//     if (!file || fullUrl === '#') {
//       console.log(`📡 Simulating direct download file stream for: ${file?.file_name}`);
//       alert(`Piping "${file?.file_name}" straight to your local downloads folder!`);
//       return;
//     }

//     try {
//       const downloadAnchor = document.createElement('a');
//       downloadAnchor.href = fullUrl;
//       downloadAnchor.download = file.file_name || 'download';
//       document.body.appendChild(downloadAnchor);
//       downloadAnchor.click();
//       document.body.removeChild(downloadAnchor);
//     } catch (err) {
//       console.error("Download pipeline execution failure:", err);
//     }
//   };

//   // const executeLocalCompDownload = (file) => {
//   //   const fullUrl = getFullFileUrl(file?.file_path);
//   //   if (!file || fullUrl === '#') {
//   //     console.log(`📡 Simulating direct download file stream for: ${file?.file_name}`);
//   //     alert(`Piping "${file?.file_name}" straight to your local downloads folder!`);
//   //     return;
//   //   }

//   //   try {
//   //     const downloadAnchor = document.createElement('a');
//   //     downloadAnchor.href = fullUrl;
//   //     downloadAnchor.download = file.file_name || 'download';
//   //     document.body.appendChild(downloadAnchor);
//   //     downloadAnchor.click();
//   //     document.body.removeChild(downloadAnchor);
//   //   } catch (err) {
//   //     console.error("Download pipeline execution failure:", err);
//   //   }
//   // };

//   const rawResources = selectedSubject?.resources && selectedSubject.resources.length > 0 
//     ? selectedSubject.resources 
//     : [];

//   const activeResources = selectedType === 'ALL' 
//     ? rawResources 
//     : rawResources.filter(r => r.resource_type === selectedType);

//   return (
//     <div className="w-full space-y-6 animate-in fade-in duration-200">
      
//       {error && (
//         <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs p-3 rounded-lg flex justify-between items-center">
//           <span>{error}</span>
//           <button onClick={fetchCurriculum} className="underline hover:text-amber-200 font-mono">Retry</button>
//         </div>
//       )}

//       {!selectedSubject ? (
//         <>
//           <div className="flex justify-between items-end">
//             <div>
//               <h1 className="text-xl font-bold tracking-tight text-zinc-100">My Enrolled Curriculum</h1>
//               <p className="text-xs text-zinc-500">Select a subject channel path to browse distributed resources and academic timelines.</p>
//             </div>
//             {loading && <span className="text-xs font-mono text-sky-400 animate-pulse">Syncing catalog...</span>}
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//             {subjectBinder.map((course, idx) => {
//               const styleTheme = colorBridges[idx % colorBridges.length];
              
//               return (
//                 <div 
//                   key={course.id || idx} 
//                   className={`bg-gradient-to-r border p-5 rounded-xl flex flex-col justify-between transition-all hover:scale-[1.01] hover:shadow-lg duration-200 ${styleTheme}`}
//                 >
//                   <div className="space-y-2">
//                     <div className="flex items-center justify-between">
//                       <h4 className="text-sm font-bold tracking-wide text-zinc-100">{course.subject_name}</h4>
//                       <span className="text-[10px] font-mono bg-zinc-950/50 px-2 py-0.5 border border-zinc-800 rounded text-zinc-400">
//                         {course.subject_code}
//                       </span>
//                     </div>
//                     <p className="text-xs text-zinc-400/80 line-clamp-2 pr-4">
//                       {course.description || "No curriculum description cataloged for this specific routing block."}
//                     </p>
//                   </div>

//                   <div className="grid grid-cols-2 gap-2 my-5 bg-zinc-950/40 p-3 rounded-lg border border-zinc-800/40 font-mono text-[10px] text-zinc-400">
//                     <div className="flex items-center gap-1">
//                       <span>📁 Notes:</span>
//                       <span className="text-zinc-200 font-bold">{course.metrics?.NOTE || 0}</span>
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <span>📝 Past Papers:</span>
//                       <span className="text-zinc-200 font-bold">{course.metrics?.PAST_PAPER || 0}</span>
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <span>📋 Assignments:</span>
//                       <span className="text-zinc-200 font-bold">{course.metrics?.ASSIGNMENT || 0}</span>
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <span>❓ Revisions:</span>
//                       <span className="text-zinc-200 font-bold">{course.metrics?.REVISION_QUESTION || 0}</span>
//                     </div>
//                   </div>

//                   <button 
//                     onClick={() => setSelectedSubject(course)}
//                     className="w-full text-xs font-semibold bg-zinc-900 text-zinc-300 border border-zinc-800/80 py-2 rounded-lg hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-center"
//                   >
//                     View Document Repository &rarr;
//                   </button>
//                 </div>
//               );
//             })}
//           </div>
//         </>
//       ) : (
//         <>
//           <div className="space-y-4">
//             <button 
//               onClick={() => {
//                 setSelectedSubject(null);
//                 setSelectedType('ALL');
//               }}
//               className="text-[11px] font-mono text-zinc-500 hover:text-sky-400 transition-colors flex items-center gap-1 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-md"
//             >
//               &larr; Back to All Subjects
//             </button>

//             <div className="flex justify-between items-start border-b border-zinc-800 pb-4">
//               <div>
//                 <h2 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
//                   {selectedSubject.subject_name} 
//                   <span className="text-xs font-mono font-normal bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded border border-zinc-800">
//                     {selectedSubject.subject_code}
//                   </span>
//                 </h2>
//                 <p className="text-xs text-zinc-500 mt-1">{selectedSubject.description}</p>
//               </div>
//               <div className="text-[10px] font-mono font-medium text-zinc-500 bg-zinc-900 px-3 py-1.5 border border-zinc-800 rounded-md">
//                 Channel Instance: <span className="text-sky-400 font-bold">{studentContext?.className || "N/A"}</span>
//               </div>
//             </div>

//             <div className="flex gap-2 text-[11px] font-mono">
//               <select 
//                 value={selectedType} 
//                 onChange={(e) => setSelectedType(e.target.value)}
//                 className="bg-zinc-900 border border-zinc-800 text-zinc-400 px-2.5 py-1 rounded-md outline-none focus:border-zinc-700 cursor-pointer"
//               >
//                 <option value="ALL">All Types</option>
//                 <option value="NOTE">Notes</option>
//                 <option value="PAST_PAPER">Past Papers</option>
//                 <option value="ASSIGNMENT">Assignments</option>
//                 <option value="REVISION_QUESTION">Revisions</option>
//               </select>
//             </div>

//             <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
//               <div className="overflow-x-auto">
//                 <table className="w-full text-left border-collapse">
//                   <thead>
//                     <tr className="bg-zinc-950 border-b border-zinc-800 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
//                       <th className="py-3 px-4">Document Name</th>
//                       <th className="py-3 px-4">Type Alignment</th>
//                       <th className="py-3 px-4">Allocated Size</th>
//                       <th className="py-3 px-4">Published By</th>
//                       <th className="py-3 px-4 text-right">Repository Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-zinc-800/60 text-xs">
//                     {activeResources.length === 0 ? (
//                       <tr>
//                         <td colSpan="5" className="py-8 text-center text-zinc-500 font-mono text-xs">
//                           No matching resources found for this filter selection.
//                         </td>
//                       </tr>
//                     ) : (
//                       activeResources.map((file) => (
//                         <tr key={file.id} className="hover:bg-zinc-950/40 transition-colors group">
//                           <td className="py-3.5 px-4 font-mono font-medium text-zinc-200">
//                             "{file.file_name}"
//                           </td>
//                           <td className="py-3.5 px-4">
//                             <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 border rounded ${getTypeBadgeStyle ? getTypeBadgeStyle(file.resource_type) : 'bg-zinc-800 text-zinc-300 border-zinc-700'}`}>
//                               {file.resource_type}
//                             </span>
//                           </td>
//                           <td className="py-3.5 px-4 font-mono text-zinc-400 text-[11px]">
//                             {file.file_size ? `${(file.file_size / (1024 * 1024)).toFixed(2)} MB` : 'N/A'}
//                           </td>
//                           <td className="py-3.5 px-4 text-zinc-400">
//                             {file.uploader ? `${file.uploader.first_name} ${file.uploader.last_name}` : "System Admin"}
//                           </td>
//                           <td className="py-3.5 px-4 text-right space-x-2">
//                             <button 
//                               onClick={() => handleViewResource(file)}
//                               className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded text-[11px] text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all inline-flex items-center gap-1 font-medium cursor-pointer"
//                             >
//                               <span>View</span>
//                               <ExternalLink className="w-2.5 h-2.5" />
//                             </button>
                            
//                             <button 
//                               onClick={() => handleDownloadResource(file)}
//                               className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded text-[11px] text-zinc-400 hover:text-sky-400 hover:border-sky-500/30 transition-all inline-flex items-center gap-1 font-medium shadow-sm cursor-pointer"
//                             >
//                               <span>Download</span>
//                               <Download className="w-2.5 h-2.5" />
//                             </button>
//                           </td>
//                         </tr>
//                       ))
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

