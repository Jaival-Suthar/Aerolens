export interface Location {
  city: string;
  state?: string;
  country: string;
}

export interface Member {
  memberId: number;
  memberName: string;
  memberContact: string;
  email: string;
  designation: string;

  isRecruiter: boolean;

  isActive: boolean;

  lastLogin: string | null;
  createdAt: string | null;
  updatedAt: string | null;

  location: Location;

  clientName: string;
  organisation: string;

  isInterviewer: boolean;
  interviewerCapacity: number;

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

// Add these interfaces to your existing memberTypes.ts file

export interface ClientOption {
  clientId: number;
  clientName: string;
  departments: Array<{
    departmentId: number;
    departmentName: string;
  }>;
}

export interface MemberPatchPayload {
  memberName: string;
  memberContact: string;
  email: string;
  designation: string;
  clientId?: number;
  organisation: string;
  isRecruiter: boolean;
  isInterviewer: boolean;
  interviewerCapacity: number;
  location: {
    city: string;
    country: string;
  };
  skills: Array<{
    skillName: string;
    proficiencyLevel: string;
    yearsOfExperience: number;
  }>;
}