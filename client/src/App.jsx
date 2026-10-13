import { useState } from 'react'
import { AppRoutes } from './AppRoutes'
import AdminDashboard from './pages/admin/AdminDashboard'
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import './index.css';

function App() {
  
  return (
    <>
     
      <AppRoutes/>
      {/* <AdminDashboard/>
      <TeacherDashboard/>
      <StudentDashboard/> */}
    </>
  )
}

export default App
