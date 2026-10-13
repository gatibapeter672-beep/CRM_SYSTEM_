export const USER_KEY = 'user';
export const TOKEN_KEY = 'token';

export const isAdmin = (user) => user?.role === 'owner';

export const saveUserToStorage = (user, token) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeUserFromStorage = () => {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
};

export const getUserFromStorage = () => {
  const stored = localStorage.getItem(USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const getTokenFromStorage = () => localStorage.getItem(TOKEN_KEY);