import { create } from 'zustand';

export const useUIStore = create((set) => ({
  sidebarOpen: true,
  userRole: localStorage.getItem('userRole') || 'buyer',
  theme: 'light',
  notifications: [],
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setUserRole: (role) => { localStorage.setItem('userRole', role); set({ userRole: role }); },
  addNotification: (n) => set((s) => ({ notifications: [...s.notifications, { id: Date.now(), ...n }] })),
  removeNotification: (id) => set((s) => ({ notifications: s.notifications.filter((x) => x.id !== id) })),
}));
