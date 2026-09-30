import client from '../client';
import { API_ENDPOINTS } from '../config';

export const userAPI = {
  getProfile: (id) => client.get(API_ENDPOINTS.USER_PROFILE.replace(':id', id)),
  updateProfile: (id, data) => client.patch(API_ENDPOINTS.USER_UPDATE_PROFILE.replace(':id', id), data),
  deleteProfile: (id) => client.delete(API_ENDPOINTS.USER_DELETE_PROFILE.replace(':id', id)),
  changePassword: (id, data) => client.patch(API_ENDPOINTS.USER_CHANGE_PASSWORD.replace(':id', id), data),
};
