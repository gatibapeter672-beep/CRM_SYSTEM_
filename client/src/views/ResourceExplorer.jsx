import React, { useState } from 'react';
import { 
  BookOpen, 
  FileText, 
  Award, 
  Folder, 
  DownloadCloud, 
  Eye, 
  Calendar, 
  HardDrive,
  Tag,
  ChevronRight
} from 'lucide-react';

// Mock data structures mirroring your exact backend serialization payloads
const MOCK_CLASSES = [
  { id: 1, class_name: "Form 1 / Grade 9", description: "Introductory curriculum" },
  { id: 2, class_name: "Form 2 / Grade 10", description: "Intermediate studies" },
  { id: 3, class_name: "Form 3 / Grade 11", description: "Advanced academic tracks" }
];

const MOCK_SUBJECTS_BY_CLASS = {
  1: [
    { id: 101, subject_name: "Mathematics", subject_code: "MATH-01" },
    { id: 102, subject_name: "Physics", subject_code: "PHYS-01" },
    { id: 103, subject_name: "History", subject_code: "HIST-01" }
  ],
  2: [
    { id: 101, subject_name: "Mathematics", subject_code: "MATH-02" },
    { id: 104, subject_name: "Chemistry", subject_code: "CHEM-02" }
  ]
};

const MOCK_RESOURCES = [
  {
    id: 50,
    title: "Introduction to Quadratic Equations",
    description: "Detailed breakdown of the quadratic formula with worked examples and derivation steps.",
    file_name: "quadratic_equations_v1.pdf",
    file_size: 2450000, // 2.45 MB
    file_type: "PDF",
    resource_type: "NOTE",
    subject_id: 101,
    class_id: 1,
    created_at: "2026-06-15T08:30:00Z",
    view_count: 142,
    download_count: 89,
    tags: ["Algebra", "Equations", "Form1"]
  },
  {
    id: 51,
    title: "2025 Mid-Term Physics Paper 1",
    description: "Past actual mock examination paper focusing on linear motion, forces, and moments.",
    file_name: "phys_midterm_2025.pdf",
    file_size: 4120000,
    file_type: "PDF",
    resource_type: "PAST_PAPER",
    subject_id: 102,
    class_id: 1,
    created_at: "2026-06-20T11:15:00Z",
    view_count: 310,
    download_count: 245,
    tags: ["Mechanics", "Exams", "Forces"]
  }
];

