import client from '../client';
import { API_ENDPOINTS } from '../config';

export const paymentAPI = {
  initiate: (data) => client.post(API_ENDPOINTS.PAYMENT_INITIATE, data),
  verify: (data) => client.post(API_ENDPOINTS.PAYMENT_VERIFY, data),
};
