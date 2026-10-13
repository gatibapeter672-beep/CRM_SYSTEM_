// src/api/adm_classes.js
import apiClient from '../context/apiClient';

const handleResponse = (res) => res.data;

const handleError = (error) => {
  console.error('API Error:', error?.response || error.message);
  throw error;
};

// 🔥 BASE PATH (single source of truth)
const BASE = '/api/admin';

// ==============================
// 📦 CLASSES
// ==============================

// GET /api/admin/classes
export const getClasses = async () => {
  try {
    const res = await apiClient.get(`${BASE}/classes`);
    return handleResponse(res);
  } catch (error) {
    handleError(error);
  }
};

// POST /api/admin/classes
export const createClass = async (classData) => {
  try {
    const res = await apiClient.post(`${BASE}/classes`, classData);
    return handleResponse(res);
  } catch (error) {
    handleError(error);
  }
};

// ==============================
// 📘 SUBJECTS
// ==============================

// POST /api/admin/classes/<class_id>/subjects
export const bindSubjectToClass = async (classId, subjectId) => {
  try {
    const res = await apiClient.post(
      `${BASE}/classes/${classId}/subjects`,
      { entity_id: subjectId }   // 🔥 FIXED KEY
    );
    return handleResponse(res);
  } catch (error) {
    handleError(error);
  }
};

// DELETE /api/admin/classes/subjects/<bridge_id>
export const unbindSubjectFromClass = async (bridgeId) => {
  try {
    const res = await apiClient.delete(
      `${BASE}/classes/subjects/${bridgeId}`
    );
    return handleResponse(res);
  } catch (error) {
    handleError(error);
  }
};

// ==============================
// 👨‍🏫 TEACHERS
// ==============================

// POST /api/admin/classes/<class_id>/teachers
export const bindTeacherToClass = async (classId, teacherId) => {
  try {
    const res = await apiClient.post(
      `${BASE}/classes/${classId}/teachers`,
      { entity_id: teacherId }   // 🔥 FIXED KEY
    );
    return handleResponse(res);
  } catch (error) {
    handleError(error);
  }
};

// DELETE /api/admin/classes/teachers/<bridge_id>
export const unbindTeacherFromClass = async (bridgeId) => {
  try {
    const res = await apiClient.delete(
      `${BASE}/classes/teachers/${bridgeId}`
    );
    return handleResponse(res);
  } catch (error) {
    handleError(error);
  }
};

// ==============================
// 🎓 STUDENTS
// ==============================

// POST /api/admin/classes/<class_id>/students
export const bindStudentToClass = async (classId, studentId) => {
  try {
    const res = await apiClient.post(
      `${BASE}/classes/${classId}/students`,
      { entity_id: studentId }   // 🔥 FIXED KEY
    );
    return handleResponse(res);
  } catch (error) {
    handleError(error);
  }
};

// DELETE /api/admin/classes/students/<bridge_id>
export const unbindStudentFromClass = async (bridgeId) => {
  try {
    const res = await apiClient.delete(
      `${BASE}/classes/students/${bridgeId}`
    );
    return handleResponse(res);
  } catch (error) {
    handleError(error);
  }
};

// ==============================
// 🌍 GLOBAL POOLS
// ==============================

// GET /api/admin/pools
export const getGlobalPools = async () => {
  try {
    const res = await apiClient.get(`${BASE}/pools`);
    return handleResponse(res);
  } catch (error) {
    handleError(error);
  }
};