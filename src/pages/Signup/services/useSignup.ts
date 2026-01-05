import { SignupFormData, SignupResponse, MemberCreateDataResponse } from "../types/signuptypes";
const API_URL = import.meta.env.VITE_BASE_URL;
import { normalizeApiError } from "../../../utils/apiErrorHandler";
import { ApiError } from "../../../types/apiError";
// Helper to create headers with token if provided
const makeHeaders = (accessToken?: string): HeadersInit => {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  return headers;
};

// Register User 
export const registerUser = async (
  formData: SignupFormData,
  accessToken: string 
): Promise<SignupResponse> => {
  try {
    const headers = makeHeaders(accessToken);

    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers,
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

    // ✅ Use shared error handler
    if (!response.ok) {
      const error = await normalizeApiError(response);
      throw error; // Pass backend error as-is
    }

    const data = await response.json();
    return data as SignupResponse;
    
  } catch (error: any) {
    throw error; // Re-throw to preserve error structure
  }
};

// Fetch Designations (with verbose logs)
export const fetchMemberCreateData = async (
  accessToken: string
): Promise<MemberCreateDataResponse["data"]> => {
  const headers = makeHeaders(accessToken);

  const response = await fetch(`${API_URL}/member/create-data`, {
    method: "GET",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const error = await normalizeApiError(response);
    throw error;
  }

  const result = await response.json();
  return result.data;
};