import client from '../client';
import { API_ENDPOINTS } from '../config';

export const authAPI = {
  login: (data) => client.post(API_ENDPOINTS.AUTH_LOGIN, data),
  register: (data) => client.post(API_ENDPOINTS.AUTH_REGISTER, data),
  forgotPassword: (data) => client.post(API_ENDPOINTS.AUTH_FORGOT, data),
  verifyOTP: (data) => client.post(API_ENDPOINTS.AUTH_VERIFY_OTP, data),
  resetPassword: (data) => client.post(API_ENDPOINTS.AUTH_RESET_PASSWORD, data),
};
