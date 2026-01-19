// useSignup.ts
import {
  SignupFormData,
  SignupResponse,
  MemberCreateDataResponse,
} from "../types/signuptypes";
import { ApiError } from "../../../types/apiError";

const API_URL = import.meta.env.VITE_BASE_URL;

// -----------------------------
// Helpers
// -----------------------------
const makeHeaders = (accessToken?: string): HeadersInit => {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  return headers;
};

const parseJsonSafely = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    throw {
      success: false,
      error: "INVALID_RESPONSE",
      message: "Invalid server response",
    } satisfies ApiError;
  }
};

// -----------------------------
// Register User
// -----------------------------
export const registerUser = async (
  formData: SignupFormData,
  accessToken: string
): Promise<SignupResponse> => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: makeHeaders(accessToken),
    credentials: "include",
    body: JSON.stringify({
      memberName: formData.fullName,
      memberContact: formData.contactNumber,
      email: formData.email,
      password: formData.password,
      designationId: formData.designationId,
      vendorId: formData.vendorId ?? null,
      isRecruiter: formData.isRecruiter,
      isInterviewer: formData.isInterviewer,
    }),
  });

  const data = await parseJsonSafely(response);

  // ❌ HTTP error OR business error
  if (!response.ok || data.success === false) {
    throw {
      success: false,
      error: data.error || "REQUEST_FAILED",
      message: data.message || "Registration failed",
      details: data.details,
    } satisfies ApiError;
  }

  return data as SignupResponse;
};

// -----------------------------
// Fetch Member Create Data
// -----------------------------
export const fetchMemberCreateData = async (
  accessToken: string
): Promise<MemberCreateDataResponse["data"]> => {
  const response = await fetch(`${API_URL}/member/create-data`, {
    method: "GET",
    headers: makeHeaders(accessToken),
    credentials: "include",
  });

  const data = await parseJsonSafely(response);

  if (!response.ok || data.success === false) {
    throw {
      success: false,
      error: data.error || "REQUEST_FAILED",
      message: data.message || "Failed to load form data",
    } satisfies ApiError;
  }

  return data.data;
};
