import client from '../client';
import { API_ENDPOINTS } from '../config';

export const productsAPI = {
  getList: (params) => client.get(API_ENDPOINTS.PRODUCTS_LIST, { params }),
  getDetail: (id) => client.get(API_ENDPOINTS.PRODUCT_DETAIL.replace(':id', id)),
  create: (data) => client.post(API_ENDPOINTS.PRODUCT_CREATE, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => client.patch(API_ENDPOINTS.PRODUCT_UPDATE.replace(':id', id), data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => client.delete(API_ENDPOINTS.PRODUCT_DELETE.replace(':id', id)),
  search: (query) => client.get(API_ENDPOINTS.PRODUCTS_LIST, { params: { q: query } }),
  getReviews: (id) => client.get(API_ENDPOINTS.PRODUCT_REVIEWS.replace(':id', id)),
  // admin aliases
  adminGetList: (params) => client.get(API_ENDPOINTS.PRODUCTS_LIST, { params }),
  adminApprove: (id) => client.patch(API_ENDPOINTS.PRODUCT_UPDATE.replace(':id', id), { status: 'approved' }),
  adminReject: (id, reason) => client.patch(API_ENDPOINTS.PRODUCT_UPDATE.replace(':id', id), { status: 'rejected', reason }),
};
