// signuptypes.ts - FIXED TO MATCH BACKEND

export interface SignupFormData {
  fullName: string;
  contactNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  designationId: number;        
  vendorId?: number | null; 
  isRecruiter: boolean;
  isInterviewer: boolean;
}

// ✅ Updated to match actual backend response
export interface SignupResponse {
  success: boolean;
  message: string;
  error?: string;        // Backend sends this on errors (e.g., "EMAIL_EXISTS")
  stack?: string;        // Backend sends stack trace
  data?: {
    member?: {
      memberId?: number;
      memberName?: string;
      memberContact?: string;
      email?: string;
      designation?: string;
      isRecruiter?: number;
      isActive?: number;
      lastLogin?: string | null;
      createdAt?: string;
      updatedAt?: string;
    };
  };
}

export interface MemberCreateDataResponse {
  success: boolean;
  message: string;
  error?: string;
  data: {
    designations: {
      designationId: number;
      designationName: string;
    }[];
    vendors: {
      vendorId: number;
      vendorName: string;
    }[];
  };
}