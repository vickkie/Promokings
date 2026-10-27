import axios from "axios";
import { BACKEND_PORT } from "@env";

// Re-export the default axios instance so auth defaults and interceptors
// registered by AuthContext apply to every caller, migrated or not.
export const api = axios;

export const apiUrl = (path) => `${BACKEND_PORT}/api/${path}`;

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

export default api;
