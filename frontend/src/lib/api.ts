// src/lib/api.ts
/*
 * Configures and provides and instance to make constant API calls
 * It includes :
 * - baseURL: https://api.example.com
 * - withCredentials: true -> if auth enabled, cookies are sent with requests
 * - response interceptors:
 *   > Detects 401 responses (expired access token)
 *   > Ensures only one refresh call runs at a time.
 *   > Queues other failed requests while refresh is in progress.
 *   > Retries the original request once refresh succeeds; otherwise it rejects all queued ones.
 *
 *
 * How to use:
 * import api from 'path/to/api';
 * api.get('/endpoint')
 * api.post('/endpoint', data) --> /api/endpoint --> https://api.example.com/endpoint
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Create a single Axios client for the app.
const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

// ----------------------------------------------
// Refresh coordination state
// ----------------------------------------------
let isRefreshing = false; // prevents multiple concurrent refresh requests.
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}[] = [];

//Flushes the queue: if refresh failed, reject all; if succeeded, resolve all.
const processQueue = (error: unknown) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

api.interceptors.response.use(
  //Pass-through on success.
  (response) => response,
  async (err: AxiosError) => {
    // Keep a reference to the failed request; you’ll retry it later.
    const originalReq = err.config as InternalAxiosRequestConfig & {
      _retry?: boolean; // custom flag to avoid infinit loops
    };

    const url = originalReq?.url || "";

    // 🟣 UPDATED: do NOT try to refresh for logout endpoints
    const isLogoutCall =
      url.includes("/auth/logout") || url.includes("/auth/logout-all");

    //Only act on first 401 for this request.
    //Don’t react if the failing call is the refresh endpoint itself (avoid loops).
    if (
      err.response?.status === 401 &&
      !originalReq._retry &&
      !originalReq.url?.includes("/auth/refresh") &&
      !isLogoutCall
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          //Return a Promise that resolves after processQueue runs
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalReq));
      }

      originalReq._retry = true;
      isRefreshing = true;

      return new Promise(async (resolve, reject) => {
        try {
          await api.post("/auth/refresh"); // cookies sent automatically
          processQueue(null);
          resolve(api(originalReq)); // retry original
        } catch (error) {
          processQueue(error);
          reject(error);
        } finally {
          isRefreshing = false;
        }
      });
    }
    return Promise.reject(err); //For non-401 (or disallowed) errors, just reject.
  },
);

export default api;
