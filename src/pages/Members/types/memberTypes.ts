// // ======================================
// // Member API Types (Frontend)
// // ======================================

// // ----------- Skill Types -----------
// export interface MemberSkill {
//     skillId: number;                  // DB ID for skill
//     skillName: string;                // Human-readable name (GET only)
//     proficiencyLevel: string;         // "expert" | "advanced" | "intermediate" | "beginner"
//     yearsOfExperience: number;
// }

// // ----------- Location Type -----------
// export interface MemberLocation {
//     cityName: string;
//     country: string;
// }

// // ----------- Member Core Type -----------
// export interface Member {
//     memberId: number;
//     memberName: string;
//     memberContact: string;
//     email: string;

//     designationId: number;
//     designation: string;              // GET only (human-readable)

//     clientId: number;
//     clientName: string;               // GET only

//     organisation: string;

//     locationId: number;
//     location: MemberLocation;         // GET only

//     isRecruiter: boolean;
//     isInterviewer: boolean;

//     skills: MemberSkill[];

//     isActive: boolean;
//     createdAt: string;                // ISO string
//     updatedAt: string;
//     lastLogin: string | null;         // nullable
// }

// // ========================================
// // Payload Types for PATCH /members/:id
// // (Frontend → Backend request body)
// // ========================================

// export interface UpdateMemberSkillPayload {
//     skillName: string;
//     proficiencyLevel: string;
//     yearsOfExperience: number;
// }

// export interface UpdateMemberPayload {
//     memberName?: string;
//     memberContact?: string;
//     email?: string;

//     designation?: string; // human input → backend maps to designationId

//     client?: string;
//     organisation?: string;

//     isRecruiter?: boolean;
//     isInterviewer?: boolean;

//     location?: {
//         cityName: string;
//         country: string;
//     };

//     skills?: UpdateMemberSkillPayload[];
// }
export interface Location {
  city: string;
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

  skills: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
