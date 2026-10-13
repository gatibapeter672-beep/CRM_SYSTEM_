// client/src/api/teacher_uploads.js
import apiClient from '../context/apiClient';

const handleResponse = (res) => res.data;

const handleError = (error) => {
  console.error('API Error:', error?.response || error.message);
  throw error;
};

// ==============================
// 📤 MY UPLOADS OPERATIONS
// ==============================

// GET /api/my-uploads
export const getMyUploads = async () => {
  try {
    const res = await apiClient.get('/api/my-uploads');
    return handleResponse(res);
  } catch (error) {
    handleError(error);
  }
};

// PATCH /api/resources/:id
export const updateResourceStatus = async (resourceId) => {
  try {
    const res = await apiClient.patch(`/api/resources/${resourceId}`);
    return handleResponse(res);
  } catch (error) {
    handleError(error);
  }
};

// DELETE /api/resources/:id
export const deleteResource = async (resourceId) => {
  try {
    const res = await apiClient.delete(`/api/resources/${resourceId}`);
    return handleResponse(res);
  } catch (error) {
    handleError(error);
  }
};