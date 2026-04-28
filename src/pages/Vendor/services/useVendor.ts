import type {
  VendorType,
  CreateVendorPayload,
  UpdateVendorPayload,
  ApiResponse,
  VendorDeletedResponse
} from "../types/vendorTypes";
// //         <SearchButton
//   value={globalFilterValue}   // use state instead of filters.global
//   onChange={onGlobalFilterChange} // update both input and datatable filter
//   placeholder="Search vendors..."
// />

/* ------------------------------------------------------------------------- */
/*  CONFIG                                                                   */
/* ------------------------------------------------------------------------- */
const API_BASE_URL: string = import.meta.env.VITE_BASE_URL;

const ROUTES = {
  BASE: "/vendor",
  BY_ID: (id: number) => `/vendor/${id}`,
};

/* ------------------------------------------------------------------------- */
/*  LOGGER                                                                   */
/* ------------------------------------------------------------------------- */
const logger = {
  error: (...args: any[]) => console.error("VENDOR ERROR:", ...args),
};

/* ------------------------------------------------------------------------- */
/*  HEADER BUILDER                                                           */
/* ------------------------------------------------------------------------- */
const makeHeaders = (accessToken?: string, isFormData = false): HeadersInit => {
  const headers: HeadersInit = {};
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  return headers;
};

/* ------------------------------------------------------------------------- */
/*  API FETCH WRAPPER                                                        */
/* ------------------------------------------------------------------------- */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  accessToken?: string
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers);

  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const isFormData = options.body instanceof FormData;
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      const errorBody = contentType?.includes("application/json")
        ? await response.json()
        : { message: await response.text() };

      // 🔐 Auth expiry is handled centrally
      if (response.status === 401 && errorBody?.error === "TOKEN_EXPIRED") {
        // Trigger global auth handling here
        // logout(), refresh flow, redirect, etc.

        throw errorBody; // ✅ preserve backend message
      }

      throw errorBody;
    }


    if (response.status === 204) return {} as T; // No Content
    const data = await response.json();
    return data as T;
  } catch (error) {
    logger.error("Network/API failure:", error);
    throw error;
  }
}

/* ------------------------------------------------------------------------- */
/*  VENDOR SERVICE (TOKEN-EXPLICIT)                                         */
/* ------------------------------------------------------------------------- */
export const VendorService = {
  // -------------------- GET ALL --------------------
  getAllVendors: (token: string): Promise<ApiResponse<VendorType[]>> =>
  apiFetch<ApiResponse<VendorType[]>>(ROUTES.BASE, { method: "GET" }, token),

  // -------------------- CREATE --------------------
  createVendor: (
  token: string,
  vendor: CreateVendorPayload
): Promise<ApiResponse<VendorType>> =>
  apiFetch<ApiResponse<VendorType>>(
    ROUTES.BASE,
    { method: "POST", body: JSON.stringify(vendor) },
    token
  ),


  // -------------------- UPDATE --------------------
 updateVendor: (
  token: string,
  vendorId: number,
  vendor: UpdateVendorPayload
): Promise<ApiResponse<VendorType>> =>
  apiFetch<ApiResponse<VendorType>>(
    ROUTES.BY_ID(vendorId),
    { method: "PATCH", body: JSON.stringify(vendor) },
    token
  ),


  // -------------------- DELETE --------------------
 deleteVendor: (
  token: string,
  vendorId: number
): Promise<ApiResponse<null>> =>
  apiFetch<ApiResponse<null>>(
    ROUTES.BY_ID(vendorId),
    { method: "DELETE" },
    token
  ),

  getDeletedVendors: (token: string): Promise<VendorDeletedResponse> =>
    apiFetch<VendorDeletedResponse>(
      `${ROUTES.BASE}/deletions`,
      { method: "GET" },
      token
    ),

  restoreVendor: (vendorId: number, token: string): Promise<any> =>
    apiFetch<any>(
      `${ROUTES.BASE}/${vendorId}/restore`,
      { method: "PATCH" },
      token
    ),

};
