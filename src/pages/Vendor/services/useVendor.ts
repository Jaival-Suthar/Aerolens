

import type {
    VendorType,
    CreateVendorPayload,
    UpdateVendorPayload,
  } from "../types/vendorTypes";
  
  import { useAuth } from "../../../shared/auth/AuthContext";
  
  
  /* ------------------------------------------------------------------------- */
  const API_URL: string = import.meta.env.VITE_BASE_URL;
  
  /* ------------------------------------------------------------------------- */
  /*  ROUTES                                                                  */
  /* ------------------------------------------------------------------------- */
  const ROUTES = {
    BASE: "/vendor",
    BY_ID: (id: number) => `/vendor/${id}`,
  };
  
  /* ------------------------------------------------------------------------- */
  /*  LOGGER                                                                  */
  /* ------------------------------------------------------------------------- */
  const logger = {
    error: (...args: any[]) => console.error("VENDOR ERROR:", ...args),
  };
  
  /* ------------------------------------------------------------------------- */
  /*  HEADER BUILDER                                                          */
  /* ------------------------------------------------------------------------- */
  const makeHeaders = (accessToken?: string, isFormData = false): HeadersInit => {
    const headers: HeadersInit = {};
    if (!isFormData) headers["Content-Type"] = "application/json";
    if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
    return headers;
  };
  
  /* ------------------------------------------------------------------------- */
  /*  API FETCH WRAPPER                                                       */
  /* ------------------------------------------------------------------------- */
  async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {},
    accessToken?: string
  ): Promise<T> {
    const url = `${API_URL}${endpoint}`;
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
        const errorText = await response.text();
        throw new Error(
          `API Error (${response.status}) – ${errorText || response.statusText}`
        );
      }
  
      if (response.status === 204) return {} as T; // No Content
      const data = await response.json();
      return (data.data ?? data) as T;
    } catch (error) {
      logger.error("Network/API failure:", error);
      throw error;
    }
  }
  
  /* ========================================================================= */
  /*  CRUD OPERATIONS                                                         */
  /* ========================================================================= */
  
  export const useVendorService = () => {
    const { accessToken } = useAuth();
  
    if (!accessToken) throw new Error("No access token available");
  
    // -------------------- GET ALL --------------------
    const getAllVendors = async (): Promise<VendorType[]> => {
      return await apiFetch<VendorType[]>(ROUTES.BASE, { method: "GET" }, accessToken);
    };
  
  // -------------------- CREATE --------------------
const createVendor = async (vendor: CreateVendorPayload): Promise<VendorType> => {
    return await apiFetch<VendorType>(
      ROUTES.BASE,
      {
        method: "POST",
        body: JSON.stringify(vendor),
      },
      accessToken
    );
  };
  
  // -------------------- UPDATE --------------------
  const updateVendor = async (
    vendorId: number,
    vendor: UpdateVendorPayload
  ): Promise<VendorType> => {
    return await apiFetch<VendorType>(
      ROUTES.BY_ID(vendorId),
      {
        method: "PATCH",
        body: JSON.stringify(vendor),
      },
      accessToken
    );
  };
  
    // -------------------- DELETE --------------------
    const deleteVendor = async (vendorId: number): Promise<void> => {
        await apiFetch<any>(ROUTES.BY_ID(vendorId), { method: "DELETE" }, accessToken);
      };
      
    return {
      getAllVendors,
      createVendor,
      updateVendor,
      deleteVendor,
    };
  };
  