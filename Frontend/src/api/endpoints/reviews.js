import client from '../client';
import { API_ENDPOINTS } from '../config';

export const reviewsAPI = {
  getByUser: () => client.get(API_ENDPOINTS.REVIEWS_LIST),
  getByProduct: (id) => client.get(API_ENDPOINTS.PRODUCT_REVIEWS.replace(':id', id)),
  create: (id, data) => client.post(API_ENDPOINTS.REVIEW_CREATE.replace(':id', id), data),
  delete: (id) => client.delete(API_ENDPOINTS.REVIEW_DELETE.replace(':id', id)),
};
