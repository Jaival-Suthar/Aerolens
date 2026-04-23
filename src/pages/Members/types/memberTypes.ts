export interface MemberLocation {
  city: string;
  country: string;
}

export interface MemberApi {
  memberId: number;
  memberName: string;
  memberContact: string;
  email: string;

  designationId: number;
  designation: string;

  isRecruiter: boolean;
  isInterviewer: boolean;
  interviewerCapacity: number | null;

  vendorId?: number | null;
  vendorName?: string | null;

  clientId: number | null;
  clientName?: string | null;
  organisation: string;

  city: string;
  country: string;

  skills: {
    skillId: number;
    skillName: string;
    proficiencyLevel: string;
    yearsOfExperience: number;
  }[];

  isActive: boolean;
  lastLogin: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface Member {
  memberId: number;
  memberName: string;
  memberContact: string;
  email: string;

  designationId: number;
  designation: string;

  isRecruiter: boolean;
  isInterviewer: boolean;
  interviewerCapacity: number | null;

  vendorId?: number | null;
  vendorName?: string | null;

  clientId: number | null;
  clientName?: string | null;
  organisation: string;

  location: MemberLocation;

  skills: {
    skillId: number;
    skillName: string;
    proficiencyLevel: string;
    yearsOfExperience: number;
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ClientOption {
  clientId: number | null;
  clientName: string;
  departments?: Array<{
    departmentId: number;
    departmentName: string;
  }>;
}

export interface MemberPatchPayload {
  memberName: string;
  memberContact: string;
  email: string;
  designationId?: number;
  clientId?: number | null;
  organisation?: string;
  isRecruiter?: boolean;
  isInterviewer?: boolean;
  interviewerCapacity?: number | null;
  vendorId?: number | null;
  location: MemberLocation;
  skills?: Array<{
    skillName: string;
    proficiencyLevel: string;
    yearsOfExperience: number;
  }>;
}

export interface MemberFormData {
  designations: { lookupKey: number; value: string }[];
  vendors: { vendorId: number; vendorName: string }[];
  clients: { clientId: number; clientName: string }[];
  skills: { skillId: number; skillName: string }[];
  locations: MemberLocation[];
}