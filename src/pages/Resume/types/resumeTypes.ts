// Candidate model
export interface Candidate {
  candidateId: number;
  candidateName: string;
  contactNumber: string;
  email: string;
  dateOfEntry?: string | null;

  recruiterId: number | null;        // Editable
  recruiterName: string | null;      // Editable
  recruiterContact: string | null;   // Read-only from backend
  recruiterEmail: string | null;     // Read-only from backend

  jobProfileRequirementId: number; // Read-only from backend
  /** Job / role applied for (from joined job profile) */
  jobRole?: string | null;

  expectedLocation: {
    city: string;
    country: string;
  } | null;
  currentLocation?: {
    city: string;
    country: string;
  } | null;

  // currentCTC: number;
  // expectedCTC: number;
  workMode?: string | null;
  workModeId?: number | null;
  currentCTCAmount?: number | null;
  currentCTCCurrencyId?: number | null;
  currentCTCTypeId?: number | null;
  expectedCTCAmount?: number | null;
  expectedCTCCurrencyId?: number | null;
  expectedCTCTypeId?: number | null;
  noticePeriod: number;
  experienceYears: number;
  statusName: string;
  vendorId?: number | null;
  vendorName?: string | null;
  referredBy?: string | null;

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
  vendorId?: number | null;
  referredBy?: string | null;

  jobProfileRequirementId?: number;

  expectedLocation?: {
    city: string;
    country: string;
  } | null;
   currentLocation?: {
    city: string;
    country: string;
  } | null;

  // currentCTC?: number | null;
  // expectedCTC?: number | null;
  workMode?: string | null; 
  workModeId?: number | null;
  currentCTCAmount?: number | null;
  currentCTCCurrencyId?: number | null;
  currentCTCTypeId?: number | null;
  
  expectedCTCAmount?: number | null;
  expectedCTCCurrencyId?: number | null;
  expectedCTCTypeId?: number | null;
  
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
  existingCandidates: Candidate[]; // ✅ ADD THIS
}

/* ------------------ ADD/EDIT PAYLOAD ------------------ */
export interface AddEditCandidate {
  candidateName: string;
  contactNumber?: string;
  email?: string;

  recruiterId: number | null;
  recruiterName: string | null;
  vendorId?: number | null;
  referredBy?: string;

  jobProfileRequirementId: number;

  expectedLocation?: {
    city: string;
    country: string;
  } | null;
   currentLocation?: {
    city: string;
    country: string;
  } | null;

  // currentCTC?: number;
  // expectedCTC?: number;
  workMode?: string | null;
  workModeId?: number | null;

  currentCTCAmount?: number | null;
  currentCTCCurrencyId?: number | null;
  currentCTCTypeId?: number | null;
  expectedCTCAmount?: number | null;
  expectedCTCCurrencyId?: number | null;
  expectedCTCTypeId?: number | null;
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
  vendorId?: number | null;
  referredBy?: string | null;

  jobProfileRequirementId: number;

  expectedLocation?: {
    city: string;
    country: string;
  } | null;

  currentLocation?: {
    city: string;
    country: string;
  } | null;

  // currentCTC?: number | null;
  // expectedCTC?: number | null;
  workMode?: string | null; // NEW FIELD
  workModeId?: number | null; // NEW FIELD
  currentCTCAmount?: number | null;
  currentCTCCurrencyId?: number | null;
  currentCTCTypeId?: number | null;
  expectedCTCAmount?: number | null;
  expectedCTCCurrencyId?: number | null;
  expectedCTCTypeId?: number | null;
  

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

export interface VendorItem {
  vendorId: number;
  vendorName: string;
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
// Currency type
export interface CurrencyItem {
  currencyId: number;       // matches Candidate.currentCTCCurrencyId type
  currencyName: string;
}

// Compensation / CTC type
export interface CompensationTypeItem {
  compensationTypeId: number;   // matches Candidate.currentCTCTypeId type
  compensationTypeName: string;
}
export interface WorkModeItem {
  workModeId: number;
  workMode: string;
}

export interface CandidateCreateData {
  recruiters: RecruiterItem[];
  vendors: VendorItem[];
  locations: LocationItem[];
  jobProfiles: JobProfileRequirementItem[];
  currencies?: CurrencyItem[];          // NEW
  compensationTypes?: CompensationTypeItem[]; // NEW
  workModes?: WorkModeItem[];   // ADD THIS

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

export interface ResumeBulkUploadResponse {
  status: "success";
  batchId: string;
}

export interface ResumeBatchStatus {
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  totalFiles: number;
  processed: number;
  linked: number;
  skipped_no_match: number;
  skipped_already_exists: number;
  failed: number;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface ResumeBatchStatusResponse {
  status: "success";
  batchId: string;
  data: ResumeBatchStatus;
}

/* ------------------ ONBOARDING (Initiate Onboarding dialog) ------------------ */

export type OnboardingDocumentStatus = "Yes" | "No";

/** Employment type: Employee or Consultant. In production options come from lookup; conditional rendering (Vendor / Offer Letter vs Service Agreement) is unchanged. */
export type OnboardingEmploymentType = "Employee" | "Consultant";

export interface OnboardingFormData {
  candidateName: string;
  /** JPR (Job Profile Requirement) — used as jobProfileRequirementId when creating offer. */
  jprProjectDepartmentId: number | null;
  /** Employment type from API dropdown; drives Vendor visibility and document row (Offer Letter vs Service Agreement). */
  employmentTypeLookupId: number | null;
  /** Legacy: kept for backward compat; conditionals use employmentTypeName from API when available. */
  employmentType: OnboardingEmploymentType | null;
  modeOfWorkingId: number | null;
  joiningDate: Date | null;
  offeredCtcValue: number | null;
  currencyId: number | null;
  compensationTypeId: number | null;
  variablePay: number | null;
  joiningBonus: number | null;
  reportingToId: number | null;
  vendorId: number | null;
  /** Shown when employment type is Employee. */
  offerLetterSent: OnboardingDocumentStatus;
  /** Shown when employment type is Consultant. */
  serviceAgreementSent: OnboardingDocumentStatus;
  ndaSent: OnboardingDocumentStatus;
  codeOfConductSent: OnboardingDocumentStatus;
}

export interface ResumeOnBoardingProps {
  visible: boolean;
  onHide: () => void;
  selectedCandidate: Candidate | null;
  createData: CandidateCreateData | null;
  onSuccess: () => void;
}

/** Row from GET /whatsapp/groups → data.groups */
export interface WhatsAppGroup {
  groupId: number;
  groupName: string;
}

export interface WhatsAppGroupsData {
  groups: WhatsAppGroup[];
}

/** POST /whatsapp/send-resume — FE sends customMessage (backend also accepts message; same meaning). */
export interface QueueWhatsAppSendResumePayload {
  candidateId: number;
  groupId: number;
  /** Optional plain text for template var 9; max 1024 on backend. */
  customMessage?: string;
}
