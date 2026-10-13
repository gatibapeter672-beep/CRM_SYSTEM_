// client/src/api/teacher_classes.js
import apiClient from '../context/apiClient';

const handleResponse = (res) => res.data;

const handleError = (error) => {
  console.error('API Error:', error?.response || error.message);
  throw error;
};

// ==============================
// 📚 MY CLASSES OPERATIONS
// ==============================

// GET /teacher/my-classes
export const getMyClasses = async () => {
  try {
    const res = await apiClient.get('/api/teacher/my-classes');
    return handleResponse(res);
  } catch (error) {
    handleError(error);
  }
};