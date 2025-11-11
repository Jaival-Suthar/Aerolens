import { SignupFormData, SignupResponse } from "../types/signuptypes";
const API_URL = import.meta.env.VITE_BASE_URL;

// Helper to create headers with token if provided
const makeHeaders = (accessToken?: string) => {
  console.log("════════════════════════════════════");
  console.log("🔧 makeHeaders() RECEIVED:");
  console.log("accessToken:", accessToken);
  console.log("accessToken type:", typeof accessToken);
  console.log("Will add Authorization?", !!accessToken);
  console.log("════════════════════════════════════");
  
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
    console.log("✅ Authorization header ADDED");
  } else {
    console.log("❌ Authorization header NOT ADDED (accessToken is falsy)");
  }
  
  console.log("Final headers:", headers);
  console.log("════════════════════════════════════");
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
  console.log("════════════════════════════════════");
  console.log("📥 registerUser() RECEIVED:");
  console.log("accessToken parameter:", accessToken);
  console.log("accessToken type:", typeof accessToken);
  console.log("accessToken is null?", accessToken === null);
  console.log("accessToken is undefined?", accessToken === undefined);
  console.log("accessToken truthy?", !!accessToken);
  console.log("════════════════════════════════════");

  try {
    const payload = {
      memberName: formData.fullName,
      memberContact: formData.contactNumber,
      email: formData.email,
      password: formData.password ? "[REDACTED]" : undefined, // avoid logging plain password
      designation: formData.designation,
      isRecruiter: formData.isRecruiter,
    };

    console.log("[registerUser] payload (safe):", {
      memberName: payload.memberName,
      memberContact: payload.memberContact,
      email: payload.email,
      designation: payload.designation,
      isRecruiter: payload.isRecruiter,
    });

    const headers = makeHeaders(accessToken || undefined);
    console.log("[registerUser] request headers:", {
      ...headers,
      // mask Authorization if present
      Authorization: headers["Authorization"] ? `Bearer ${maskToken(accessToken)}` : undefined,
    });

    console.log("[registerUser] calling:", `${API_URL}/auth/register`);

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

    console.log("[registerUser] fetch completed", {
      status: response.status,
      ok: response.ok,
      url: response.url,
      elapsed_ms: Date.now() - start,
    });

    // try to parse body safely
    let data: any = null;
    try {
      data = await response.clone().json();
      console.log("[registerUser] response JSON:", data);
    } catch (parseErr) {
      const text = await response.clone().text().catch(() => "<unreadable>");
      console.log("[registerUser] response not JSON, text:", text);
      data = { rawText: text };
    }

    if (!response.ok) {
      // Handle validation error format
      if (data && data.error === "VALIDATION_ERROR" && Array.isArray(data.details)) {
        const fieldErrors = data.details
          .map((d: { field: string; message: string }) => `${d.field}: ${d.message}`)
          .join(", ");
        console.error("[registerUser] validation failed:", fieldErrors);
        throw new Error(fieldErrors || data.message || "Validation failed");
      }

      console.error("[registerUser] register failed:", data || response.statusText);
      throw new Error(data?.message || `Registration failed: ${response.status}`);
    }

    console.log("[registerUser] success, elapsed_ms:", Date.now() - start);
    return data as SignupResponse;
  } catch (error: any) {
    console.error("[registerUser] caught error:", {
      message: error?.message ?? error,
      stack: error?.stack,
      elapsed_ms: Date.now() - start,
    });
    throw error;
  }
};

// Fetch Designations (with verbose logs)
export const fetchDesignations = async (
  accessToken: string | null
): Promise<string[]> => {
  const start = Date.now();
  console.log("[fetchDesignations] start", { time: new Date().toISOString() });
  console.log("[fetchDesignations] maskedAccessToken:", maskToken(accessToken));

  try {
    const headers = makeHeaders(accessToken || undefined);
    console.log("[fetchDesignations] request headers:", {
      ...headers,
      Authorization: headers["Authorization"] ? `Bearer ${maskToken(accessToken)}` : undefined,
    });

    const url = `${API_URL}/lookup?page=1&limit=100`;
    console.log("[fetchDesignations] calling:", url);

    const response = await fetch(url, {
      method: "GET",
      headers,
      credentials: "include",
    });

    console.log("[fetchDesignations] fetch completed", {
      status: response.status,
      ok: response.ok,
      url: response.url,
      elapsed_ms: Date.now() - start,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "<unreadable>");
      console.error("[fetchDesignations] failed response:", { status: response.status, text });
      throw new Error(`Failed to fetch designations: ${response.status} - ${text}`);
    }

    const result = await response.json();
    console.log("[fetchDesignations] response JSON:", result);

    const designations = (result.data || [])
      .filter((item: any) => item.tag === "designation")
      .map((item: any) => item.value);

    console.log("[fetchDesignations] parsed designations:", designations, "elapsed_ms:", Date.now() - start);
    return designations;
  } catch (error: any) {
    console.error("[fetchDesignations] caught error:", {
      message: error?.message ?? error,
      stack: error?.stack,
      elapsed_ms: Date.now() - start,
    });
    throw error;
  }
};
