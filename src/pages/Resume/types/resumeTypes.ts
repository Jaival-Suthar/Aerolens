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

  // ---------- NEW FIELDS ----------
  recruiterPhoneNumber: string; // Added for recruiter contact
  recruiterEmail: string;       // Added for recruiter email
  notes?: string;                // Optional internal notes
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

  // ---------- NEW FIELDS ----------
  recruiterPhoneNumber: string;
  recruiterEmail: string;
  notes: string;
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

  // ---------- NEW FIELDS ----------
  recruiterPhoneNumber: string;
  recruiterEmail: string;
  notes?: string;
}

/* ------------------ API RESPONSE ------------------ */
export interface CandidatesApiResponse {
  candidates: Candidate[];
  totalCount?: number;
}
