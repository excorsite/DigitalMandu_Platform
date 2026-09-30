import { create } from 'zustand';
import { authAPI } from '../api/endpoints/auth';
import { useUIStore } from './uiStore';

function mapRoleToUI(role) {
  if (role === 'admin' || role === 'seller') return 'seller';
  if (role === 'customer') return 'buyer';
  return role || 'buyer';
}

function syncRoleFromUser(user) {
  const role = user?.role ? mapRoleToUI(user.role) : null;
  if (role) {
    localStorage.setItem('userRole', role);
    useUIStore.setState({ userRole: role });
  }
}

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || localStorage.getItem('authToken') || null,
  isAuthenticated: !!(localStorage.getItem('token') || localStorage.getItem('authToken')),
  loading: false,
  error: null,
  login: async (userData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authAPI.login(userData);
      const token = data.token || data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('authToken', token);
      const userObj = data.data && typeof data.data === 'object' && !Array.isArray(data.data) && data.data.email ? data.data : (data.data?.user || data.user || null);
      if (userObj) localStorage.setItem('user', JSON.stringify(userObj));
      syncRoleFromUser(userObj);
      set({ user: userObj, token, isAuthenticated: true, loading: false });
      return { ...data, _resolvedUser: userObj };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      set({ error: msg, loading: false });
      throw err;
    }
  },
  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authAPI.register(userData);
      const token = data.token || data.data;
      if (token && typeof token === 'string') { localStorage.setItem('token', token); localStorage.setItem('authToken', token); }
      set({ user: data.data?.user || data.user || null, token, isAuthenticated: !!token, loading: false });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      set({ error: msg, loading: false });
      throw err;
    }
  },
  logout: async () => {
    localStorage.removeItem('token'); localStorage.removeItem('authToken'); localStorage.removeItem('user'); localStorage.removeItem('userRole');
    useUIStore.setState({ userRole: 'buyer' });
    set({ user: null, token: null, isAuthenticated: false });
  },
  setUser: (user) => { localStorage.setItem('user', JSON.stringify(user)); set({ user }); },
  clearError: () => set({ error: null }),
}));
