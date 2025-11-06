import { SignupFormData, SignupResponse } from "../types/signuptypes";
const API_BASE_URL = import.meta.env.VITE_BASE_URL;

export const registerUser = async (
  formData: SignupFormData
): Promise<SignupResponse> => {
  try {
    const payload = {
      memberName: formData.fullName,
      memberContact: formData.contactNumber,
      email: formData.email,
      password: formData.password,
      designation: formData.designation,
      isRecruiter: formData.isRecruiter,
    };

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Registration failed");
    }

    const data: SignupResponse = await response.json();
    console.log("Registration successful:", data);
    return data;
  } catch (error: any) {
    console.error("Registration failed:", error.message);
    throw new Error(error.message || "Registration failed");
  }
};

// ✅ Updated to accept token for Authorization
export const fetchDesignations = async (token: string): Promise<string[]> => {
  const response = await fetch(`${API_BASE_URL}/lookup?page=1&limit=100`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch designations: ${response.status} - ${text}`);
  }

  const result = await response.json();

  // Extract only entries where tag === 'designation'
  const designations = result.data
    .filter((item: any) => item.tag === "designation")
    .map((item: any) => item.value);

  return designations;
};
