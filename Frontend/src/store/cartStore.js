import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: JSON.parse(localStorage.getItem('cartItems') || '[]'),
  addItem: (product) => set((state) => {
    const exists = state.items.find((i) => (i._id || i.id) === (product._id || product.id));
    let updated;
    if (exists) updated = state.items.map((i) => (i._id || i.id) === (product._id || product.id) ? { ...i, quantity: (i.quantity || 1) + 1 } : i);
    else updated = [...state.items, { ...product, quantity: 1 }];
    localStorage.setItem('cartItems', JSON.stringify(updated));
    return { items: updated };
  }),
  removeItem: (id) => set((state) => {
    const updated = state.items.filter((i) => (i._id || i.id) !== id);
    localStorage.setItem('cartItems', JSON.stringify(updated));
    return { items: updated };
  }),
  updateQuantity: (id, qty) => set((state) => {
    const updated = state.items.map((i) => (i._id || i.id) === id ? { ...i, quantity: Math.max(1, qty) } : i);
    localStorage.setItem('cartItems', JSON.stringify(updated));
    return { items: updated };
  }),
  clearCart: () => { localStorage.removeItem('cartItems'); set({ items: [] }); },
  getTotal: () => get().items.reduce((t, i) => t + (i.price || 0) * (i.quantity || 1), 0),
  getCount: () => get().items.reduce((t, i) => t + (i.quantity || 1), 0),
}));
