// CORE ENTITY
export interface LocationEntry {
  locationId: number;
  city: string;
  country: string;
  state?: string;
}

// VALIDATION ERROR
export interface LocationValidationError {
  field: string;
  message: string;
}

// API RESPONSE
export interface LocationApiResponse {
  success: boolean;
  message: string;
  errorCode?: string;
  statusCode?: number;
  
  // Use union type for different response shapes
  data?: 
    | { data: LocationEntry[] }           // GET all, GET by ID
    | LocationEntry                        // CREATE, UPDATE
    | null;                                // DELETE
  
  validationErrors?: LocationValidationError[];
  suggestion?: string;  // For 404 errors on UPDATE
}
