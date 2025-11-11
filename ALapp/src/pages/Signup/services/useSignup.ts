import { SignupFormData, SignupResponse } from "../types/signuptypes";
const API_URL = import.meta.env.VITE_BASE_URL;

// Helper to create headers with token if provided
const makeHeaders = (accessToken?: string) => {
  
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  } else {
  }
  return headers;
};

// Helper to mask token for safe logging
const maskToken = (token?: string | null) => {
  if (!token) return "no-token";
  const t = token as string;
  if (t.length <= 10) return "****" + t.slice(-4);
  return `${t.slice(0, 6)}...${t.slice(-4)}`;
};

// Register User (with verbose logs)
export const registerUser = async (
  formData: SignupFormData,
  accessToken?: string | null
): Promise<SignupResponse> => {
  const start = Date.now();

  try {
    const payload = {
      memberName: formData.fullName,
      memberContact: formData.contactNumber,
      email: formData.email,
      password: formData.password ? "[REDACTED]" : undefined, // avoid logging plain password
      designation: formData.designation,
      isRecruiter: formData.isRecruiter,
    };

    const headers = makeHeaders(accessToken || undefined);

    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({
        memberName: formData.fullName,
        memberContact: formData.contactNumber,
        email: formData.email,
        password: formData.password, // send actual password in body to API
        designation: formData.designation,
        isRecruiter: formData.isRecruiter,
      }),
    });

    // try to parse body safely
    let data: any = null;
    try {
      data = await response.clone().json();
    } catch (parseErr) {
      const text = await response.clone().text().catch(() => "<unreadable>");
      data = { rawText: text };
    }

    if (!response.ok) {
      // Handle validation error format
      if (data && data.error === "VALIDATION_ERROR" && Array.isArray(data.details)) {
        const fieldErrors = data.details
          .map((d: { field: string; message: string }) => `${d.field}: ${d.message}`)
          .join(", ");
        throw new Error(fieldErrors || data.message || "Validation failed");
      }

      throw new Error(data?.message || `Registration failed: ${response.status}`);
    }

   
    return data as SignupResponse;
  } catch (error: any) {
    throw error;
  }
};

// Fetch Designations (with verbose logs)
export const fetchDesignations = async (
  accessToken: string | null
): Promise<string[]> => {
  const start = Date.now();

  try {
    const headers = makeHeaders(accessToken || undefined);


    const url = `${API_URL}/lookup?page=1&limit=100`;
 

    const response = await fetch(url, {
      method: "GET",
      headers,
      credentials: "include",
    });

    

    if (!response.ok) {
      const text = await response.text().catch(() => "<unreadable>");
     
      throw new Error(`Failed to fetch designations: ${response.status} - ${text}`);
    }

    const result = await response.json();
    

    const designations = (result.data || [])
      .filter((item: any) => item.tag === "designation")
      .map((item: any) => item.value);

   
    return designations;
  } catch (error: any) {
    throw error;
  }
};
