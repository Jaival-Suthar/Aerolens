// Candidate model
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
  linkedinProfileUrl?: string;
  resumeFilename?: string;       // File name stored in DB
  resumeOriginalName?: string;   // Original uploaded file name
  resumeUploadDate?: string;     // Upload timestamp
}

/* ------------------ UPDATE PAYLOAD ------------------ */
export interface CandidateUpdatePayload {
  candidateName?: string;
  contactNumber?: string;
  email?: string;
  recruiterName?: string;
  jobRole?: string;
  preferredJobLocation?: string;
  currentCTC?: number;
  expectedCTC?: number;
  noticePeriod?: number;
  experienceYears?: number;
  statusName?: string; // Maps to API's 'status'
  linkedinProfileUrl?: string;
}

/* ------------------ DELETE PROPS ------------------ */
export interface ResumeDeleteProps {
  visible: boolean;
  onHide: () => void;
  selectedResume: Candidate | null;
  onSuccess: () => void;
  onClearSelection: () => void;
}

/* ------------------ ADD/EDIT PROPS ------------------ */
export interface ResumeAddEditProps {
  visible: boolean;
  onHide: () => void;
  selectedResume: Candidate | null;
  onSuccess: () => void;
}

/* ------------------ ADD/EDIT PAYLOAD ------------------ */
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
  linkedinProfileUrl?: string;
  resumeFile: File | null;
}

/* ------------------ API RESPONSE ------------------ */
export interface CandidatesApiResponse {
  candidates: Candidate[];
  totalCount?: number;
}
