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
  statusName: string;
  linkedinProfileUrl: string;
}

  
  
  // Response for fetching candidates

  export interface ResumeDeleteProps {
    visible: boolean;
    onHide: () => void;
    selectedResume: Candidate | null;
    onSuccess: () => void;
    onClearSelection: () => void;
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
  export interface AddEditCandidate {
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
    statusName: string;
    linkedinProfileUrl: string;
  }
  
  