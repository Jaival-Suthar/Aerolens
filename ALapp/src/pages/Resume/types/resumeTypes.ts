// src/Resume/types/resumeTypes.ts

// Candidate model
export interface Candidate {
    id: number;
    name: string;
    contact: string;
    email: string;
    recruiter: string;
    role: string;
    location: string;
    ctc: string;
    noticePeriod: string;
    experience: string;
    status: string;
    linkedin: string;
  }
  export interface ResumeTableProps {
    candidateId: number | null;
   candidateName: string;
    onBackClick: () => void;
  }
  // Generic API wrapper
  export interface ApiResponse<T> {
    data: T;
    message?: string;
  }
  
  // Error response from backend
  export interface ErrorResponse {
    message: string;
  }
  
  // Response for fetching candidates
  export interface CandidatesResponse {
    candidates: Candidate[];
  }
  
  // Payload for adding a new candidate
  export interface AddCandidatePayload {
    name: string;
    contact: string;
    email: string;
    recruiter: string;
    role: string;
    location: string;
    ctc: string;
    noticePeriod: string;
    experience: string;
    status: string;
    linkedin: string;
  }
  
  // Payload for updating a candidate
  export interface UpdateCandidatePayload {
    id: number;
    name?: string;
    contact?: string;
    email?: string;
    recruiter?: string;
    role?: string;
    location?: string;
    ctc?: string;
    noticePeriod?: string;
    experience?: string;
    status?: string;
    linkedin?: string;
  }
  