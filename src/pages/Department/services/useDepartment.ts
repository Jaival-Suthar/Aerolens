// src/pages/Department/services/useDepartment.ts
import type {
  Department,
  DepartmentsResponse,
  AddDepartmentPayload,
  UpdateDepartmentPayload,
  ApiResponse,
  ErrorResponse,
} from "../types/departmentTypes";

const API_URL: string = import.meta.env.VITE_BASE_URL;
const IS_DEV = import.meta.env.DEV;

const logger = {
  //log: (...args: any[]) => IS_DEV && console.log("DEPARTMENT LOG:", ...args),
  error: (...args: any[]) => console.error("DEPARTMENT ERROR:", ...args),
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
/*  GLOBAL API FETCH HELPER                                                  */
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
    const response = await fetch(url, { ...options, headers, credentials: "include" });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}) – ${errorText || response.statusText}`);
    }

    if (response.status === 204) return {} as T;
    const data = await response.json();
    return (data.data ?? data) as T;
  } catch (error) {
    logger.error("Network/API failure:", error);
    throw error;
  }
}

/* ========================================================================= */
/*  CRUD OPERATIONS                                                          */
/* ========================================================================= */

// -------------------- GET DEPARTMENTS --------------------
export const getDepartments = async (
  accessToken: string | null,
  clientId: number
): Promise<DepartmentsResponse> => {
  try {
    const endpoint = `/client/${clientId}`;
    const response = await apiFetch<DepartmentsResponse>(
      endpoint,
      { method: "GET" },
      accessToken || undefined
    );

    return response;
  } catch (error) {
    logger.error("Error in getDepartments:", error);
    throw error;
  }
};

// -------------------- ADD DEPARTMENT --------------------
export const addDepartment = async (
  accessToken: string | null,
  payload: AddDepartmentPayload
): Promise<ApiResponse<Department>> => {
  try {
    return await apiFetch<ApiResponse<Department>>(
      `/department`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      accessToken || undefined
    );
  } catch (error) {
    logger.error("Error in addDepartment:", error);
    throw error;
  }
};

// -------------------- UPDATE DEPARTMENT --------------------
export const updateDepartment = async (
  accessToken: string | null,
  payload: UpdateDepartmentPayload
): Promise<ApiResponse<Department>> => {
  try {
    const { departmentId, departmentName, departmentDescription } = payload;

    const updateBody: Partial<Omit<Department, "departmentId">> = {};
    if (departmentName) updateBody.departmentName = departmentName;
    if (departmentDescription) updateBody.departmentDescription = departmentDescription;

    if (!departmentName && !departmentDescription) {
      throw new Error("At least one field required for update");
    }
    return await apiFetch<ApiResponse<Department>>(
      `/department/${departmentId}`,
      {
        method: "PATCH",
        body: JSON.stringify(updateBody),
      },
      accessToken || undefined
    );
  } catch (error) {
    logger.error("Error in updateDepartment:", error);
    throw error;
  }
};

// -------------------- DELETE DEPARTMENT --------------------
export const deleteDepartment = async (
  accessToken: string | null,
  id: number
): Promise<void> => {
  try {
    if (!id || typeof id !== "number") throw new Error("Valid department ID required");

    await apiFetch(`/department/${id}`, { method: "DELETE" }, accessToken || undefined);
  } catch (error) {
    logger.error("Error in deleteDepartment:", error);
    throw error;
  }
};
