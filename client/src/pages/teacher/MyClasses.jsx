import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Users, 
  BookOpen, 
  TrendingUp, 
  Clock, 
  ChevronRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { getMyClasses } from '../../api/teacher_classes'; // Adjust relative import path as needed

export default function MyClasses() {
  const [classesData, setClassesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pointer state tracking drill-down transition navigation targets
  const [selectedCohort, setSelectedCohort] = useState(null);

  // =========================================================================
  // FETCH ASSIGNED CLASSES & COHORTS FROM BACKEND API
  // =========================================================================
  const fetchClasses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyClasses();
      if (data) {
        const payload = Array.isArray(data) ? data : data.classes || [];
        setClassesData(payload);

        // Keep selected cohort updated if user is in detail view
        if (selectedCohort) {
          const updatedSelected = payload.find(c => c.id === selectedCohort.id);
          if (updatedSelected) {
            setSelectedCohort(updatedSelected);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch teacher classes:", err);
      setError("Unable to load assigned classes. Please try again.");
    }finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      
      {/* ========================================== */}
      {/* STAGE 1: HIGH-LEVEL GRID OVERVIEW (DEFAULT)*/}
      {/* ========================================== */}
      {!selectedCohort ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-100">My Assigned Classes & Cohorts</h1>
              <p className="text-xs text-zinc-500">Select an assigned academic cohort card below to review localized student engagement analytics.</p>
            </div>

            <button 
              onClick={fetchClasses} 
              disabled={loading}
              className="self-start sm:self-auto p-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors flex items-center gap-2 text-xs font-mono cursor-pointer"
              title="Refresh Cohorts List"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
              <span>Sync</span>
            </button>
          </div>

          {/* ERROR BANNER */}
          {error && (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs p-3 rounded-lg flex justify-between items-center font-mono">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{error}</span>
              </div>
              <button onClick={fetchClasses} className="underline hover:text-amber-200 cursor-pointer">Retry</button>
            </div>
          )}

          {/* LOADING STATE SKELETON */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2].map((i) => (
                <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 h-48 animate-pulse flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
                    <div className="h-3 bg-zinc-800/60 rounded w-1/3"></div>
                  </div>
                  <div className="h-8 bg-zinc-800/80 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : classesData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {classesData.map((cohort) => (
                <div 
                  key={cohort.id} 
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl flex flex-col justify-between group hover:border-zinc-700 transition-all"
                >
                  <div>
                    {/* Card Title Header Block */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-base font-bold text-zinc-100 group-hover:text-amber-400 transition-colors">
                          {cohort.class_name}
                        </h3>
                        <p className="text-xs text-zinc-400 font-medium">{cohort.subject_name}</p>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-zinc-950 text-zinc-500 border border-zinc-800 px-2 py-0.5 rounded tracking-wider">
                        {cohort.course_code}
                      </span>
                    </div>

                    {/* Core Metrics Trackers */}
                    <div className="space-y-2.5 my-5">
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <BookOpen className="w-3.5 h-3.5 text-zinc-600" />
                        <span>📁 <strong className="text-zinc-200 font-mono">{cohort.total_uploads ?? 0}</strong> Uploaded Materials</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                        <span>📈 Library Health: <strong className="text-emerald-400 font-mono">{cohort.library_health || '0%'}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Transition Action Trigger */}
                  <button 
                    onClick={() => setSelectedCohort(cohort)}
                    className="w-full mt-2 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-300 font-semibold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>View Roster Analytics</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* EMPTY STATE LAYOUT */
            <div className="h-56 border border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-600 gap-2 text-center p-6">
              <Users className="w-8 h-8 text-zinc-700" />
              <p className="text-xs font-medium text-zinc-400">No classes or cohorts assigned to your account.</p>
              <p className="text-[10px] text-zinc-600 font-mono">Contact the school portal administrator if you believe this is an error.</p>
            </div>
          )}
        </>
      ) : (
        
        // ==========================================
        // STAGE 2: FULL SCREEN ROSTER ACTION (DETAIL)
        // ==========================================
        <div className="space-y-6">
          
          {/* Smart Backward Navigation Action Trigger */}
          <button 
            onClick={() => setSelectedCohort(null)}
            className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-zinc-100 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg hover:border-zinc-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Cohorts</span>
          </button>

          {/* Dedicated Sub-Section Dashboard Header */}
          <div className="border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-zinc-100">
                Cohort Overview: {selectedCohort.class_name}
              </h1>
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                {selectedCohort.course_code}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">Track asset interactions and audit active student profiles linked to this database layer.</p>
          </div>

          {/* Roster Information Data Table Module */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">👥 Student Engagement Roster</h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">
                Total Enrolled: {selectedCohort.students?.length || 0}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-[10px] font-mono uppercase tracking-wider text-zinc-500 bg-zinc-950/40">
                    <th className="py-3 px-5 font-semibold">Student Name</th>
                    <th className="py-3 px-5 font-semibold">Material Reads</th>
                    <th className="py-3 px-5 font-semibold">Last Active Timeline Log</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-xs font-medium">
                  {selectedCohort.students && selectedCohort.students.length > 0 ? (
                    selectedCohort.students.map((student) => (
                      <tr key={student.id} className="hover:bg-zinc-950/30 transition-colors text-zinc-300">
                        <td className="py-3.5 px-5 font-sans tracking-wide text-zinc-200">
                          {student.name}
                        </td>
                        <td className="py-3.5 px-5 font-mono text-zinc-400">
                          {student.documents_read} Documents
                        </td>
                        <td className="py-3.5 px-5 text-zinc-500">
                          <span className="flex items-center gap-1.5 font-sans">
                            <Clock className="w-3 h-3 text-zinc-600" />
                            {student.last_active}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-zinc-500 text-xs font-mono">
                        No students currently enrolled in this class cohort.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}