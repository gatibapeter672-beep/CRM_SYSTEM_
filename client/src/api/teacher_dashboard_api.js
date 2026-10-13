import apiClient from "../context/apiClient";

const handleResponse = (res) => res.data;

const handleError = (error) => {
  console.error("Teacher Dashboard API Error:", error?.response || error.message);
  throw error;
};

/**
 * Fetch initial workspace statistics, assigned classes, and active subjects.
 */
export const getTeacherWorkspaceMetadata = async () => {
  try {
    const res = await apiClient.get("/portal/teacher/workspace");
    return handleResponse(res);
  } catch (error) {
    handleError(error);
  }
};


/**
 * Publish a new resource payload to the database.
 * @param {FormData} formData 
 */
export const publishFacultyResource = async (formData) => {
  try {
    const res = await apiClient.post("/portal/teacher/resources/publish", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return handleResponse(res);
  } catch (error) {
    handleError(error);
  }
};

// /**
//  * Publish a new resource payload to the database.
//  * @param {Object} payload 
//  */
// export const publishFacultyResource = async (payload) => {
//   try {
//     const res = await apiClient.post("/portal/teacher/resources/publish", payload);
//     return handleResponse(res);
//   } catch (error) {
//     handleError(error);
//   }
// };