export default function ResourceExplorer() {
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);

  // Helper to format file sizes nicely from bytes
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Helper to get type-specific styling matching your enum choices
  const getTypeBadgeStyles = (type) => {
    switch(type) {
      case 'NOTE': return { bg: 'bg-blue-50 text-blue-700 ring-blue-600/20', icon: BookOpen };
      case 'PAST_PAPER': return { bg: 'bg-amber-50 text-amber-700 ring-amber-600/20', icon: FileText };
      case 'REVISION_QUESTION': return { bg: 'bg-purple-50 text-purple-700 ring-purple-600/20', icon: Award };
      default: return { bg: 'bg-slate-50 text-slate-700 ring-slate-600/20', icon: FileText };
    }
  };

  // Filter logic matching active component selectors
  const filteredResources = MOCK_RESOURCES.filter(res => {
    if (selectedClass && res.class_id !== selectedClass.id) return false;
    if (selectedSubject && res.subject_id !== selectedSubject.id) return false;
    if (selectedTag && !res.tags.includes(selectedTag)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* BREADCRUMB INDICATOR */}
      <div className="flex items-center space-x-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
        <span className="cursor-pointer hover:text-emerald-600" onClick={() => { setSelectedClass(null); setSelectedSubject(null); setSelectedTag(null); }}>Classes</span>
        {selectedClass && (
          <>
            <ChevronRight className="h-3 w-3" />
            <span className="cursor-pointer hover:text-emerald-600" onClick={() => { setSelectedSubject(null); setSelectedTag(null); }}>{selectedClass.class_name}</span>
          </>
        )}
        {selectedSubject && (
          <>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-700">{selectedSubject.subject_name}</span>
          </>
        )}
      </div>

      {/* STEP 1: CLASS SELECTION GRID (Shown if no class is active) */}
      {!selectedClass ? (
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Select Your Class</h1>
            <p className="text-sm text-slate-500">Pick a grade level to explore its linked subjects and study folders.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_CLASSES.map((cls) => (
              <div 
                key={cls.id}
                onClick={() => setSelectedClass(cls)}
                className="group p-6 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-emerald-500 transition-all cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Folder className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{cls.class_name}</h3>
                  <p className="text-xs text-slate-500">{cls.description}</p>
                </div>
                <div className="text-xs font-semibold text-emerald-600 flex items-center space-x-1 pt-2">
                  <span>Enter Folders</span>
                  <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* STEP 2 & 3: MAIN EXPLORATION INTERFACE */
        <div className="space-y-6">
          
          {/* HEADER HEADER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{selectedClass.class_name} Repository</h1>
              <p className="text-sm text-slate-500">Browsing curated notes and documents filtered by your curriculum paths.</p>
            </div>
            <button 
              onClick={() => { setSelectedClass(null); setSelectedSubject(null); setSelectedTag(null); }}
              className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50 self-start md:self-auto shadow-sm"
            >
              Change Class
            </button>
          </div>

          {/* SUBJECT FILTER PILL BAR */}
          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={() => { setSelectedSubject(null); setSelectedTag(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${!selectedSubject ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              All Subjects
            </button>
            {(MOCK_SUBJECTS_BY_CLASS[selectedClass.id] || []).map((sub) => (
              <button
                key={sub.id}
                onClick={() => { setSelectedSubject(sub); setSelectedTag(null); }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${selectedSubject?.id === sub.id ? 'bg-emerald-600 text-white shadow-emerald-600/10' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {sub.subject_name}
              </button>
            ))}
          </div>

          {/* MASTER FILTERED WORKSPACE LIST */}
          <div className="grid grid-cols-1 gap-4">
            {filteredResources.length > 0 ? (
              filteredResources.map((res) => {
                const badge = getTypeBadgeStyles(res.resource_type);
                const BadgeIcon = badge.icon;
                
                return (
                  <div 
                    key={res.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    {/* Information Payload Column */}
                    <div className="space-y-3 max-w-2xl">
                      <div className="flex items-center space-x-2.5 flex-wrap gap-y-1.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ring-1 ring-inset ${badge.bg}`}>
                          <BadgeIcon className="h-3 w-3" />
                          <span>{res.resource_type.replace('_', ' ')}</span>
                        </span>
                        
                        {/* Render Tags dynamically exactly matching ResourceTag maps */}
                        {res.tags.map((tg, idx) => (
                          <span 
                            key={idx} 
                            onClick={() => setSelectedTag(selectedTag === tg ? null : tg)}
                            className={`inline-flex items-center space-x-0.5 text-[10px] font-medium px-2 py-0.5 bg-slate-100 rounded-md cursor-pointer hover:bg-amber-100 hover:text-amber-900 transition-colors ${selectedTag === tg ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-500' : 'text-slate-500'}`}
                          >
                            <Tag className="h-2.5 w-2.5" />
                            <span>{tg}</span>
                          </span>
                        ))}
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-slate-900 leading-snug">{res.title}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{res.description}</p>
                      </div>

                      {/* Meta Tracking Values */}
                      <div className="flex items-center space-x-4 text-[11px] font-medium text-slate-400 flex-wrap gap-y-1">
                        <span className="flex items-center space-x-1"><HardDrive className="h-3 w-3" /> <span>{res.file_type} • {formatBytes(res.file_size)}</span></span>
                        <span className="flex items-center space-x-1"><Calendar className="h-3 w-3" /> <span>{new Date(res.created_at).toLocaleDateString()}</span></span>
                        <span className="flex items-center space-x-1"><Eye className="h-3 w-3" /> <span>{res.view_count} views</span></span>
                        <span className="flex items-center space-x-1"><DownloadCloud className="h-3 w-3" /> <span>{res.download_count} downloads</span></span>
                      </div>
                    </div>

                    {/* Action Triggers Column */}
                    <div className="flex sm:flex-row md:flex-col items-center gap-2 w-full md:w-auto shrink-0 border-t border-slate-100 pt-4 md:pt-0 md:border-transparent">
                      <button className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm">
                        <Eye className="h-3.5 w-3.5" />
                        <span>Preview</span>
                      </button>
                      <button className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/5">
                        <DownloadCloud className="h-3.5 w-3.5" />
                        <span>Download</span>
                      </button>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="text-center p-12 border border-dashed border-slate-200 rounded-2xl bg-white space-y-2">
                <p className="text-sm font-bold text-slate-700">No resources matched this combination</p>
                <p className="text-xs text-slate-400">Try turning off your active tag filter or pick a different subject pill.</p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}