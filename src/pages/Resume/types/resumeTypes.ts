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

  jobProfileRequirementId: number; // Read-only from backend

  expectedLocation: {
    city: string;
    country: string;
  } | null;
  currentLocation?: {
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
  contactNumber?: string | null;
  email?: string | null;

  recruiterId?: number | null;
  recruiterName?: string | null;

  jobProfileRequirementId?: number;

  expectedLocation?: {
    city: string;
    country: string;
  } | null;
   currentLocation?: {
    city: string;
    country: string;
  } | null;

  currentCTC?: number | null;
  expectedCTC?: number | null;
  noticePeriod?: number;
  experienceYears?: number;

  linkedinProfileUrl?: string | null;
  notes?: string | null;
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
  createData: CandidateCreateData | null;
  loadingOptions: boolean;
}

/* ------------------ ADD/EDIT PAYLOAD ------------------ */
export interface AddEditCandidate {
  candidateName: string;
  contactNumber?: string;
  email?: string;

  recruiterId: number | null;
  recruiterName: string | null;

  jobProfileRequirementId: number;

  expectedLocation?: {
    city: string;
    country: string;
  } | null;
   currentLocation?: {
    city: string;
    country: string;
  } | null;

  currentCTC?: number;
  expectedCTC?: number;
  noticePeriod: number;
  experienceYears: number;
  linkedinProfileUrl?: string;

  resumeFile: File | null;
  notes?: string;
}
// API PAYLOAD (NULLABLE)
export interface AddEditCandidateApiPayload {
  candidateName: string;

  contactNumber: string | null;
  email: string | null;

  recruiterId: number | null;
  recruiterName: string | null;

  jobProfileRequirementId: number;

  expectedLocation?: {
    city: string;
    country: string;
  } | null;

  currentLocation?: {
    city: string;
    country: string;
  } | null;

  currentCTC?: number | null;
  expectedCTC?: number | null;

  noticePeriod: number;
  experienceYears: number;

  linkedinProfileUrl?: string | null;
  notes?: string | null;
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

export interface JobProfileRequirementItem {
  jobProfileRequirementId: number;

  jobRole: string;
  clientName: string;
  departmentName: string;

  city: string;
  state: string;
  country: string;

  experienceText: string | null;
}


export interface CandidateCreateData {
  recruiters: RecruiterItem[];
  locations: LocationItem[];
  jobProfiles: JobProfileRequirementItem[];
}
export interface BulkUploadFailedRow {
  row: number;
  error: string;
}

export interface BulkUploadSummary {
  totalRows: number;
  inserted: number;
  failed: number;
  skipped: number;
  processingTime: string;
}

export interface BulkUploadData {
  summary: BulkUploadSummary;
  failedRows: BulkUploadFailedRow[];
  hasMoreErrors: boolean;
}

export interface BulkUploadResponse {
  success: boolean;
  message: string;
  data: BulkUploadData;
}

