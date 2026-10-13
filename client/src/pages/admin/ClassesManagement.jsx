import React, { useEffect, useState } from 'react';
import { 
  School, 
  Plus, 
  Search, 
  BookOpen, 
  Layers, 
  Unlink, 
  Users, 
  FileText,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  UserCheck,
  UserMinus,
  GraduationCap,
  UserPlus,
  BookPlus
} from 'lucide-react';

/* INTEGRATION IMPORTS:
   Importing client-side API helper functions instead of using direct fetch calls. */
import {
  getClasses,
  createClass,
  bindSubjectToClass,
  unbindSubjectFromClass,
  bindStudentToClass,
  unbindStudentFromClass,
  bindTeacherToClass,
  unbindTeacherFromClass,
  getGlobalPools
} from '../../api/adm_classes';

export default function ClassesManagement() {
  const [classesList, setClassesList] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('subjects'); // 'subjects' | 'teachers' | 'students'
  const [isLoading, setIsLoading] = useState(true);

  // Global Option Pools for selectors
  const [subjectsPool, setSubjectsPool] = useState([]);
  const [studentsPool, setStudentsPool] = useState([]);
  const [teachersPool, setTeachersPool] = useState([]);
  
  // Selection states
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');

  // Class Form states
  const [newClassName, setNewClassName] = useState('');
  const [newClassDesc, setNewClassDesc] = useState('');

  /* INTEGRATION EFFECT HOOK:
     Fires once on component mount to gather asynchronous data across endpoints. */
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);

        // Load class catalog
        const classesData = await getClasses();
        if (classesData) {
          setClassesList(classesData);
          if (classesData.length > 0) {
            setSelectedClassId(classesData[0].id);
          }
        }

        // Load global lookup pools for dropdowns
        const poolData = await getGlobalPools();
        if (poolData) {
          setSubjectsPool(poolData.subjects || []);
          setStudentsPool(poolData.students || []);
          setTeachersPool(poolData.teachers || []);
        }
      } catch (err) {
        console.error("Failed to load initial class management datasets:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const currentClass = classesList.find(c => c.id === selectedClassId) || classesList[0];

  const calculateResourceAllocation = () => {
    if (!currentClass || !currentClass.resources || !currentClass.resources.length) {
      return { NOTE: 0, REVISION_QUESTION: 0, PAST_PAPER: 0, ASSIGNMENT: 0 };
    }
    const counts = { NOTE: 0, REVISION_QUESTION: 0, PAST_PAPER: 0, ASSIGNMENT: 0 };
    currentClass.resources.forEach(r => {
      if (counts[r.resource_type] !== undefined) counts[r.resource_type]++;
    });
    const total = currentClass.resources.length;
    return Object.keys(counts).reduce((acc, key) => {
      acc[key] = Math.round((counts[key] / total) * 100);
      return acc;
    }, {});
  };

  const allocationMetrics = calculateResourceAllocation();

  /* INTEGRATION HANDLERS */
  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    try {
      const payload = { class_name: newClassName, description: newClassDesc };
      const createdRecord = await createClass(payload);

      if (createdRecord) {
        const fullClassObj = {
          ...createdRecord,
          class_subjects: [],
          resources: [],
          student_classes: [],
          teacher_classes: []
        };
        setClassesList(prev => [...prev, fullClassObj]);
        setSelectedClassId(fullClassObj.id);
        setNewClassName('');
        setNewClassDesc('');
      }
    } catch (err) {
      console.error("Error creating class record:", err);
    }
  };

  const handleBindSubject = async (e) => {
    e.preventDefault();
    if (!selectedSubjectId || !currentClass) return;

    try {
      const response = await bindSubjectToClass(currentClass.id, parseInt(selectedSubjectId));
      if (response) {
        const targetSubject = subjectsPool.find(s => s.id === parseInt(selectedSubjectId));
        setClassesList(classesList.map(c => c.id === currentClass.id ? {
          ...c,
          class_subjects: [...(c.class_subjects || []), response.bridge || { id: Date.now(), subject_id: targetSubject.id, subject: targetSubject }]
        } : c));
        setSelectedSubjectId('');
      }
    } catch (err) {
      console.error("Failed linking subject bridge:", err);
    }
  };

  const handleUnbindSubject = async (bridgeId) => {
    if (!currentClass) return;
    try {
      await unbindSubjectFromClass(currentClass.id, bridgeId);
      setClassesList(classesList.map(c => c.id === currentClass.id ? {
        ...c,
        class_subjects: c.class_subjects.filter(cs => cs.id !== bridgeId)
      } : c));
    } catch (err) {
      console.error("Failed unbinding subject bridge:", err);
    }
  };

  const handleBindStudent = async (e) => {
    e.preventDefault();
    if (!selectedStudentId || !currentClass) return;

    try {
      const response = await bindStudentToClass(currentClass.id, parseInt(selectedStudentId));
      if (response) {
        const targetStudent = studentsPool.find(s => s.id === parseInt(selectedStudentId));
        setClassesList(classesList.map(c => c.id === currentClass.id ? {
          ...c,
          student_classes: [...(c.student_classes || []), response.bridge || { id: Date.now(), student_id: targetStudent.id, student: targetStudent }]
        } : c));
        setSelectedStudentId('');
      }
    } catch (err) {
      console.error("Failed linking student bridge:", err);
    }
  };

  const handleUnbindStudent = async (bridgeId) => {
    if (!currentClass) return;
    try {
      await unbindStudentFromClass(currentClass.id, bridgeId);
      setClassesList(classesList.map(c => c.id === currentClass.id ? {
        ...c,
        student_classes: c.student_classes.filter(sc => sc.id !== bridgeId)
      } : c));
    } catch (err) {
      console.error("Failed unbinding student bridge:", err);
    }
  };

  const handleBindTeacher = async (e) => {
    e.preventDefault();
    if (!selectedTeacherId || !currentClass) return;

    try {
      const response = await bindTeacherToClass(currentClass.id, parseInt(selectedTeacherId));
      if (response) {
        const targetTeacher = teachersPool.find(t => t.id === parseInt(selectedTeacherId));
        setClassesList(classesList.map(c => c.id === currentClass.id ? {
          ...c,
          teacher_classes: [...(c.teacher_classes || []), response.bridge || { id: Date.now(), teacher_id: targetTeacher.id, teacher: targetTeacher }]
        } : c));
        setSelectedTeacherId('');
      }
    } catch (err) {
      console.error("Failed linking teacher bridge:", err);
    }
  };

  const handleUnbindTeacher = async (bridgeId) => {
    if (!currentClass) return;
    try {
      await unbindTeacherFromClass(currentClass.id, bridgeId);
      setClassesList(classesList.map(c => c.id === currentClass.id ? {
        ...c,
        teacher_classes: c.teacher_classes.filter(tc => tc.id !== bridgeId)
      } : c));
    } catch (err) {
      console.error("Failed unbinding teacher bridge:", err);
    }
  };

  const filteredClasses = classesList.filter(c => 
    c.class_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="h-64 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 text-sm">
        <span className="animate-pulse">Loading class architecture registries...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-zinc-100 max-w-[1600px] mx-auto p-4">
      
      {/* PANEL 1: CLASS DECK */}
      <div className="lg:col-span-4 xl:col-span-3 bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-4 self-stretch min-h-[calc(100vh-8rem)]">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-zinc-200">System Class Deck</h2>
          <p className="text-[11px] text-zinc-500">Global core container levels</p>
        </div>

        {/* Create Class Form */}
        <form onSubmit={handleCreateClass} className="space-y-2 p-3 bg-zinc-950/60 rounded-lg border border-zinc-800/60">
          <input 
            type="text"
            placeholder="e.g. Class 12C"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
          />
          <input 
            type="text"
            placeholder="Description summary..."
            value={newClassDesc}
            onChange={(e) => setNewClassDesc(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
          />
          <button 
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-semibold text-xs py-1.5 rounded transition-colors flex items-center justify-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Initialize Class
          </button>
        </form>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input 
            type="text"
            placeholder="Filter classes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
          />
        </div>

        {/* Classes Navigation Deck */}
        <div className="space-y-1.5 flex-1 overflow-y-auto">
          {filteredClasses.map((c) => {
            const isSelected = selectedClassId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedClassId(c.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  isSelected 
                    ? 'bg-zinc-800/90 border-zinc-700 text-zinc-100 shadow-lg' 
                    : 'bg-zinc-950/40 border-zinc-800/80 text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-zinc-200">{c.class_name}</span>
                  <span className="text-[10px] text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                    {c.student_classes?.length || 0} students
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 truncate">{c.description || 'No description attached'}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* PANEL 2: CANVAS CORE MAIN VIEW */}
      {currentClass ? (
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          
          {/* Header Metric Banner */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <School className="w-5 h-5 text-emerald-400" />
                <h1 className="text-lg font-bold text-zinc-100">{currentClass.class_name}</h1>
              </div>
              <p className="text-xs text-zinc-500 mt-1">{currentClass.description || "Active class instance record."}</p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3 text-xs">
              <div className="bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg text-center">
                <span className="block text-zinc-500 text-[10px] uppercase font-semibold">Subjects</span>
                <span className="text-zinc-200 font-bold">{currentClass.class_subjects?.length || 0}</span>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg text-center">
                <span className="block text-zinc-500 text-[10px] uppercase font-semibold">Teachers</span>
                <span className="text-zinc-200 font-bold">{currentClass.teacher_classes?.length || 0}</span>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg text-center">
                <span className="block text-zinc-500 text-[10px] uppercase font-semibold">Students</span>
                <span className="text-zinc-200 font-bold">{currentClass.student_classes?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* Allocation Bar Widget */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Resource Allocation Weights
              </span>
              <span className="text-[10px] text-zinc-500">{currentClass.resources?.length || 0} Total Materials</span>
            </div>
            <div className="h-2.5 w-full bg-zinc-950 rounded-full overflow-hidden flex border border-zinc-800">
              <div style={{ width: `${allocationMetrics.NOTE}%` }} className="bg-emerald-500" title="Notes" />
              <div style={{ width: `${allocationMetrics.REVISION_QUESTION}%` }} className="bg-amber-500" title="Revision Questions" />
              <div style={{ width: `${allocationMetrics.PAST_PAPER}%` }} className="bg-sky-500" title="Past Papers" />
              <div style={{ width: `${allocationMetrics.ASSIGNMENT}%` }} className="bg-purple-500" title="Assignments" />
            </div>
            <div className="flex gap-4 text-[10px] text-zinc-400 pt-1">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Notes ({allocationMetrics.NOTE}%)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Questions ({allocationMetrics.REVISION_QUESTION}%)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-500" /> Past Papers ({allocationMetrics.PAST_PAPER}%)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> Assignments ({allocationMetrics.ASSIGNMENT}%)</span>
            </div>
          </div>

          {/* TAB NAVIGATION */}
          <div className="flex border-b border-zinc-800 gap-6 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('subjects')}
              className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'subjects' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <BookOpen className="w-4 h-4" /> Curriculum Subjects ({currentClass.class_subjects?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('teachers')}
              className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'teachers' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <GraduationCap className="w-4 h-4" /> Assigned Educators ({currentClass.teacher_classes?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'students' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Users className="w-4 h-4" /> Enrolled Students ({currentClass.student_classes?.length || 0})
            </button>
          </div>

          {/* TAB 1: SUBJECT BRIDGES */}
          {activeTab === 'subjects' && (
            <div className="space-y-4">
              <form onSubmit={handleBindSubject} className="flex gap-2">
                <select 
                  value={selectedSubjectId} 
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700"
                >
                  <option value="">Select a subject to bind...</option>
                  {subjectsPool.map(s => (
                    <option key={s.id} value={s.id}>{s.subject_name} ({s.subject_code})</option>
                  ))}
                </select>
                <button 
                  type="submit" 
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                >
                  <BookPlus className="w-3.5 h-3.5" /> Bind Subject
                </button>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentClass.class_subjects?.length > 0 ? (
                  currentClass.class_subjects.map(cs => (
                    <div key={cs.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-xs text-zinc-200 block">{cs.subject?.subject_name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">{cs.subject?.subject_code}</span>
                      </div>
                      <button 
                        onClick={() => handleUnbindSubject(cs.id)}
                        className="p-1.5 hover:bg-rose-950/40 hover:text-rose-400 text-zinc-500 rounded transition-colors"
                        title="Unbind Subject"
                      >
                        <Unlink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <span className="text-xs italic text-zinc-600 col-span-2">No active subjects mapped to this class instance.</span>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TEACHER BRIDGES */}
          {activeTab === 'teachers' && (
            <div className="space-y-4">
              <form onSubmit={handleBindTeacher} className="flex gap-2">
                <select 
                  value={selectedTeacherId} 
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700"
                >
                  <option value="">Assign educator...</option>
                  {teachersPool.map(t => (
                    <option key={t.id} value={t.id}>{t.first_name} {t.last_name} ({t.email})</option>
                  ))}
                </select>
                <button 
                  type="submit" 
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Assign Teacher
                </button>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentClass.teacher_classes?.length > 0 ? (
                  currentClass.teacher_classes.map(tc => (
                    <div key={tc.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-xs text-zinc-200 block">{tc.teacher?.first_name} {tc.teacher?.last_name}</span>
                        <span className="text-[10px] text-zinc-500">{tc.teacher?.email}</span>
                      </div>
                      <button 
                        onClick={() => handleUnbindTeacher(tc.id)}
                        className="p-1.5 hover:bg-rose-950/40 hover:text-rose-400 text-zinc-500 rounded transition-colors"
                        title="Remove Teacher"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <span className="text-xs italic text-zinc-600 col-span-2">No educators assigned to this class level.</span>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: STUDENT BRIDGES */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              <form onSubmit={handleBindStudent} className="flex gap-2">
                <select 
                  value={selectedStudentId} 
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700"
                >
                  <option value="">Enroll student...</option>
                  {studentsPool.map(s => (
                    <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.email})</option>
                  ))}
                </select>
                <button 
                  type="submit" 
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Enroll Student
                </button>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentClass.student_classes?.length > 0 ? (
                  currentClass.student_classes.map(sc => (
                    <div key={sc.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-xs text-zinc-200 block">{sc.student?.first_name} {sc.student?.last_name}</span>
                        <span className="text-[10px] text-zinc-500">{sc.student?.email}</span>
                      </div>
                      <button 
                        onClick={() => handleUnbindStudent(sc.id)}
                        className="p-1.5 hover:bg-rose-950/40 hover:text-rose-400 text-zinc-500 rounded transition-colors"
                        title="Unenroll Student"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <span className="text-xs italic text-zinc-600 col-span-2">No students enrolled in this class roster.</span>
                )}
              </div>
            </div>
          )}

        </div>
      ) : (
        <div className="lg:col-span-8 xl:col-span-9 h-64 border border-dashed border-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 text-sm">
          No class active or selected.
        </div>
      )}

    </div>
  );
}



















// import React, { useState } from 'react';
// import { 
//   School, 
//   Plus, 
//   Search, 
//   BookOpen, 
//   Layers, 
//   Unlink, 
//   Users, 
//   FileText,
//   AlertCircle,
//   TrendingUp,
//   ShieldCheck,
//   UserCheck,
//   UserMinus,
//   GraduationCap,
//   UserPlus,
//   BookPlus
// } from 'lucide-react';

// const INITIAL_CLASSES_DATA = [
//   {
//     id: 1,
//     class_name: "Class 10A",
//     description: "Sophomore advanced tier level",
//     class_subjects: [
//       { id: 101, subject_id: 1, subject: { id: 1, subject_name: "Mathematics", subject_code: "MATH-10" } },
//       { id: 102, subject_id: 2, subject: { id: 2, subject_name: "Physics", subject_code: "PHY-10" } }
//     ],
//     resources: [
//       { id: 50, title: "Algebra Basics", resource_type: "NOTE" },
//       { id: 51, title: "Kinematics Prep", resource_type: "PAST_PAPER" },
//       { id: 52, title: "Vectors Assignment", resource_type: "ASSIGNMENT" }
//     ],
//     student_classes: [
//       { id: 201, student_id: 10, student: { id: 10, first_name: "Alex", last_name: "Mercer", email: "alex@school.com" } },
//       { id: 202, student_id: 11, student: { id: 11, first_name: "Jane", last_name: "Doe", email: "jane@school.com" } }
//     ],
//     teacher_classes: [
//       { id: 301, teacher_id: 1, teacher: { id: 1, first_name: "Dr. Robert", last_name: "Ford", email: "ford@school.com" } }
//     ]
//   },
//   {
//     id: 2,
//     class_name: "Class 11B",
//     description: "Junior core requirements track",
//     class_subjects: [
//       { id: 103, subject_id: 3, subject: { id: 3, subject_name: "Biology", subject_code: "BIO-11" } }
//     ],
//     resources: [
//       { id: 53, title: "Cell Structure Q&A", resource_type: "REVISION_QUESTION" }
//     ],
//     student_classes: [
//       { id: 203, student_id: 12, student: { id: 12, first_name: "John", last_name: "Smith", email: "john@school.com" } }
//     ],
//     teacher_classes: [
//       { id: 302, teacher_id: 2, teacher: { id: 2, first_name: "Prof. Minerva", last_name: "McGonagall", email: "minerva@school.com" } }
//     ]
//   },
//   {
//     id: 3,
//     class_name: "Class 9B",
//     description: "Freshman introductory curriculum",
//     class_subjects: [],
//     resources: [], 
//     student_classes: [],
//     teacher_classes: []
//   }
// ];

// const GLOBAL_SUBJECTS_POOL = [
//   { id: 1, subject_name: "Mathematics", subject_code: "MATH-10" },
//   { id: 2, subject_name: "Physics", subject_code: "PHY-10" },
//   { id: 3, subject_name: "Biology", subject_code: "BIO-11" },
//   { id: 4, subject_name: "Chemistry", subject_code: "CHEM-10" }
// ];

// const GLOBAL_STUDENTS_POOL = [
//   { id: 10, first_name: "Alex", last_name: "Mercer", email: "alex@school.com" },
//   { id: 11, first_name: "Jane", last_name: "Doe", email: "jane@school.com" },
//   { id: 12, first_name: "John", last_name: "Smith", email: "john@school.com" },
//   { id: 13, first_name: "Sarah", last_name: "Connor", email: "sarah@school.com" },
//   { id: 14, first_name: "Bruce", last_name: "Wayne", email: "bruce@school.com" }
// ];

// const GLOBAL_TEACHERS_POOL = [
//   { id: 1, first_name: "Dr. Robert", last_name: "Ford", email: "ford@school.com" },
//   { id: 2, first_name: "Prof. Minerva", last_name: "McGonagall", email: "minerva@school.com" },
//   { id: 3, first_name: "Walter", last_name: "White", email: "heisenberg@school.com" }
// ];

// export default function ClassesManagement() {
//   const [classesList, setClassesList] = useState(INITIAL_CLASSES_DATA);
//   const [selectedClassId, setSelectedClassId] = useState(1);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [activeTab, setActiveTab] = useState('subjects'); // 'subjects' | 'teachers' | 'students'
  
//   // Selection states
//   const [selectedSubjectId, setSelectedSubjectId] = useState('');
//   const [selectedStudentId, setSelectedStudentId] = useState('');
//   const [selectedTeacherId, setSelectedTeacherId] = useState('');

//   // Class Form states
//   const [newClassName, setNewClassName] = useState('');
//   const [newClassDesc, setNewClassDesc] = useState('');

//   const currentClass = classesList.find(c => c.id === selectedClassId) || classesList[0];

//   const calculateResourceAllocation = () => {
//     if (!currentClass || !currentClass.resources.length) return { NOTE: 0, REVISION_QUESTION: 0, PAST_PAPER: 0, ASSIGNMENT: 0 };
//     const counts = { NOTE: 0, REVISION_QUESTION: 0, PAST_PAPER: 0, ASSIGNMENT: 0 };
//     currentClass.resources.forEach(r => {
//       if (counts[r.resource_type] !== undefined) counts[r.resource_type]++;
//     });
//     const total = currentClass.resources.length;
//     return Object.keys(counts).reduce((acc, key) => {
//       acc[key] = Math.round((counts[key] / total) * 100);
//       return acc;
//     }, {});
//   };

//   const allocationMetrics = calculateResourceAllocation();

//   // BINDERS
//   const handleBindSubject = (e) => {
//     e.preventDefault();
//     if (!selectedSubjectId) return;
//     const targetSubject = GLOBAL_SUBJECTS_POOL.find(s => s.id === parseInt(selectedSubjectId));
//     if (currentClass.class_subjects.some(cs => cs.subject_id === targetSubject.id)) return;

//     setClassesList(classesList.map(c => c.id === currentClass.id ? {
//       ...c,
//       class_subjects: [...c.class_subjects, { id: Date.now(), subject_id: targetSubject.id, subject: targetSubject }]
//     } : c));
//     setSelectedSubjectId('');
//   };

//   const handleUnbindSubject = (bridgeId) => {
//     setClassesList(classesList.map(c => c.id === currentClass.id ? {
//       ...c,
//       class_subjects: c.class_subjects.filter(cs => cs.id !== bridgeId)
//     } : c));
//   };

//   const handleBindStudent = (e) => {
//     e.preventDefault();
//     if (!selectedStudentId) return;
//     const targetStudent = GLOBAL_STUDENTS_POOL.find(s => s.id === parseInt(selectedStudentId));
//     if (currentClass.student_classes.some(sc => sc.student_id === targetStudent.id)) return;

//     setClassesList(classesList.map(c => c.id === currentClass.id ? {
//       ...c,
//       student_classes: [...c.student_classes, { id: Date.now(), student_id: targetStudent.id, student: targetStudent }]
//     } : c));
//     setSelectedStudentId('');
//   };

//   const handleUnbindStudent = (bridgeId) => {
//     setClassesList(classesList.map(c => c.id === currentClass.id ? {
//       ...c,
//       student_classes: c.student_classes.filter(sc => sc.id !== bridgeId)
//     } : c));
//   };

//   const handleBindTeacher = (e) => {
//     e.preventDefault();
//     if (!selectedTeacherId) return;
//     const targetTeacher = GLOBAL_TEACHERS_POOL.find(t => t.id === parseInt(selectedTeacherId));
//     if (currentClass.teacher_classes?.some(tc => tc.teacher_id === targetTeacher.id)) return;

//     setClassesList(classesList.map(c => c.id === currentClass.id ? {
//       ...c,
//       teacher_classes: [...(c.teacher_classes || []), { id: Date.now(), teacher_id: targetTeacher.id, teacher: targetTeacher }]
//     } : c));
//     setSelectedTeacherId('');
//   };

//   const handleUnbindTeacher = (bridgeId) => {
//     setClassesList(classesList.map(c => c.id === currentClass.id ? {
//       ...c,
//       teacher_classes: c.teacher_classes.filter(tc => tc.id !== bridgeId)
//     } : c));
//   };

//   const handleCreateClass = (e) => {
//     e.preventDefault();
//     if (!newClassName.trim()) return;

//     const newClassRecord = {
//       id: Date.now(),
//       class_name: newClassName,
//       description: newClassDesc,
//       class_subjects: [],
//       resources: [],
//       student_classes: [],
//       teacher_classes: []
//     };

//     setClassesList([...classesList, newClassRecord]);
//     setSelectedClassId(newClassRecord.id);
//     setNewClassName('');
//     setNewClassDesc('');
//   };

//   const filteredClasses = classesList.filter(c => 
//     c.class_name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-zinc-100 max-w-[1600px] mx-auto p-4">
      
//       {/* PANEL 1: CLASS DECK */}
//       <div className="lg:col-span-4 xl:col-span-3 bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-4 self-stretch min-h-[calc(100vh-8rem)]">
//         <div>
//           <h2 className="text-sm font-semibold tracking-wide text-zinc-200">System Class Deck</h2>
//           <p className="text-[11px] text-zinc-500">Global core container levels</p>
//         </div>

//         {/* Create Class Form */}
//         <form onSubmit={handleCreateClass} className="space-y-2 p-3 bg-zinc-950/60 rounded-lg border border-zinc-800/60">
//           <input 
//             type="text"
//             placeholder="e.g. Class 12C"
//             value={newClassName}
//             onChange={(e) => setNewClassName(e.target.value)}
//             className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
//             required
//           />
//           <input 
//             type="text"
//             placeholder="Class path description..."
//             value={newClassDesc}
//             onChange={(e) => setNewClassDesc(e.target.value)}
//             className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
//           />
//           <button type="submit" className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-950 py-1.5 rounded text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors">
//             <Plus className="w-3.5 h-3.5" /> Initialize Class
//           </button>
//         </form>

//         {/* Search */}
//         <div className="relative">
//           <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
//           <input 
//             type="text"
//             placeholder="Search classes..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
//           />
//         </div>

//         {/* Class Records List */}
//         <div className="space-y-2 overflow-y-auto flex-1 pr-1 max-h-[450px] lg:max-h-none">
//           {filteredClasses.map((item) => {
//             const isSelected = item.id === selectedClassId;
//             const hasGaps = item.resources.length === 0;
            
//             return (
//               <div
//                 key={item.id}
//                 onClick={() => setSelectedClassId(item.id)}
//                 className={`p-3 rounded-xl border cursor-pointer transition-all ${
//                   isSelected 
//                     ? 'bg-zinc-800 border-zinc-700 shadow-md' 
//                     : 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-800'
//                 }`}
//               >
//                 <div className="flex items-center justify-between">
//                   <span className="text-xs font-semibold text-zinc-200">{item.class_name}</span>
//                   <School className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-zinc-600'}`} />
//                 </div>
//                 <p className="text-[10px] text-zinc-500 truncate mt-0.5">{item.description || 'No description'}</p>
                
//                 <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-zinc-800/40 text-[9px] text-zinc-400 font-mono">
//                   <div className="flex gap-2">
//                     <span className="flex items-center gap-1"><GraduationCap className="w-2.5 h-2.5 text-amber-500" /> {item.teacher_classes?.length || 0}</span>
//                     <span className="flex items-center gap-1"><Users className="w-2.5 h-2.5 text-sky-400" /> {item.student_classes?.length || 0}</span>
//                   </div>
//                   {hasGaps && (
//                     <span className="px-1 py-0.2 bg-rose-950/30 text-rose-400 rounded border border-rose-900/30 font-medium">
//                       Empty Core
//                     </span>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* PANEL 2: CORE WORKSPACE WORKBENCH */}
//       <div className="lg:col-span-8 xl:col-span-9 space-y-5">
        
//         {/* Banner Header */}
//         <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center justify-between">
//           <div>
//             <span className="px-2 py-0.5 bg-zinc-950 rounded text-[10px] font-mono border border-zinc-800 text-zinc-400">UUID MAP REF: #{currentClass.id}</span>
//             <h1 className="text-xl font-bold tracking-tight text-zinc-100 mt-1">{currentClass.class_name}</h1>
//             <p className="text-xs text-zinc-400">{currentClass.description || "No description provided for this context container."}</p>
//           </div>
//           <div className="flex items-center gap-3 text-xs font-mono text-zinc-400 bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/80">
//             <div>
//               <span className="block text-[10px] text-zinc-500">SUBJECTS</span>
//               <span className="text-zinc-200 font-bold">{currentClass.class_subjects.length}</span>
//             </div>
//             <div className="h-6 w-[1px] bg-zinc-800" />
//             <div>
//               <span className="block text-[10px] text-zinc-500">FACULTY</span>
//               <span className="text-zinc-200 font-bold">{currentClass.teacher_classes?.length || 0}</span>
//             </div>
//             <div className="h-6 w-[1px] bg-zinc-800" />
//             <div>
//               <span className="block text-[10px] text-zinc-500">ENROLLED</span>
//               <span className="text-zinc-200 font-bold">{currentClass.student_classes?.length || 0}</span>
//             </div>
//           </div>
//         </div>

//         {/* TABBED INTERFACE SYSTEM */}
//         <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
          
//           {/* Tabs Navigation */}
//           <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
//             <div className="flex gap-2">
//               <button 
//                 onClick={() => setActiveTab('subjects')}
//                 className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
//                   activeTab === 'subjects' 
//                     ? 'bg-zinc-800 text-zinc-100 border border-zinc-700' 
//                     : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-950'
//                 }`}
//               >
//                 <Layers className="w-3.5 h-3.5 text-sky-400" /> Subjects ({currentClass.class_subjects.length})
//               </button>
//               <button 
//                 onClick={() => setActiveTab('teachers')}
//                 className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
//                   activeTab === 'teachers' 
//                     ? 'bg-zinc-800 text-zinc-100 border border-zinc-700' 
//                     : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-950'
//                 }`}
//               >
//                 <GraduationCap className="w-3.5 h-3.5 text-amber-400" /> Teachers ({currentClass.teacher_classes?.length || 0})
//               </button>
//               <button 
//                 onClick={() => setActiveTab('students')}
//                 className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
//                   activeTab === 'students' 
//                     ? 'bg-zinc-800 text-zinc-100 border border-zinc-700' 
//                     : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-950'
//                 }`}
//               >
//                 <Users className="w-3.5 h-3.5 text-emerald-400" /> Students ({currentClass.student_classes?.length || 0})
//               </button>
//             </div>

//             {/* Quick Binder Actions Form embedded into header */}
//             <div className="w-72">
//               {activeTab === 'subjects' && (
//                 <form onSubmit={handleBindSubject} className="flex gap-1.5">
//                   <select
//                     value={selectedSubjectId}
//                     onChange={(e) => setSelectedSubjectId(e.target.value)}
//                     className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-zinc-700 flex-1 truncate"
//                   >
//                     <option value="">+ Bind Subject...</option>
//                     {GLOBAL_SUBJECTS_POOL.map(subj => (
//                       <option key={subj.id} value={subj.id}>{subj.subject_name} [{subj.subject_code}]</option>
//                     ))}
//                   </select>
//                   <button type="submit" disabled={!selectedSubjectId} className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 disabled:bg-zinc-800 disabled:text-zinc-600 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors shrink-0">
//                     Link
//                   </button>
//                 </form>
//               )}

//               {activeTab === 'teachers' && (
//                 <form onSubmit={handleBindTeacher} className="flex gap-1.5">
//                   <select
//                     value={selectedTeacherId}
//                     onChange={(e) => setSelectedTeacherId(e.target.value)}
//                     className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-zinc-700 flex-1 truncate"
//                   >
//                     <option value="">+ Assign Faculty...</option>
//                     {GLOBAL_TEACHERS_POOL.map(t => (
//                       <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
//                     ))}
//                   </select>
//                   <button type="submit" disabled={!selectedTeacherId} className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 disabled:bg-zinc-800 disabled:text-zinc-600 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors shrink-0">
//                     Assign
//                   </button>
//                 </form>
//               )}

//               {activeTab === 'students' && (
//                 <form onSubmit={handleBindStudent} className="flex gap-1.5">
//                   <select
//                     value={selectedStudentId}
//                     onChange={(e) => setSelectedStudentId(e.target.value)}
//                     className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-zinc-700 flex-1 truncate"
//                   >
//                     <option value="">+ Enroll Student...</option>
//                     {GLOBAL_STUDENTS_POOL.map(stud => (
//                       <option key={stud.id} value={stud.id}>{stud.first_name} {stud.last_name}</option>
//                     ))}
//                   </select>
//                   <button type="submit" disabled={!selectedStudentId} className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 disabled:bg-zinc-800 disabled:text-zinc-600 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors shrink-0">
//                     Enroll
//                   </button>
//                 </form>
//               )}
//             </div>
//           </div>

//           {/* TAB CONTENTS */}
//           {/* TAB 1: SUBJECTS */}
//           {activeTab === 'subjects' && (
//             <div>
//               {currentClass.class_subjects.length === 0 ? (
//                 <div className="border border-dashed border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center text-center gap-2 bg-zinc-950/20">
//                   <AlertCircle className="w-5 h-5 text-zinc-600" />
//                   <p className="text-xs text-zinc-500">No active subject relations bound to this class.</p>
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
//                   {currentClass.class_subjects.map((cs) => (
//                     <div key={cs.id} className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3.5 flex flex-col justify-between hover:border-zinc-700 transition-colors">
//                       <div className="flex items-start justify-between gap-2">
//                         <div className="flex items-center gap-2.5">
//                           <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
//                             <BookOpen className="w-4 h-4 text-emerald-400" />
//                           </div>
//                           <div>
//                             <h4 className="text-xs font-bold text-zinc-200">{cs.subject.subject_name}</h4>
//                             <span className="text-[10px] font-mono text-zinc-500">{cs.subject.subject_code}</span>
//                           </div>
//                         </div>
//                         <button 
//                           onClick={() => handleUnbindSubject(cs.id)}
//                           className="p-1 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/40 rounded text-zinc-600 hover:text-rose-400 transition-all"
//                         >
//                           <Unlink className="w-3.5 h-3.5" />
//                         </button>
//                       </div>
//                       <div className="mt-3 pt-2 border-t border-zinc-900 flex items-center justify-between text-[10px] text-zinc-500">
//                         <span className="flex items-center gap-1 font-mono">
//                           <FileText className="w-3 h-3 text-zinc-600" /> {currentClass.resources.length} Resource Nodes
//                         </span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}

//           {/* TAB 2: TEACHERS */}
//           {activeTab === 'teachers' && (
//             <div>
//               {!currentClass.teacher_classes || currentClass.teacher_classes.length === 0 ? (
//                 <div className="border border-dashed border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center text-center gap-2 bg-zinc-950/20">
//                   <GraduationCap className="w-5 h-5 text-zinc-600" />
//                   <p className="text-xs text-zinc-500">No faculty mapped to this class container yet.</p>
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
//                   {currentClass.teacher_classes.map((tc) => (
//                     <div key={tc.id} className="bg-zinc-950 border border-zinc-800/80 rounded-lg p-3 flex items-center justify-between hover:border-zinc-700 transition-colors">
//                       <div className="flex items-center gap-2.5 min-w-0">
//                         <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
//                           <GraduationCap className="w-4 h-4 text-amber-400" />
//                         </div>
//                         <div className="min-w-0">
//                           <h4 className="text-xs font-medium text-zinc-200 truncate">{tc.teacher.first_name} {tc.teacher.last_name}</h4>
//                           <span className="text-[10px] text-zinc-500 block truncate">{tc.teacher.email}</span>
//                         </div>
//                       </div>
//                       <button 
//                         onClick={() => handleUnbindTeacher(tc.id)}
//                         className="p-1 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/40 rounded text-zinc-600 hover:text-rose-400 transition-all"
//                       >
//                         <UserMinus className="w-3.5 h-3.5" />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}

//           {/* TAB 3: STUDENTS */}
//           {activeTab === 'students' && (
//             <div>
//               {!currentClass.student_classes || currentClass.student_classes.length === 0 ? (
//                 <div className="border border-dashed border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center text-center gap-2 bg-zinc-950/20">
//                   <Users className="w-5 h-5 text-zinc-600" />
//                   <p className="text-xs text-zinc-500">No students enrolled in this class container yet.</p>
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
//                   {currentClass.student_classes.map((sc) => (
//                     <div key={sc.id} className="bg-zinc-950 border border-zinc-800/80 rounded-lg p-3 flex items-center justify-between hover:border-zinc-700 transition-colors">
//                       <div className="flex items-center gap-2.5 min-w-0">
//                         <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
//                           <Users className="w-4 h-4 text-emerald-400" />
//                         </div>
//                         <div className="min-w-0">
//                           <h4 className="text-xs font-medium text-zinc-200 truncate">{sc.student.first_name} {sc.student.last_name}</h4>
//                           <span className="text-[10px] text-zinc-500 block truncate">{sc.student.email}</span>
//                         </div>
//                       </div>
//                       <button 
//                         onClick={() => handleUnbindStudent(sc.id)}
//                         className="p-1 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/40 rounded text-zinc-600 hover:text-rose-400 transition-all"
//                       >
//                         <UserMinus className="w-3.5 h-3.5" />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}

//         </div>

//         {/* METRICS & CONSTRAINTS */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
//             <div className="flex items-center gap-1.5 mb-3">
//               <TrendingUp className="w-4 h-4 text-emerald-400" />
//               <h3 className="text-xs font-semibold text-zinc-200">Resource Profile Metrics</h3>
//             </div>
//             {currentClass.resources.length === 0 ? (
//               <p className="text-[11px] text-zinc-500 italic py-2">No uploaded resources found.</p>
//             ) : (
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                 {Object.entries(allocationMetrics).map(([enumKey, percentageValue]) => {
//                   const colorMap = { NOTE: 'bg-emerald-500', REVISION_QUESTION: 'bg-amber-500', PAST_PAPER: 'bg-purple-500', ASSIGNMENT: 'bg-sky-500' };
//                   return (
//                     <div key={enumKey} className="space-y-1">
//                       <div className="flex justify-between text-[10px] font-mono">
//                         <span className="text-zinc-400 text-[9px] font-bold">{enumKey.replace('_', ' ')}</span>
//                         <span className="text-zinc-200 font-bold">{percentageValue}%</span>
//                       </div>
//                       <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
//                         <div className={`h-full ${colorMap[enumKey] || 'bg-zinc-500'}`} style={{ width: `${percentageValue}%` }} />
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>

//           <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
//             <div className="flex items-center gap-1.5 mb-2">
//               <ShieldCheck className="w-4 h-4 text-sky-400" />
//               <h3 className="text-xs font-semibold text-zinc-200">Constraint Validation</h3>
//             </div>
//             <div className="text-[10px] space-y-1.5 text-zinc-500 leading-normal">
//               <p>✔ Cascades verified: <code className="bg-zinc-950 px-1 py-0.5 rounded font-mono text-[9px] text-zinc-400">ClassSubject</code> delete cascade live.</p>
//               <p>✔ Constraints: <code className="bg-zinc-950 px-1 py-0.5 rounded font-mono text-[9px] text-zinc-400">uq_student_class</code> & <code className="bg-zinc-950 px-1 py-0.5 rounded font-mono text-[9px] text-zinc-400">uq_teacher_class</code> verified.</p>
//             </div>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }

