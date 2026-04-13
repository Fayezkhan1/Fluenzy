const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const post = async (endpoint, body) => {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.json();
  } catch {
    return { error: 'Unable to connect to server. Please try again.' };
  }
};

const refreshTokens = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return false;
  
  const data = await post('/api/auth/refresh', { refresh_token: refreshToken });
  if (data.access_token) {
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    return true;
  }
  return false;
};

export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('access_token');
  if (!token) return { ok: false, json: async () => null };
  
  try {
    const res = await fetch(url, {
      ...options,
      headers: { ...options.headers, 'Authorization': `Bearer ${token}` },
    });
    
    if (res.status === 401 || res.status === 403) {
      if (await refreshTokens()) {
        const newToken = localStorage.getItem('access_token');
        return fetch(url, {
          ...options,
          headers: { ...options.headers, 'Authorization': `Bearer ${newToken}` },
        });
      }
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    return res;
  } catch (err) {
    console.error('Network error:', err);
    return { ok: false, json: async () => ({ error: 'Network error. Please check your connection.' }) };
  }
};

export const login = (email, password) => post('/api/auth/login', { email, password });

export const register = (email, password) => post('/api/auth/register', { email, password });

export const getUser = async () => {
  if (!localStorage.getItem('access_token')) return null;
  
  const res = await fetchWithAuth(`${API_URL}/api/profile/user`);
  const data = await res.json();
  
  if (data?.error) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    return null;
  }
  return data;
};
