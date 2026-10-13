// client/src/api/student_portal_subj
import apiClient from '../context/apiClient';

const handleResponse = (res) => res.data;

const handleError = (error) => {
  console.error('API Error:', error?.response || error.message);
  throw error;
};

// 🔥 BASE PATH
const BASE = '/api';

// ==============================
// 🎓 STUDENT CURRICULUM PORTAL
// ==============================

// GET /api/portal/student/curriculum
export const getStudentCurriculum = async () => {
  try {
    const res = await apiClient.get(`/portal/student/curriculum`);
    return handleResponse(res);
  } catch (error) {
    handleError(error);
  }
};

// ==============================
// 👁️ TRACK RESOURCE VIEW
// ==============================

// POST /api/portal/resources/track-view
export const trackResourceView = async (resourceId) => {
  try {
    const res = await apiClient.post(
      `/portal/resources/track-view`,
      { resource_id: resourceId }
    );
    return handleResponse(res);
  } catch (error) {
    handleError(error);
  }
};

// ==============================
// ⬇️ TRACK RESOURCE DOWNLOAD
// ==============================

// POST /api/portal/resources/track-download
export const trackResourceDownload = async (resourceId) => {
  try {
    const res = await apiClient.post(
      `/portal/resources/track-download`,
      { resource_id: resourceId }
    );
    return handleResponse(res);
  } catch (error) {
    handleError(error);
  }
};