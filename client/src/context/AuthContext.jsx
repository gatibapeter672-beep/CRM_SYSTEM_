import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import apiClient from './apiClient';

export const AuthContext = createContext(null);

// Helper function to normalize user role to a clean, lowercase string
const normalizeUserRole = (userData) => {
  if (!userData) return null;
  
  // If role is an object like { role_name: 'admin' }, extract the string
  const rawRole = typeof userData.role === 'object' 
    ? userData.role?.role_name 
    : userData.role;
    
  return {
    ...userData,
    role: rawRole ? rawRole.toLowerCase().trim() : null
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/logout');
    } catch (err) {
      console.error("Session logout cleanup error:", err);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('user_role');
    }
  }, []);

  // Initial Boot: Verify the cookie session with the backend
  useEffect(() => {
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem('user');
      
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          
          // Fast backend ping to ensure session is valid
          const response = await apiClient.get('/me'); 
          console.log("ME RESPONSE:", response.data);
          // 🚀 FIX: Normalize the backend user data before setting state
          const normalized = normalizeUserRole(response.data.user);
          console.log("NORMALIZED USER:", normalized);
          setUser(normalized);
          localStorage.setItem('user', JSON.stringify(normalized));
          if (normalized?.role) {
            localStorage.setItem('user_role', normalized.role);
          }
        } catch (err) {
          console.error("Session verification failed. Clearing state.");
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('user_role');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    const handleForceLogout = () => {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('user_role');
    };

    window.addEventListener('auth:session_expired', handleForceLogout);
    return () => window.removeEventListener('auth:session_expired', handleForceLogout);
  }, []);

  const login = (userData) => {
    // 🚀 FIX: Normalize here as well to keep everything aligned
    const normalized = normalizeUserRole(userData);
    setUser(normalized);
    localStorage.setItem('user', JSON.stringify(normalized));
    if (normalized?.role) {
      localStorage.setItem('user_role', normalized.role);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);



































// import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
// import apiClient from './apiClient';

// export const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // 1. Unified Logout Function (Memoized to prevent render loops)
//   const logout = useCallback(async () => {
//     try {
//       await apiClient.post('/logout'); // Revokes tokens on the backend blocklist
//     } catch (err) {
//       console.error("Session logout cleanup error:", err);
//     } finally {
//       setUser(null);
//       localStorage.removeItem('user');
//     }
//   }, []);

//   // 2. Initial Boot: Verify the cookie session with the backend
//   useEffect(() => {
//     const initializeAuth = async () => {
//       const savedUser = localStorage.getItem('user');
      
//       if (savedUser) {
//         try {
//           // Pre-populate state so UI doesn't flicker
//           setUser(JSON.parse(savedUser));
          
//           // Fast backend ping to ensure cookies are still valid and match our state
//           const response = await apiClient.get('/me'); 
//           setUser(response.data.user);
//           localStorage.setItem('user', JSON.stringify(response.data.user));
//         } catch (err) {
//           // If this fails, the access/refresh cookies are dead or missing!
//           console.error("Session verification failed. Clearing state.");
//           setUser(null);
//           localStorage.removeItem('user');
//         }
//       }
//       setLoading(false);
//     };

//     initializeAuth();
//   }, []);

//   // 3. Setup a direct event link so our Axios interceptor can force a logout if refreshing fails
//   useEffect(() => {
//     const handleForceLogout = () => {
//       setUser(null);
//       localStorage.removeItem('user');
//     };

//     window.addEventListener('auth:session_expired', handleForceLogout);
//     return () => window.removeEventListener('auth:session_expired', handleForceLogout);
//   }, []);

//   const login = (userData) => {
//     setUser(userData);
//     localStorage.setItem('user', JSON.stringify(userData));
//   };

//   const isAuthenticated = !!user;

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         isAuthenticated,
//         login,
//         logout,
//         loading,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);