//src/api/std_dashoard.js

import apiClient from "../context/apiClient";

const handleResponse=(res)=> res.data;

const handleError=(error)=>{
    console.error('Api Error:', error?.response || error.message);
    throw error;
};

export const get_std_dashboard = async()=>{
    try{
        const res = await apiClient.get('/dashboard/student');
        return handleResponse(res);
    }catch(error){
        handleError(error);
    }
};