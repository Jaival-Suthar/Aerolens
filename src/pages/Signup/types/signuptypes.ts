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

export interface SignupResponse {
  success: boolean;
  message: string;
}

export interface MemberCreateDataResponse {
  success: boolean;
  message: string;
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

