export type ApiError = {
  success: false;
  error: string;
  message: string;
  details?: Record<string, any>;
};
