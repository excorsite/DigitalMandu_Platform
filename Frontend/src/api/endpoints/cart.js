import client from '../client';
import { API_ENDPOINTS } from '../config';

export const cartAPI = {
  getCart: () => client.get(API_ENDPOINTS.CART_GET),
  addItem: (productID, data) => client.post(API_ENDPOINTS.CART_ADD.replace(':productID', productID), data || {}),
  removeItem: (cartID) => client.delete(API_ENDPOINTS.CART_REMOVE.replace(':cartID', cartID)),
  updateItem: (cartID, data) => client.patch(API_ENDPOINTS.CART_UPDATE.replace(':cartID', cartID), data),
  clearCart: () => client.delete(API_ENDPOINTS.CART_GET),
};
