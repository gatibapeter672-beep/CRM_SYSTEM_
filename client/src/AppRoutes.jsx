import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout Templates & Shell Assemblies
import PublicLayout from './layouts/PublicLayout';
import ProtectedRoute from './layouts/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout'; 

// Views (Full Page Contexts)
import LandingPage from './views/LandingPage';
import Login from './views/LoginForm';
import Register from './views/RegisterForm';
import ResourceExplorer from './views/ResourceExplorer';
import TeacherRoster from './views/TeacherRoster';
import Unauthorized from './views/Unauthorized';

// 📂 Pages Layouts (Your fully equipped standalone dashboards)
import AdminDashboard from './pages/admin/AdminDashboard';
import TeacherDashboardPage from './pages/teacher/TeacherDashboard';
import StudentDashboardPage from './pages/student/StudentDashboard';
import { useAuth } from './context/AuthContext';

// 🚀 Clean Inline Gateway Component
const CentralDashboardGateway = () => {
  const { user } = useAuth();

  if (!user || !user.role) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role.toLowerCase();

  if (role === 'admin') {
    return <Navigate to="/dashboard/admin" replace />;
  } else if (role === 'teacher') {
    return <Navigate to="/dashboard/teacher" replace />;
  } else if (role === 'student') {
    return <Navigate to="/dashboard/student" replace />;
  } else {
    return <Navigate to="/unauthorized" replace />;
  }
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* 🔓 PUBLIC PAGES */}
      <Route path="/" element={<LandingPage />} />
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Route>

      {/* 🔐 BASE GATEWAY REDIRECT */}
      <Route element={<ProtectedRoute allowedRoles={['student', 'teacher', 'admin']} />}>
        <Route path="/dashboard" element={<CentralDashboardGateway />} />
      </Route>

      {/* 🛠️ STANDALONE ADMIN DASHBOARD (No outer layout) */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
      </Route>

      {/* 🍎 STANDALONE TEACHER DASHBOARDS */}
      <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
        <Route path="/dashboard/teacher" element={<TeacherDashboardPage />} />
      </Route>

      {/* 🎓 STANDALONE STUDENT DASHBOARD */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route path="/dashboard/student" element={<StudentDashboardPage />} />
      </Route>

      {/* 📦 OTHER UTILITY PAGES (Only use DashboardLayout if they need it) */}
      <Route element={<ProtectedRoute allowedRoles={['student', 'teacher', 'admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/explore" element={<ResourceExplorer />} />
          <Route path="/roster" element={<TeacherRoster />} />
        </Route>
      </Route>

      {/* FALLBACK ROOT REDIRECT */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};




// if u want to use one dashoardlayout for admin and so on and just input the teachers staff there use this bt coz i have 3 separate db dont

// import React from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';

// // Layout Templates & Shell Assemblies
// import PublicLayout from './layouts/PublicLayout';
// import ProtectedRoute from './layouts/ProtectedRoute';
// import DashboardLayout from './components/DashboardLayout'; 

// // Views (Full Page Contexts)
// import LandingPage from './views/LandingPage';
// import Login from './views/LoginForm';
// import Register from './views/RegisterForm';
// import ResourceExplorer from './views/ResourceExplorer';
// import TeacherRoster from './views/TeacherRoster';
// import Unauthorized from './views/Unauthorized';

// // 📂 Pages Layouts
// import AdminDashboard from './pages/admin/AdminDashboard';
// import TeacherDashboardPage from './pages/teacher/TeacherDashboard';
// import StudentDashboardPage from './pages/student/StudentDashboard';
// import { useAuth } from './context/AuthContext';

// // 🚀 Clean Inline Gateway Component
// const CentralDashboardGateway = () => {
//   const { user } = useAuth();

//   if (!user || !user.role) {
//     return <Navigate to="/login" replace />;
//   }

//   const role = user.role.toLowerCase();

//   if (role === 'admin') {
//     return <Navigate to="/dashboard/admin" replace />;
//   } else if (role === 'teacher') {
//     return <Navigate to="/dashboard/teacher" replace />;
//   } else if (role === 'student') {
//     return <Navigate to="/dashboard/student" replace />;
//   } else {
//     return <Navigate to="/unauthorized" replace />;
//   }
// };

// export const AppRoutes = () => {
//   return (
//     <Routes>
//       {/* 🔓 PUBLIC PAGES */}
//       <Route path="/" element={<LandingPage />} />
//       <Route element={<PublicLayout />}>
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/unauthorized" element={<Unauthorized />} />
//       </Route>

//       {/* 🔐 PROTECTED APPLICATION DASHBOARDS */}
//       <Route element={<ProtectedRoute allowedRoles={['student', 'teacher', 'admin']} />}>
//         <Route element={<DashboardLayout />}>
          
//           {/* Main workspace entry point - Auto routes to the sub-dashboard immediately */}
//           <Route path="/dashboard" element={<CentralDashboardGateway />} />
          
//           {/* 🛠️ Admin Dedicated Route */}
//           <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
//             <Route path="/dashboard/admin" element={<AdminDashboard />} />
//           </Route>

//           {/* 🍎 Teacher Dedicated Routes */}
//           <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
//             <Route path="/dashboard/teacher" element={<TeacherDashboardPage />} />
//             <Route path="/roster" element={<TeacherRoster />} />
//           </Route>

//           {/* 🎓 Student Dedicated Route */}
//           <Route element={<ProtectedRoute allowedRoles={['student']} />}>
//             <Route path="/dashboard/student" element={<StudentDashboardPage />} />
//           </Route>
          
//           <Route path="/explore" element={<ResourceExplorer />} />
//         </Route>
//       </Route>

//       {/* FALLBACK ROOT REDIRECT */}
//       <Route path="*" element={<Navigate to="/" replace />} />
//     </Routes>
//   );
// };



