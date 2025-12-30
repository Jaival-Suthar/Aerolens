// Candidate model
export interface Candidate {
  candidateId: number;
  candidateName: string;
  contactNumber: string;
  email: string;

  recruiterId: number | null;        // Editable
  recruiterName: string | null;      // Editable
  recruiterContact: string | null;   // Read-only from backend
  recruiterEmail: string | null;     // Read-only from backend

  jobRole: string;

  preferredJobLocation: {
    city: string;
    country: string;
  } | null;

  currentCTC: number;
  expectedCTC: number;
  noticePeriod: number;
  experienceYears: number;
  statusName: string;

  linkedinProfileUrl?: string | null;

  resumeFilename?: string | null;
  resumeOriginalName?: string | null;
  resumeUploadDate?: string | null;

  notes?: string;
}



/* ------------------ UPDATE PAYLOAD ------------------ */
export interface CandidateUpdatePayload {
  candidateName?: string;
  contactNumber?: string;
  email?: string;

  recruiterId?: number | null;
  recruiterName?: string | null;

  jobRole?: string;

  preferredJobLocation?: {
    city: string;
    country: string;
  };

  currentCTC?: number;
  expectedCTC?: number;
  noticePeriod?: number;
  experienceYears?: number;

  statusName?: string;
  linkedinProfileUrl?: string;
  notes?: string;
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

  recruiterId: number | null;
  recruiterName: string | null;

  jobRole: string;

  preferredJobLocation?: {
    city: string;
    country: string;
  };

  currentCTC: number;
  expectedCTC: number;
  noticePeriod: number;
  experienceYears: number;

  statusName: string;
  linkedinProfileUrl?: string;

  resumeFile: File | null;
  notes?: string;
}


/* ------------------ API RESPONSE ------------------ */
export interface CandidatesApiResponse {
  candidates: Candidate[];
  totalCount?: number;
}

/* ------------------ LOOKUP TYPES ------------------ */
export interface RecruiterItem {
  recruiterId: number;
  recruiterName: string;
}

export interface StatusItem {
  statusId: number;
  statusName: string;
}

export interface LocationItem {
  locationId: number;
  city: string;
  country: string;
  state: string;
}

export interface CandidateCreateData {
  recruiters: RecruiterItem[];
  status: StatusItem[];
  locations: LocationItem[];
}
