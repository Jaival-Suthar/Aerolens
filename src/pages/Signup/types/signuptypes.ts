export interface SignupFormData {
  fullName: string;
  contactNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  designation: string;
  vendorId?: string; // ✅ Added vendor field

  isRecruiter: boolean;
  isInterviewer: boolean;
}

export interface SignupResponse {
  success: boolean;
  message: string;
}
