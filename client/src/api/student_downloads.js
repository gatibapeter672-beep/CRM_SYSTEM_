// client/src/api/student_downloads.js
import apiClient from '../context/apiClient';

const handleResponse = (res) => res.data;

const handleError = (error) => {
  console.error('API Error:', error?.response || error.message);
  throw error;
};

// ==============================
// 🎓 STUDENT CURRICULUM PORTAL
// ==============================

export const getStudentCurriculum = async () => {
  try {
    const res = await apiClient.get(`/portal/student/curriculum`);
    return handleResponse(res);
  } catch (error) {
    handleError(error);
  }
};

// ==============================
// 📦 DOWNLOAD ARCHIVE HISTORY
// ==============================

// GET /api/portal/student/downloads-archive
export const getStudentDownloadHistory = async () => {
  try {
    const res = await apiClient.get(`/portal/student/downloads-archive`);
    return handleResponse(res);
  } catch (error) {
    handleError(error);
  }
};

// ==============================
// 👁️ TRACK RESOURCE VIEW
// ==============================

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