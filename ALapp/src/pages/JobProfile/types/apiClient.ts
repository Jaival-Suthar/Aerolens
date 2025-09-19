// // src/services/apiClient.ts
// import axios, { type AxiosInstance, type AxiosResponse } from "axios";

// // Define a reusable generic API response type
// export interface ApiResponse<T> {
//   success: boolean;
//   message?: string;
//   data: T;
// }

// export interface PaginatedResponse<T> {
//   success: boolean;
//   message?: string;
//   data: T[];
//   page: number;
//   pageSize: number;
//   total: number;
// }

// const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:4000/api";
// const TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 10000;

// const apiClient: AxiosInstance = axios.create({
//   baseURL: BASE_URL,
//   timeout: TIMEOUT,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Response interceptor with typing
// apiClient.interceptors.response.use(
//   (response: AxiosResponse): AxiosResponse => response,
//   (error: unknown) => {
//     return Promise.reject(normalizeError(error));
//   }
// );

// function normalizeError(error: unknown): Error {
//   if (axios.isAxiosError(error)) {
//     const status = error.response?.status;
//     const message = error.response?.data?.message || error.message;
//     return new Error(`API Error [${status}]: ${message}`);
//   }
//   if (error instanceof Error) return error;
//   return new Error("An unknown error occurred");
// }

// export default apiClient;