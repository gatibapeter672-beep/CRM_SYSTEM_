import React, { useState } from 'react';

// Example Initial State representing data from your backend CRM models (User, Role, StudentClass)
const INITIAL_USERS = [
  { id: 41, username: 'jdoe_dev', email: 'jdoe@school.edu', role: 'Student', status: 'Active', classBinding: 'Grade 9-A', sessions: 2 },
  { id: 42, username: 'm_smith', email: 'msmith@school.edu', role: 'Teacher', status: 'Active', classBinding: 'Grade 10-B', sessions: 1 },
  { id: 43, username: 'admin_alpha', email: 'admin@school.edu', role: 'Admin', status: 'Active', classBinding: 'Global', sessions: 5 },
  { id: 44, username: 'unassigned_user', email: 'newuser@school.edu', role: 'Student', status: 'Inactive', classBinding: null, sessions: 0 },
];

const AVAILABLE_CLASSES = ['Grade 9-A', 'Grade 9-B', 'Grade 10-A', 'Grade 10-B', 'Grade 11'];
const AVAILABLE_ROLES = ['Admin', 'Teacher', 'Student'];

export default function UserManagement() {
  // State Management
  const [users, setUsers] = useState(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedUser, setSelectedUser] = useState(null);

  // Filtered Users Logic
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Administrative Operations (Simulating backend mutations)
  const handleToggleStatus = (userId) => {
    setUsers(users.map(u => u.id === userId ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u));
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser({ ...selectedUser, status: selectedUser.status === 'Active' ? 'Inactive' : 'Active' });
    }
  };

  const handleClassChange = (userId, newClass) => {
    setUsers(users.map(u => u.id === userId ? { ...u, classBinding: newClass || null } : u));
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser({ ...selectedUser, classBinding: newClass || null });
    }
  };

  const handleRoleChange = (userId, newRole) => {
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser({ ...selectedUser, role: newRole });
    }
  };

  const handleRevokeSessions = (userId) => {
    setUsers(users.map(u => u.id === userId ? { ...u, sessions: 0 } : u));
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser({ ...selectedUser, sessions: 0 });
    }
    alert(`All active backend JWT sessions revoked for User ID #${userId}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Upper Zone: Header & Global Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>👥</span> User Management & Global Access Control
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage database accounts, allocate classroom domains, and handle active token overrides.
          </p>
        </div>
        <button className="self-start md:self-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm shadow-sm transition-all duration-150 flex items-center gap-1.5">
          <span className="text-base font-bold">+</span> Add New User
        </button>
      </div>

      {/* Filter Ribbon Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Search Accounts</label>
          <input 
            type="text" 
            placeholder="Search by username or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Filter Role</label>
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full text-sm px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="All">All Roles</option>
            {AVAILABLE_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Filter Status</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full text-sm px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Grid: Main Table & Context Side-Panel */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Core Data Table Grid */}
        <div className="w-full lg:flex-1 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                  <th className="p-4 w-16 text-center">ID</th>
                  <th className="p-4">Username</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Assigned Role</th>
                  <th className="p-4">Classroom Scope</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400">
                      No user records matched your current query logic filters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr 
                      key={user.id} 
                      onClick={() => setSelectedUser(user)}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors cursor-pointer ${selectedUser?.id === user.id ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''}`}
                    >
                      <td className="p-4 text-center font-mono text-xs text-slate-400">{user.id}</td>
                      <td className="p-4 font-medium text-slate-900 dark:text-white">{user.username}</td>
                      <td className="p-4 text-slate-500 dark:text-slate-400">{user.email}</td>
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          user.role === 'Admin' ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-400' :
                          user.role === 'Teacher' ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-400' :
                          'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-400'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        {user.classBinding ? (
                          <span className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1">
                            🏫 <span className="underline decoration-indigo-400/40 underline-offset-2">{user.classBinding}</span>
                          </span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 text-xs font-semibold tracking-wide flex items-center gap-1">
                            ⚠️ Unassigned
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                        <span className="text-xs font-medium">{user.status}</span>
                      </td>
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => setSelectedUser(user)}
                          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 px-2.5 py-1.5 rounded-md transition-all"
                        >
                          Manage 👤
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Context Control Panel Layer */}
        {selectedUser && (
          <div className="w-full lg:w-80 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-5 shadow-sm sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-950 dark:text-white">Detailed Context Panel</h3>
                <p className="text-xs text-slate-400">Targeting Account ID #{selectedUser.id}</p>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-semibold p-1"
              >
                ✕ Close
              </button>
            </div>

            {/* Account Information Block */}
            <div className="space-y-1">
              <div className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Profile Details</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">{selectedUser.username}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 break-all">{selectedUser.email}</div>
            </div>

            {/* Access Control Direct Assignment Modifiers */}
            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800/80">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400 uppercase">Change Security Role</label>
                <select 
                  value={selectedUser.role} 
                  onChange={(e) => handleRoleChange(selectedUser.id, e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {AVAILABLE_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400 uppercase">Classroom Domain Mapping</label>
                <select 
                  value={selectedUser.classBinding || ''} 
                  onChange={(e) => handleClassChange(selectedUser.id, e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">-- No Class Selected (Unassigned) --</option>
                  {AVAILABLE_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Session State Audits & Administrative Overrides */}
            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-400 uppercase">Active Token Overrides</span>
                <span className={`px-2 py-0.5 rounded font-mono font-bold ${selectedUser.sessions > 0 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800/80'}`}>
                  {selectedUser.sessions} live session{selectedUser.sessions !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2 pt-1">
                <button 
                  onClick={() => handleToggleStatus(selectedUser.id)}
                  className={`w-full text-xs font-medium py-2 px-3 rounded-lg border text-center transition-all ${
                    selectedUser.status === 'Active' 
                      ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/20 dark:border-amber-900/60 dark:text-amber-400' 
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/60 dark:text-emerald-400'
                  }`}
                >
                  {selectedUser.status === 'Active' ? '⛔ Deactivate Account Flag' : '✅ Activate Account Flag'}
                </button>

                <button 
                  onClick={() => handleRevokeSessions(selectedUser.id)}
                  disabled={selectedUser.sessions === 0}
                  className="w-full text-xs font-medium py-2 px-3 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-rose-600 dark:hover:bg-rose-600 text-slate-700 dark:text-slate-300 hover:text-white dark:hover:text-white disabled:opacity-40 disabled:hover:bg-slate-200 disabled:hover:text-slate-700 dark:disabled:hover:bg-slate-800 transition-all text-center"
                >
                  💥 Kill Active Session Keys
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}




// // import React, { useState } from 'react';
// // import { 
// //   Users, 
// //   Plus, 
// //   Search, 
// //   Shield, 
// //   ShieldAlert, 
// //   UserX, 
// //   UserCheck, 
// //   Key, 
// //   School, 
// //   Mail, 
// //   Sliders,
// //   AlertTriangle
// // } from 'lucide-react';

// // // Sample structural data mimicking your Flask serialize_rules output
// // const INITIAL_USERS_DATA = [
// //   {
// //     id: 12,
// //     name: "Peter Parker",
// //     email: "peter@academa.edu",
// //     role: "TEACHER",
// //     is_active: true,
// //     student_class: null, 
// //     assigned_classes: [
// //       { id: 1, class_name: "Class 10A" },
// //       { id: 2, "class_name": "Class 11B" }
// //     ]
// //   },
// //   {
// //     id: 84,
// //     name: "Miles Morales",
// //     email: "miles@academa.edu",
// //     role: "STUDENT",
// //     is_active: true,
// //     student_class: { id: 1, class_name: "Class 10A" },
// //     assigned_classes: []
// //   },
// //   {
// //     id: 95,
// //     name: "Gwen Stacy",
// //     email: "gwen@academa.edu",
// //     role: "TEACHER",
// //     is_active: false, // Triggers blocklist styling
// //     student_class: null,
// //     assigned_classes: []
// //   }
// // ];

// // const GLOBAL_CLASSES_POOL = [
// //   { id: 1, class_name: "Class 10A", description: "Sophomore advanced tier level" },
// //   { id: 2, class_name: "Class 11B", description: "Junior core requirements track" },
// //   { id: 3, class_name: "Class 9B", description: "Freshman introductory curriculum" }
// // ];

// // export default function UsersManagement() {
// //   const [usersList, setUsersList] = useState(INITIAL_USERS_DATA);
// //   const [selectedUserId, setSelectedUserId] = useState(12);
// //   const [searchQuery, setSearchQuery] = useState('');
// //   const [roleFilter, setRoleFilter] = useState('ALL'); // ALL, TEACHER, STUDENT
  
// //   // Selection hooks for adding relational maps
// //   const [selectedClassId, setSelectedClassId] = useState('');

// //   // Form states for initializing a fresh user account
// //   const [newUserName, setNewUserName] = useState('');
// //   const [newUserEmail, setNewUserEmail] = useState('');
// //   const [newUserRole, setNewUserRole] = useState('STUDENT');
// //   const [newUserPassword, setNewUserPassword] = useState('');

// //   // Find currently active user record profile container
// //   const currentUser = usersList.find(u => u.id === selectedUserId) || usersList[0];

// //   // Calculate Metrics counts for Right Side Panel
// //   const teacherCount = usersList.filter(u => u.role === 'TEACHER').length;
// //   const studentCount = usersList.filter(u => u.role === 'STUDENT').length;

// //   // Handler for mapping a Class relation bridge
// //   const handleBindClass = (e) => {
// //     e.preventDefault();
// //     if (!selectedClassId || !currentUser) return;

// //     const targetClass = GLOBAL_CLASSES_POOL.find(c => c.id === parseInt(selectedClassId));

// //     const updatedUsers = usersList.map(u => {
// //       if (u.id === currentUser.id) {
// //         if (u.role === 'STUDENT') {
// //           // Students have strict 1-to-1 relationships
// //           return { ...u, student_class: targetClass };
// //         } else {
// //           // Teachers support multi-class bindings unique arrays
// //           if (u.assigned_classes.some(ac => ac.id === targetClass.id)) return u;
// //           return { ...u, assigned_classes: [...u.assigned_classes, targetClass] };
// //         }
// //       }
// //       return u;
// //     });

// //     setUsersList(updatedUsers);
// //     setSelectedClassId('');
// //   };

// //   // Handler for severing a structural relationship link
// //   const handleUnbindClass = (classId) => {
// //     const updatedUsers = usersList.map(u => {
// //       if (u.id === currentUser.id) {
// //         if (u.role === 'STUDENT') {
// //           return { ...u, student_class: null };
// //         } else {
// //           return { ...u, assigned_classes: u.assigned_classes.filter(c => c.id !== classId) };
// //         }
// //       }
// //       return u;
// //     });
// //     setUsersList(updatedUsers);
// //   };

// //   // Handler for micro mutations status updates (PATCH /api/users/<id>)
// //   const handleToggleActivity = (userId) => {
// //     const updatedUsers = usersList.map(u => {
// //       if (u.id === userId) {
// //         const nextState = !u.is_active;
// //         // UX Indicator context for audit logs hooks
// //         if (!nextState) {
// //           console.log(`[AUDIT EVENT] User #${u.id} killed session. Token appended to TokenBlocklist.`);
// //         }
// //         return { ...u, is_active: nextState };
// //       }
// //       return u;
// //     });
// //     setUsersList(updatedUsers);
// //   };

// //   // Handler for provisioning fresh accounts (POST /api/users)
// //   const handleCreateUser = (e) => {
// //     e.preventDefault();
// //     if (!newUserName.trim() || !newUserEmail.trim()) return;

// //     const newUserRecord = {
// //       id: Date.now(),
// //       name: newUserName,
// //       email: newUserEmail,
// //       role: newUserRole,
// //       is_active: true,
// //       student_class: null,
// //       assigned_classes: []
// //     };

// //     setUsersList([...usersList, newUserRecord]);
// //     setSelectedUserId(newUserRecord.id);
// //     setNewUserName('');
// //     setNewUserEmail('');
// //     setNewUserPassword('');
// //   };

// //   // Filter pipeline queries
// //   const filteredUsers = usersList.filter(u => {
// //     const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
// //                           u.email.toLowerCase().includes(searchQuery.toLowerCase());
// //     const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
// //     return matchesSearch && matchesRole;
// //   });

// //   return (
// //     <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start h-full text-zinc-100">
      
// //       {/* PANEL 1: DIRECTORY FLOW CONTAINER */}
// //       <div className="xl:col-span-1 bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-4 self-stretch min-h-[calc(100vh-12rem)]">
// //         <div>
// //           <h2 className="text-sm font-semibold tracking-wide text-zinc-200">User Identity Deck</h2>
// //           <p className="text-[11px] text-zinc-500">Global account structural indices</p>
// //         </div>

// //         {/* Dynamic Filters Bar Selector */}
// //         <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800/80">
// //           {['ALL', 'TEACHER', 'STUDENT'].map((roleType) => (
// //             <button
// //               key={roleType}
// //               onClick={() => setRoleFilter(roleType)}
// //               className={`py-1 text-[9px] font-mono rounded font-bold uppercase tracking-tight transition-colors ${
// //                 roleFilter === roleType 
// //                   ? 'bg-zinc-800 text-emerald-400 border border-zinc-700/60' 
// //                   : 'text-zinc-500 hover:text-zinc-300'
// //               }`}
// //             >
// //               {roleType === 'ALL' ? 'All Roles' : `${roleType}s`}
// //             </button>
// //           ))}
// //         </div>

// //         {/* Directory Query Input Layout */}
// //         <div className="relative">
// //           <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
// //           <input 
// //             type="text"
// //             placeholder="Search name or email..."
// //             value={searchQuery}
// //             onChange={(e) => setSearchQuery(e.target.value)}
// //             className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
// //           />
// //         </div>

// //         {/* Scroll Directory Stack */}
// //         <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
// //           {filteredUsers.map((userItem) => {
// //             const isSelected = userItem.id === selectedUserId;
// //             const isTeacher = userItem.role === 'TEACHER';
            
// //             return (
// //               <div
// //                 key={userItem.id}
// //                 onClick={() => setSelectedUserId(userItem.id)}
// //                 className={`p-3 rounded-xl border cursor-pointer transition-all ${
// //                   isSelected 
// //                     ? 'bg-zinc-800 border-zinc-700 shadow-md shadow-black/20' 
// //                     : 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-800 hover:bg-zinc-950/80'
// //                 }`}
// //               >
// //                 <div className="flex items-start justify-between">
// //                   <div className="flex flex-col max-w-[70%]">
// //                     <span className="text-xs font-semibold text-zinc-200 truncate">{userItem.name}</span>
// //                     <span className="text-[10px] text-zinc-500 truncate font-mono">{userItem.email}</span>
// //                   </div>
// //                   <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-bold tracking-wide shrink-0 ${
// //                     isTeacher ? 'bg-indigo-950/40 text-indigo-400 border border-indigo-900/30' : 'bg-amber-950/40 text-amber-400 border border-amber-900/30'
// //                   }`}>
// //                     {userItem.role}
// //                   </span>
// //                 </div>
                
// //                 <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-800/40">
// //                   <span className="text-[9px] font-mono flex items-center gap-1">
// //                     <School className="w-2.5 h-2.5 text-zinc-600" /> 
// //                     {isTeacher 
// //                       ? `${userItem.assigned_classes.length} Maps Assigned` 
// //                       : (userItem.student_class?.class_name || 'Unassigned Class')
// //                     }
// //                   </span>
// //                   <span className={`w-1.5 h-1.5 rounded-full ${userItem.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
// //                 </div>
// //               </div>
// //             );
// //           })}
// //         </div>
// //       </div>

// //       {/* PANEL 2: PROFILE & RELATIONSHIP MAP WORKSPACE */}
// //       {currentUser && (
// //         <div className="xl:col-span-2 space-y-6">
          
// //           {/* Active Profile Header Control Panel Banner */}
// //           <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm">
// //             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
// //               <div className="flex flex-col gap-1">
// //                 <div className="flex items-center gap-2">
// //                   <span className="px-2 py-0.5 bg-zinc-950 rounded text-[10px] font-mono border border-zinc-800 text-zinc-400">UID REFERENCE: #{currentUser.id}</span>
// //                   <span className={`w-2 h-2 rounded-full ${currentUser.is_active ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
// //                 </div>
// //                 <h1 className="text-xl font-bold tracking-tight text-zinc-100 mt-1">{currentUser.name}</h1>
// //                 <p className="text-xs text-zinc-400 flex items-center gap-1"><Mail className="w-3 h-3" /> {currentUser.email}</p>
// //               </div>

// //               {/* Security Direct Mutation System Switches */}
// //               <div className="flex items-center gap-1.5 shrink-0 bg-zinc-950/60 p-1.5 rounded-lg border border-zinc-800/80">
// //                 <button
// //                   onClick={() => handleToggleActivity(currentUser.id)}
// //                   className={`px-3 py-1.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition-all border ${
// //                     currentUser.is_active 
// //                       ? 'bg-rose-950/30 hover:bg-rose-950/60 text-rose-400 border-rose-900/40' 
// //                       : 'bg-emerald-950/30 hover:bg-emerald-950/60 text-emerald-400 border-emerald-900/40'
// //                   }`}
// //                 >
// //                   {currentUser.is_active ? (
// //                     <>
// //                       <UserX className="w-3 h-3" /> Deactivate Account & Revoke JTI
// //                     </>
// //                   ) : (
// //                     <>
// //                       <UserCheck className="w-3 h-3" /> Reactivate Global Account Access
// //                     </>
// //                   )}
// //                 </button>
// //                 <button 
// //                   onClick={() => alert(`Transactional Command issued: Force security password reset hook for User #${currentUser.id}`)}
// //                   className="p-1.5 hover:bg-zinc-800 border border-transparent hover:border-zinc-700/60 rounded text-zinc-400 hover:text-zinc-200 transition-all"
// //                   title="Force Authentication Password Overwrite"
// //                 >
// //                   <Key className="w-3.5 h-3.5" />
// //                 </button>
// //               </div>
// //             </div>

// //             {/* Quick Map Binding Form Component Panel */}
// //             <div className="mt-5 pt-4 border-t border-zinc-800/80">
// //               <h3 className="text-xs font-semibold text-zinc-300 mb-2 flex items-center gap-1.5">
// //                 <Sliders className="w-3.5 h-3.5 text-sky-400" /> Bind to School Core Class Containers
// //               </h3>
// //               <form onSubmit={handleBindClass} className="flex gap-2">
// //                 <select
// //                   value={selectedClassId}
// //                   onChange={(e) => setSelectedClassId(e.target.value)}
// //                   className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-zinc-700 flex-1"
// //                 >
// //                   <option value="">Choose an active structural class profile mapping definition...</option>
// //                   {GLOBAL_CLASSES_POOL.map(classEntity => (
// //                     <option key={classEntity.id} value={classEntity.id}>
// //                       {classEntity.class_name} — {classEntity.description}
// //                     </option>
// //                   ))}
// //                 </select>
// //                 <button 
// //                   type="submit" 
// //                   disabled={!selectedClassId}
// //                   className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 disabled:bg-zinc-800 disabled:text-zinc-500 px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shrink-0"
// //                 >
// //                   Construct Relational Bind
// //                 </button>
// //               </form>
// //             </div>
// //           </div>

// //           {/* Bound Relationships Collection Display Layout */}
// //           <div>
// //             <h2 className="text-xs font-semibold tracking-wider text-zinc-400 uppercase mb-3">Currently Mapped Workspace Bindings</h2>
            
// //             {/* Condition check rendering based on dual role architectures */}
// //             {currentUser.role === 'STUDENT' ? (
// //               // Student strict 1-to-1 render view
// //               !currentUser.student_class ? (
// //                 <div className="border border-dashed border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center text-center gap-2 bg-zinc-900/10">
// //                   <AlertTriangle className="w-6 h-6 text-amber-500/80" />
// //                   <p className="text-xs text-zinc-500 max-w-xs">Student isolated outside the curriculum framework. Map container to restore authorization pipelines.</p>
// //                 </div>
// //               ) : (
// //                 <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between border-l-4 border-l-amber-500">
// //                   <div className="flex items-center gap-3">
// //                     <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center">
// //                       <School className="w-4 h-4 text-amber-400" />
// //                     </div>
// //                     <div>
// //                       <h4 className="text-xs font-bold text-zinc-200">{currentUser.student_class.class_name}</h4>
// //                       <p className="text-[10px] text-zinc-500">{currentUser.student_class.description}</p>
// //                     </div>
// //                   </div>
// //                   <button 
// //                     onClick={() => handleUnbindClass(currentUser.student_class.id)}
// //                     className="px-2.5 py-1 text-[10px] font-mono border border-zinc-800 text-zinc-400 bg-zinc-950 hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-900/40 rounded transition-all"
// //                   >
// //                     Unlink Primary Room
// //                   </button>
// //                 </div>
// //               )
// //             ) : (
// //               // Teacher array multi-class maps render view
// //               currentUser.assigned_classes.length === 0 ? (
// //                 <div className="border border-dashed border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center text-center gap-2 bg-zinc-900/10">
// //                   <ShieldAlert className="w-6 h-6 text-zinc-600" />
// //                   <p className="text-xs text-zinc-500 max-w-xs">Instructor possesses no classrooms assignment links. Resource dashboard nodes will evaluate to empty.</p>
// //                 </div>
// //               ) : (
// //                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                   {currentUser.assigned_classes.map((ac) => (
// //                     <div key={ac.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between hover:border-zinc-700 transition-colors border-l-2 border-l-indigo-500">
// //                       <div className="flex items-start justify-between gap-2">
// //                         <div className="flex items-center gap-2.5">
// //                           <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center">
// //                             <School className="w-4 h-4 text-indigo-400" />
// //                           </div>
// //                           <div>
// //                             <h4 className="text-xs font-bold text-zinc-200 leading-none">{ac.class_name}</h4>
// //                             <span className="text-[10px] text-zinc-500 mt-1 block truncate max-w-[140px]">{ac.description}</span>
// //                           </div>
// //                         </div>
// //                         <button 
// //                           onClick={() => handleUnbindClass(ac.id)}
// //                           className="px-2 py-1 bg-zinc-950 border border-zinc-800/80 hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-900/30 rounded text-[9px] font-mono text-zinc-500 transition-all"
// //                         >
// //                           Sever Mapping
// //                         </button>
// //                       </div>
// //                     </div>
// //                   ))}
// //                 </div>
// //               )
// //             )}
// //           </div>
// //         </div>
// //       )}

// //       {/* PANEL 3: MEMBERSHIP REGISTRATION & METRICS SIDECAR */}
// //       <div className="xl:col-span-1 space-y-4">
// //         <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
// //           <div>
// //             <h3 className="text-xs font-semibold text-zinc-200">Account Provisioning</h3>
// //             <p className="text-[10px] text-zinc-500">Initialize live operational records</p>
// //           </div>

// //           {/* Secure Inline Account Creation Registration Form */}
// //           <form onSubmit={handleCreateUser} className="space-y-2.5 p-3 bg-zinc-950 rounded-lg border border-zinc-800/60">
// //             <div>
// //               <label className="block text-[9px] text-zinc-500 font-mono font-bold uppercase mb-1">Full Legal Name</label>
// //               <input 
// //                 type="text"
// //                 placeholder="e.g. Gwen Stacy"
// //                 value={newUserName}
// //                 onChange={(e) => setNewUserName(e.target.value)}
// //                 className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
// //                 required
// //               />
// //             </div>
// //             <div>
// //               <label className="block text-[9px] text-zinc-500 font-mono font-bold uppercase mb-1">Corporate Email Address</label>
// //               <input 
// //                 type="email"
// //                 placeholder="gwen@academa.edu"
// //                 value={newUserEmail}
// //                 onChange={(e) => setNewUserEmail(e.target.value)}
// //                 className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
// //                 required
// //               />
// //             </div>
// //             <div>
// //               <label className="block text-[9px] text-zinc-500 font-mono font-bold uppercase mb-1">Polymorphic Core Role</label>
// //               <select 
// //                 value={newUserRole}
// //                 onChange={(e) => setNewUserRole(e.target.value)}
// //                 className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700"
// //               >
// //                 <option value="STUDENT">STUDENT (Strict Single Map)</option>
// //                 <option value="TEACHER">TEACHER (Multi-Map Array)</option>
// //               </select>
// //             </div>
// //             <div>
// //               <label className="block text-[9px] text-zinc-500 font-mono font-bold uppercase mb-1">Initialization Security Password</label>
// //               <input 
// //                 type="password"
// //                 placeholder="••••••••••••"
// //                 value={newUserPassword}
// //                 onChange={(e) => setNewUserPassword(e.target.value)}
// //                 className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
// //               />
// //             </div>
// //             <button type="submit" className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-950 py-1.5 rounded text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors mt-2">
// //               <Plus className="w-3 h-3" /> Commit Account Entry
// //             </button>
// //           </form>

// //           {/* Aggregate Role Distribution Graph Progress Indicators */}
// //           <div className="space-y-3 bg-zinc-950 p-3 rounded-lg border border-zinc-800/60">
// //             <h4 className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold font-mono">Role Enum Architecture</h4>
            
// //             <div className="space-y-2">
// //               <div className="space-y-1">
// //                 <div className="flex justify-between text-[10px] font-mono">
// //                   <span className="text-zinc-400">INSTRUCTORS (TEACHERS)</span>
// //                   <span className="text-zinc-200 font-bold">{teacherCount} accounts</span>
// //                 </div>
// //                 <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
// //                   <div className="h-full bg-indigo-500" style={{ width: `${(teacherCount / usersList.length) * 100}%` }} />
// //                 </div>
// //               </div>

// //               <div className="space-y-1">
// //                 <div className="flex justify-between text-[10px] font-mono">
// //                   <span className="text-zinc-400">ENROLLED STUDENTS</span>
// //                   <span className="text-zinc-200 font-bold">{studentCount} accounts</span>
// //                 </div>
// //                 <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
// //                   <div className="h-full bg-amber-500" style={{ width: `${(studentCount / usersList.length) * 100}%` }} />
// //                 </div>
// //               </div>
// //             </div>
// //           </div>

// //           {/* Security Compliance Constraints Box */}
// //           <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800/60 space-y-1.5 text-[11px] text-zinc-500 leading-normal">
// //             <h4 className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold font-mono flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-500" /> Identity Policies</h4>
// //             <p>✔ State Synchronization: Revoking access kills active active-tokens within the global caching router.</p>
// //             <p>✔ Unique Constraints: Database handles strict indexing keys across all email definitions.</p>
// //           </div>
// //         </div>
// //       </div>

// //     </div>
// //   );
// // }



// import React, { useState, useEffect } from 'react';
// import { 
//   Users, 
//   GraduationCap, 
//   UserCheck, 
//   Search, 
//   Mail, 
//   Tag, 
//   Plus, 
//   Calendar, 
//   Hash, 
//   BookOpen, 
//   MoreVertical, 
//   Filter 
// } from 'lucide-react';

// export default function UsersManagement() {
//   const [activeSubTab, setActiveSubTab] = useState('Staff'); // 'Staff' (Users) vs 'Students' (Students)
//   const [searchQuery, setSearchQuery] = useState('');
  
//   // State representing your core database models
//   const [users, setUsers] = useState([]);      // Represents the 'User' model
//   const [students, setStudents] = useState([]);  // Represents the 'Student' model

//   // Mock-seeding data in accordance with your backend schemas
//   useEffect(() => {
//     // 1. User Model Schema (System Administrators, Educators, Teachers)
//     setUsers([
//       { id: 1, first_name: "Sarah", last_name: "Jenkins", email: "s.jenkins@academa.edu", role: "educator", created_at: "2026-01-15" },
//       { id: 2, first_name: "Marcus", last_name: "Vance", email: "m.vance@academa.edu", role: "educator", created_at: "2026-02-10" },
//       { id: 3, first_name: "Elena", last_name: "Rostova", email: "e.rostova@academa.edu", role: "administrator", created_at: "2025-11-01" },
//     ]);

//     // 2. Student Model Schema (Enrolled Students)
//     setStudents([
//       { id: 101, first_name: "Alex", last_name: "Rivera", student_identifier: "STU-2026-001", email: "a.rivera@student.edu", enrollment_status: "active" },
//       { id: 102, first_name: "Chloe", last_name: "Chen", student_identifier: "STU-2026-042", email: "c.chen@student.edu", enrollment_status: "active" },
//       { id: 103, first_name: "Liam", last_name: "O'Connor", student_identifier: "STU-2025-109", email: "l.oconnor@student.edu", enrollment_status: "suspended" },
//     ]);
//   }, []);

//   // Filter handlers
//   const filteredUsers = users.filter(u => 
//     `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     u.email.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const filteredStudents = students.filter(s => 
//     `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     s.student_identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     s.email.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <div className="space-y-6">
//       {/* View Header */}
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <div>
//           <h1 className="text-xl font-bold tracking-tight text-zinc-100">User Identity & Directory Control</h1>
//           <p className="text-xs text-zinc-500">Manage global system Users (Staff/Educators) and enrolled Student profiles.</p>
//         </div>
//         <div className="flex items-center gap-2">
//           <button className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 font-medium">
//             <Filter className="w-3.5 h-3.5" /> Filter Model
//           </button>
//           <button className="bg-emerald-600 hover:bg-emerald-500 text-zinc-950 text-xs px-3 py-2 rounded-lg font-bold transition-colors flex items-center gap-1.5">
//             <Plus className="w-3.5 h-3.5 stroke-[3px]" /> Seed Record
//           </button>
//         </div>
//       </div>

//       {/* Model Entity Tabs */}
//       <div className="flex border-b border-zinc-900 gap-6">
//         <button
//           onClick={() => { setActiveSubTab('Staff'); setSearchQuery(''); }}
//           className={`pb-3 text-xs font-semibold tracking-wider uppercase transition-all relative ${
//             activeSubTab === 'Staff' ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
//           }`}
//         >
//           <span className="flex items-center gap-2">
//             <UserCheck className="w-4 h-4" /> User Model (Educators & Staff)
//           </span>
//           {activeSubTab === 'Staff' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-500" />}
//         </button>

//         <button
//           onClick={() => { setActiveSubTab('Students'); setSearchQuery(''); }}
//           className={`pb-3 text-xs font-semibold tracking-wider uppercase transition-all relative ${
//             activeSubTab === 'Students' ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
//           }`}
//         >
//           <span className="flex items-center gap-2">
//             <GraduationCap className="w-4 h-4" /> Student Model (Enrollments)
//           </span>
//           {activeSubTab === 'Students' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-500" />}
//         </button>
//       </div>

//       {/* Search Bar inside Tab Content */}
//       <div className="relative max-w-md">
//         <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
//         <input 
//           type="text" 
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           placeholder={activeSubTab === 'Staff' ? "Search users by name or email..." : "Search students by name or ID..."} 
//           className="w-full bg-zinc-900/40 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-zinc-700 transition-colors text-zinc-300 placeholder-zinc-600"
//         />
//       </div>

//       {/* Database Model Table Rendering */}
//       <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl shadow-black/10">
        
//         {activeSubTab === 'Staff' ? (
//           /* ================== TAB: USER MODEL (STAFF/EDUCATORS) ================== */
//           <div className="overflow-x-auto">
//             <table className="w-full text-left border-collapse text-xs text-zinc-300">
//               <thead>
//                 <tr className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
//                   <th className="p-4 w-12">ID</th>
//                   <th className="p-4">Name</th>
//                   <th className="p-4">Email Address</th>
//                   <th className="p-4">System Role</th>
//                   <th className="p-4">Created Date</th>
//                   <th className="p-4 w-10"></th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-zinc-800/40">
//                 {filteredUsers.length > 0 ? (
//                   filteredUsers.map((user) => (
//                     <tr key={user.id} className="hover:bg-zinc-800/20 transition-colors">
//                       <td className="p-4 font-mono text-zinc-500 text-[11px]">#{user.id}</td>
//                       <td className="p-4 font-semibold text-zinc-200">{user.first_name} {user.last_name}</td>
//                       <td className="p-4 text-zinc-400">
//                         <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-zinc-600" /> {user.email}</span>
//                       </td>
//                       <td className="p-4">
//                         <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
//                           user.role === 'administrator' 
//                             ? 'bg-purple-950/20 border-purple-800 text-purple-400' 
//                             : 'bg-emerald-950/20 border-emerald-800 text-emerald-400'
//                         }`}>
//                           <Tag className="w-2.5 h-2.5" /> {user.role}
//                         </span>
//                       </td>
//                       <td className="p-4 text-zinc-500">
//                         <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-zinc-600" /> {user.created_at}</span>
//                       </td>
//                       <td className="p-4 text-right">
//                         <button className="text-zinc-600 hover:text-zinc-300 transition-colors"><MoreVertical className="w-4 h-4" /></button>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="6" className="p-8 text-center text-zinc-500 italic">No corresponding User records found.</td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         ) : (
//           /* ================== TAB: STUDENT MODEL ================== */
//           <div className="overflow-x-auto">
//             <table className="w-full text-left border-collapse text-xs text-zinc-300">
//               <thead>
//                 <tr className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
//                   <th className="p-4 w-12">ID</th>
//                   <th className="p-4">Student ID</th>
//                   <th className="p-4">Name</th>
//                   <th className="p-4">Email Address</th>
//                   <th className="p-4">Enrollment Status</th>
//                   <th className="p-4 w-10"></th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-zinc-800/40">
//                 {filteredStudents.length > 0 ? (
//                   filteredStudents.map((student) => (
//                     <tr key={student.id} className="hover:bg-zinc-800/20 transition-colors">
//                       <td className="p-4 font-mono text-zinc-500 text-[11px]">#{student.id}</td>
//                       <td className="p-4 font-mono text-[11px] font-semibold text-sky-400">
//                         <span className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5 text-sky-700" /> {student.student_identifier}</span>
//                       </td>
//                       <td className="p-4 font-semibold text-zinc-200">{student.first_name} {student.last_name}</td>
//                       <td className="p-4 text-zinc-400">
//                         <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-zinc-600" /> {student.email}</span>
//                       </td>
//                       <td className="p-4">
//                         <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
//                           student.enrollment_status === 'active' 
//                             ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-900' 
//                             : 'bg-rose-950/30 text-rose-400 border border-rose-900'
//                         }`}>
//                           {student.enrollment_status}
//                         </span>
//                       </td>
//                       <td className="p-4 text-right">
//                         <button className="text-zinc-600 hover:text-zinc-300 transition-colors"><MoreVertical className="w-4 h-4" /></button>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="6" className="p-8 text-center text-zinc-500 italic">No corresponding Student records found.</td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Model Relationship Metadata Summary Card */}
//       <div className="bg-zinc-900/50 border border-zinc-800/60 p-4 rounded-xl flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           <BookOpen className="w-5 h-5 text-zinc-500" />
//           <div className="flex flex-col">
//             <span className="text-xs font-semibold text-zinc-300">Association Architecture</span>
//             <span className="text-[10px] text-zinc-500">
//               Users and Students are mapped to Classes via the <strong className="text-zinc-400">ClassMember</strong> join-model relationships.
//             </span>
//           </div>
//         </div>
//         <span className="text-[10px] bg-zinc-950 px-2.5 py-1 rounded border border-zinc-800 font-mono text-zinc-400">
//           SQLAlchemy Enforced
//         </span>
//       </div>
//     </div>
//   );
// }