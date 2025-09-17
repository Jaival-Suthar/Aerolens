// src/Resume/types/resumeTypes.ts
// Candidate model
//used for adding client in resumeAddEdit.tsx
export interface Candidate {
  candidateId: number;
  candidateName: string;
  contactNumber: string;
  email: string;
  recruiterName: string;
  jobRole: string;
  preferredJobLocation: string;
  currentCTC: number;
  expectedCTC: number;
  noticePeriod: number;
  experienceYears: number;
  status: string;
  linkedinProfileUrl: string;
}

  // export interface ApiResponse<T> {
  //   data: T;
  //   message?: string;
  // }
  
  // Error response from backend
  export interface ErrorResponse {
    message: string;
  }
  
  // Response for fetching candidates
  export interface CandidatesResponse {
    candidates: Candidate[];
  }
  
// Props for ResumeAddEdit component
export interface ResumeAddEditProps {
  visible: boolean;
  onHide: () => void;
  selectedResume: Candidate | null;
  //A Candidate object – which has all the properties defined in your Candidate interface (like candidateId, candidateName, email, etc.)
// null – meaning there is no candidate currently selected (for example, when adding a new resume instead of editing an existing one).
//   candidateId: number;
  onSuccess: () => void;
}

  // Payload for adding a new candidate
  export interface AddCandidate {
    candidateName: string;
    contactNumber: string;
    email: string;
    recruiterName: string;
    jobRole: string;
    preferredJobLocation: string;
    currentCTC: number;
    expectedCTC: number;
    noticePeriod: number;
    experienceYears: number;
    status: string;
    linkedinProfileUrl: string;
  }
  
  // Payload for updating a candidate
  export interface UpdateCandidate {
    candidateId: number;
    candidateName: string;
    contactNumber: string;

    email: string;
    recruiterName: string;
    jobRole: string;
    preferredJobLocation: string;
    currentCTC: number;
    expectedCTC: number;
    noticePeriod: number;
    experienceYears: number;
    status: string;
    linkedinProfileUrl: string;
  }
   export interface ResumeDeleteProps {
    visible: boolean;
    onHide: () => void;
    selectedResume: Candidate | null;
    onSuccess: () => void;
    onClearSelection: () => void;
  }
  