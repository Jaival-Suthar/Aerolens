// src/pages/Department/services/useDepartment.ts
import type {
  Department,
  DepartmentsResponse,
  AddDepartmentPayload,
  UpdateDepartmentPayload,
  ApiResponse,
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

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  // 🔥 IMPORTANT: let backend speak
  if (!response.ok) {
    const error = await response.json();
    throw error; // <-- pass backend error as-is
  }

  if (response.status === 204) return {} as T;

  const data = await response.json();
  return (data.data ?? data) as T;
}

/* ========================================================================= */
/*  CRUD OPERATIONS                                                          */
/* ========================================================================= */

// -------------------- GET DEPARTMENTS --------------------
export const getDepartments = async (
  accessToken: string | null,
  clientId: number
): Promise<DepartmentsResponse> => {
  return apiFetch<DepartmentsResponse>(
    `/client/${clientId}`,
    { method: "GET" },
    accessToken || undefined
  );
};

// -------------------- ADD DEPARTMENT --------------------
export const addDepartment = async (
  accessToken: string | null,
  payload: AddDepartmentPayload
): Promise<ApiResponse<Department>> => {
  return apiFetch<ApiResponse<Department>>(
    "/department",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    accessToken || undefined
  );
};


// -------------------- UPDATE DEPARTMENT --------------------
export const updateDepartment = async (
  accessToken: string | null,
  payload: UpdateDepartmentPayload
): Promise<ApiResponse<Department>> => {
  const { departmentId, departmentName, departmentDescription } = payload;

  const updateBody: Partial<Omit<Department, "departmentId">> = {
    departmentName,
    departmentDescription,
  };

  return apiFetch<ApiResponse<Department>>(
    `/department/${departmentId}`,
    {
      method: "PATCH",
   
   body: JSON.stringify(updateBody),
    },
    accessToken || undefined
  );
};
// -------------------- DELETE DEPARTMENT --------------------
export const deleteDepartment = async (
  accessToken: string | null,
  id: number
): Promise<ApiResponse<null>> => {
  return apiFetch<ApiResponse<null>>(
    `/department/${id}`,
    { method: "DELETE" },
    accessToken || undefined
  );
};

// -------------------- GET DELETED DEPARTMENTS --------------------
export const getDeletedDepartments = async (
  accessToken: string | null,
  clientId: number
): Promise<any> => {
  return apiFetch<any>(
    `/department/client/${clientId}/deleted`,
    { method: "GET" },
    accessToken || undefined
  );
};

// -------------------- RESTORE DEPARTMENT --------------------
export const restoreDepartment = async (
  accessToken: string | null,
  departmentId: number
): Promise<any> => {
  return apiFetch<any>(
    `/department/${departmentId}/restore`,
    { method: "PATCH" },
    accessToken || undefined
  );
};

