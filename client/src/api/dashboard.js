//src/api/dashoard.js
// dashboard.js
import apiClient from '../context/apiClient';

const handleResponse = (res) => res.data;

const handleError = (error)=>{
    console.error('Api Error:', error?.response || error.message);
    throw error;
};




export const getOverview = async () => {
  try{
    const res = await apiClient.get('/dashboard/overview');
    return handleResponse(res);
  }catch (error){
    handleError(error)
  }
};


export const getTrending = async() =>{
    try{
      const res = await apiClient.get('/dashboard/analytics/trending');
      return handleResponse(res);

    } catch(error){
      handleError(error);
    }
};

export const getGaps = async()=>{
  try {
    const res = await apiClient.get('/dashboard/curriculum/gaps');
    return handleResponse(res);
  }  catch(error){
    handleError(error);
  }
};

// export const searchDashoard = async (query)=>{
//   try {
//     const res = await apiClient.get();
//     return handleResponse(res);
//   }catch(error){
//     handleError(error);
//   }
// };

export const getAudit = async()=>{
  try{
    const res = await apiClient.get('/dashboard/security/audits');
    return handleResponse(res);
  }catch(error){
    handleError(error);
  }
};

export const getTagCloud = async()=>{
  try{
    const res = await apiClient.get('/dashboard/tags/cloud');
    return handleResponse(res)
  }catch(error){
    handleError(error)
  }
};

export const searchDashoard = async (query, page=1, perPage=5)=>{
  try{
    const res = await apiClient.get('/dashboard/search',{
      params: {
        q: query,
        page,
        per_page:perPage,
      },
    });
    return handleResponse(res)
  }catch(error){
    handleError(error)
  }
};
