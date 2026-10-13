import React, { useState, useEffect } from 'react';
import { Search, FileText, ExternalLink, Download, RefreshCw } from 'lucide-react';
import { 
  getStudentDownloadHistory, 
  trackResourceView, 
  trackResourceDownload 
} from '../../api/student_downloads.js';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

export default function DownloadsPortal({ getTypeBadgeStyle }) {
  const [downloadLogs, setDownloadLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to convert relative server paths to full backend URLs
  const getFullFileUrl = (filePath, isDownload = false) => {
    if (!filePath || filePath === '#') return '#';
    let base = filePath;
    if (!filePath.startsWith('http://') && !filePath.startsWith('https://')) {
      base = `${API_BASE_URL}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
    }
    return isDownload ? `${base}${base.includes('?') ? '&' : '?'}download=true` : base;
  };

  // 🔥 FETCH LIVE DATA FROM FLASK BACKEND
  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStudentDownloadHistory();
      if (Array.isArray(data)) {
        setDownloadLogs(data);
      }
    } catch (err) {
      console.error("Failed to fetch download history:", err);
      setError("Failed to load real download logs from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = downloadLogs.filter(log => {
    const fileName = log.resource?.file_name?.toLowerCase() || '';
    const subjectName = log.resource?.subject?.subject_name?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return fileName.includes(query) || subjectName.includes(query);
  });

  const handleView = async (file) => {
    if (!file) return;
    if (file.id) await trackResourceView(file.id);
    const fullUrl = getFullFileUrl(file.file_path, false);
    if (fullUrl !== '#') window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = async (file) => {
    if (!file) return;
    if (file.id) {
      await trackResourceDownload(file.id);
      fetchLogs(); // Refresh logs to reflect the new download
    }
    const fullUrl = getFullFileUrl(file.file_path, true);
    if (fullUrl !== '#') {
      const a = document.createElement('a');
      a.href = fullUrl;
      a.download = file.file_name || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      
      {/* HEADER META TITLES */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">Personal Archive &amp; Download History</h1>
          <p className="text-xs text-zinc-500">Review and instantly re-access all files you have previously synced to your local machine.</p>
        </div>
        
        <div className="flex items-center gap-3 self-start md:self-center">
          <button 
            onClick={fetchLogs} 
            disabled={loading}
            className="p-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 rounded-md transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
          <div className="text-[10px] font-mono font-medium text-zinc-500 bg-zinc-900 px-3 py-1.5 border border-zinc-800 rounded-md">
            Total Synced Materials: <span className="text-sky-400 font-bold">{downloadLogs.length}</span>
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input 
          type="text" 
          placeholder="Search your offline archive..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-1.5 text-xs focus:outline-none focus:border-zinc-700 transition-colors text-zinc-300 placeholder-zinc-600"
        />
      </div>

      {/* TABLE */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950 border-b border-zinc-800 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                <th className="py-3 px-4">Document Name</th>
                <th className="py-3 px-4">Associated Subject</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Allocated Size</th>
                <th className="py-3 px-4">Synced Timestamp</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 font-mono text-[11px] text-zinc-500 animate-pulse">
                    Syncing download archive from backend...
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  const file = log.resource;
                  return (
                    <tr key={log.id} className="hover:bg-zinc-950/40 transition-colors group">
                      <td className="py-3.5 px-4 font-mono font-medium text-zinc-200 flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-zinc-500 group-hover:text-sky-400 transition-colors shrink-0" />
                        <span className="truncate max-w-[220px]">"{file?.file_name || 'Unnamed Resource'}"</span>
                      </td>

                      <td className="py-3.5 px-4 text-zinc-300 font-medium">
                        {file?.subject?.subject_name || 'General Channel'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 border rounded ${getTypeBadgeStyle ? getTypeBadgeStyle(file?.resource_type) : 'bg-zinc-800 text-zinc-300 border-zinc-700'}`}>
                          {file?.resource_type || 'RESOURCE'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-zinc-400 text-[11px]">
                        {file?.file_size ? `${(file.file_size / (1024 * 1024)).toFixed(2)} MB` : '0.00 MB'}
                      </td>

                      <td className="py-3.5 px-4 text-zinc-500 font-mono text-[11px]">
                        {log.time_ago || (log.downloaded_at ? new Date(log.downloaded_at).toLocaleDateString() : 'N/A')}
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button 
                          onClick={() => handleView(file)}
                          className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded text-[11px] text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all inline-flex items-center gap-1 font-medium cursor-pointer"
                        >
                          <span>View</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                        
                        <button 
                          onClick={() => handleDownload(file)}
                          className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded text-[11px] text-zinc-400 hover:text-sky-400 hover:border-sky-500/30 transition-all inline-flex items-center gap-1 font-medium shadow-sm cursor-pointer"
                        >
                          <span>Download</span>
                          <Download className="w-2.5 h-2.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-12 font-mono text-[11px] text-zinc-600 bg-zinc-950/20 border border-dashed border-zinc-800/40 rounded-b-xl m-2">
                    No matching offline download records located on this terminal pipeline grid.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}











