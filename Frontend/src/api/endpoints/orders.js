import client from '../client';
import { API_ENDPOINTS } from '../config';

export const ordersAPI = {
  getOrders: () => client.get(API_ENDPOINTS.ORDER_LIST),
  create: (data) => client.post(API_ENDPOINTS.ORDER_CREATE, data),
  cancel: (data) => client.patch(API_ENDPOINTS.ORDER_CANCEL, data),
  update: (id, data) => client.patch(API_ENDPOINTS.ORDER_UPDATE.replace(':id', id), data),
  delete: (id) => client.delete(API_ENDPOINTS.ORDER_DELETE.replace(':id', id)),
  getDetail: (id) => client.get(API_ENDPOINTS.ORDER_UPDATE.replace(':id', id)),
  updateStatus: (id, status) => client.patch(API_ENDPOINTS.ORDER_UPDATE.replace(':id', id), { status }),
  // admin
  adminGetAll: () => client.get(API_ENDPOINTS.ADMIN_ORDERS),
  adminGetDetail: (id) => client.get(API_ENDPOINTS.ADMIN_ORDER_DETAIL.replace(':id', id)),
  adminUpdate: (id, data) => client.patch(API_ENDPOINTS.ADMIN_ORDER_UPDATE.replace(':id', id), data),
  adminDelete: (id) => client.delete(API_ENDPOINTS.ADMIN_ORDER_DELETE.replace(':id', id)),
};
