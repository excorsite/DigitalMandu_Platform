import client from "../client";
import { API_ENDPOINTS } from "../config";

export const recommendationsAPI = {
  getRecommendations: (params) =>
    client.get(API_ENDPOINTS.RECOMMENDATIONS_LIST, { params }),
};
