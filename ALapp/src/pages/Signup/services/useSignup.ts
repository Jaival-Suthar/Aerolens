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
