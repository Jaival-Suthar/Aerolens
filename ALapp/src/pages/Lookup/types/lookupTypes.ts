// CORE ENTITY
export interface LookupEntry {
  tag: string;
  lookupKey: number;
  value: string;
}

// PAGINATION META (for list responses)
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

// VALIDATION ERROR (for POST, others)
export interface ValidationError {
  field: string
  message: string
}

export interface LookupApiResponse {
  success: boolean;
  message: string;
  data?: LookupEntry[] | LookupEntry;
  meta?: PaginationMeta;
}
