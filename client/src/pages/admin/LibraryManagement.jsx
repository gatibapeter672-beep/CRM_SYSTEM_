import React, { useState } from 'react';

export default function LibraryManagement() {
  // Filter States
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [selectedType, setSelectedType] = useState('All Types');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal Control State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Mock Data for the Academic Resource Library Table
  const mockResources = [
    { id: 1, title: 'Algebra Fundamentals Cheat Sheet', subject: 'Math', classLevel: 'Grade 9', type: 'PDF', downloads: 142 },
    { id: 2, title: 'Intro to Python Programming Assignment', subject: 'CompSci', classLevel: 'Grade 9', type: 'Docx', downloads: 98 },
    { id: 3, title: 'Newtonian Physics Past Paper (2025)', subject: 'Physics', classLevel: 'Grade 11', type: 'PDF', downloads: 84 },
    { id: 4, title: 'Chemical Bonding Lab Manual', subject: 'Chemistry', classLevel: 'Grade 10', type: 'PDF', downloads: 115 },
    { id: 5, title: 'Organic Chemistry Revision Flashcards', subject: 'Chemistry', classLevel: 'Grade 11', type: 'Docx', downloads: 67 },
  ];

  // Unique lists for filtering dropdown options
  const subjects = ['All Subjects', 'Math', 'CompSci', 'Physics', 'Chemistry'];
  const types = ['All Types', 'PDF', 'Docx'];

  // Filter Logic
  const filteredResources = mockResources.filter(resource => {
    const matchesSubject = selectedSubject === 'All Subjects' || resource.subject === selectedSubject;
    const matchesType = selectedType === 'All Types' || resource.type === selectedType;
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          resource.classLevel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 text-neutral-200 w-full">
      
      {/* Header Banner Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between justify-start gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
            📚 Academic Resource Library
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Upload repository assets, manage document tags, and track downloads.
          </p>
        </div>
        
        {/* Quick Search Override Interface Integration helper */}
        <div className="w-full md:w-64">
          <input 
            type="text" 
            placeholder="Search resources, tags, classes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-neutral-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500/40 bg-neutral-900/60 text-white placeholder-neutral-500"
          />
        </div>
      </div>

      {/* Control Bar: Filters & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#18181c] p-4 rounded-xl border border-neutral-800/60 shadow-md">
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Subject Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="appearance-none bg-neutral-900 border border-neutral-800 text-sm rounded-lg px-4 py-2 pr-8 font-medium text-neutral-300 focus:outline-none focus:border-neutral-700 cursor-pointer"
            >
              {subjects.map((sub) => (
                <option key={sub} value={sub} className="bg-neutral-900">{sub}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
              <span className="text-[10px]">▼</span>
            </div>
          </div>

          {/* Asset Type Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="appearance-none bg-neutral-900 border border-neutral-800 text-sm rounded-lg px-4 py-2 pr-8 font-medium text-neutral-300 focus:outline-none focus:border-neutral-700 cursor-pointer"
            >
              {types.map((t) => (
                <option key={t} value={t} className="bg-neutral-900">{t}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
              <span className="text-[10px]">▼</span>
            </div>
          </div>
        </div>

        {/* Upload Resource Button Action Trigger */}
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition duration-150 shadow-sm"
        >
          <span>➕</span> Upload Resource
        </button>
      </div>

      {/* Resource Inventory Table Container */}
      <div className="bg-[#18181c] rounded-xl border border-neutral-800/60 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-900/40 text-neutral-400 text-xs uppercase font-semibold tracking-wider border-b border-neutral-800/80">
                <th className="py-3.5 px-6">Resource Title</th>
                <th className="py-3.5 px-6">Subject</th>
                <th className="py-3.5 px-6">Class</th>
                <th className="py-3.5 px-6">Type</th>
                <th className="py-3.5 px-6 text-right">Downloads</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/40 text-sm text-neutral-300">
              {filteredResources.length > 0 ? (
                filteredResources.map((resource) => (
                  <tr key={resource.id} className="hover:bg-neutral-900/30 transition-colors group">
                    <td className="py-4 px-6 font-medium text-neutral-200 group-hover:text-white transition-colors">
                      "{resource.title}"
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-neutral-900 border border-neutral-800 text-neutral-400">
                        {resource.subject}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-neutral-400">{resource.classLevel}</td>
                    <td className="py-4 px-6">
                      <span className="font-mono text-xs font-medium px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
                        {resource.type.toLowerCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-neutral-400 group-hover:text-neutral-200">
                      {resource.downloads} dls
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-neutral-500 text-sm">
                    No resources matched the selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resource Statistics & Tag Control Section */}
      <div className="bg-[#18181c] rounded-xl border border-neutral-800/60 shadow-md p-6 space-y-6">
        <div className="border-b border-neutral-800/60 pb-3">
          <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
            📊 Resource Statistics & Tag Control
          </h2>
        </div>

        {/* Aggregated Metadata Row cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800/50">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Files</p>
            <p className="text-2xl font-bold text-white mt-1 font-mono">1,240</p>
          </div>
          <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800/50">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Storage</p>
            <p className="text-2xl font-bold text-white mt-1 font-mono">4.2 GB</p>
          </div>
          <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800/50">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Broken Links</p>
            <p className="text-2xl font-bold text-emerald-500 mt-1 font-mono">0</p>
          </div>
        </div>

        {/* Taxonomy / System Associated Tags */}
        <div className="pt-2">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Associated Tags</p>
          <div className="flex flex-wrap gap-2.5">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-neutral-900 text-neutral-400 text-xs border border-neutral-800">
              #ExamPrep <span className="bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono">340</span>
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-neutral-900 text-neutral-400 text-xs border border-neutral-800">
              #Revision <span className="bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono">112</span>
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-neutral-900 text-neutral-400 text-xs border border-neutral-800">
              #Handout <span className="bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono">45</span>
            </span>
          </div>
        </div>
      </div>

      {/* Simple Upload Resource Overlay Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#18181c] rounded-xl shadow-2xl border border-neutral-800 max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-white">Upload New Resource</h3>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed">
              This interface handles index preparation mappings. Direct binary ingestion pipes cleanly into your dedicated storage engine.
            </p>
            <div className="bg-neutral-900 border-2 border-dashed border-neutral-800 p-8 text-center rounded-xl">
              <span className="text-3xl block mb-2">📁</span>
              <span className="text-xs text-neutral-500 font-medium">Drop educational asset payload templates here</span>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-850 rounded-lg border border-neutral-800 transition"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  alert("Client workflow complete. Ready for frontend upload routing logic integration.");
                  setIsUploadModalOpen(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
              >
                Confirm Setup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}