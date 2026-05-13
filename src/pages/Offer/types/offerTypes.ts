/**
 * Offer module types.
 * Aligned with backend: offer table, GET /offers, POST /offers/:candidateId, GET /offers/form-data
 */

/** Single row for the Offer table (GET /offers response). */
export interface OfferTableRow {
  offerId: number;
  candidateName: string;
  jobRole: string;
  employmentTypeName: string;
  workModeName: string;
  vendorName?: string | null;
  joiningDate: string | null;
  offeredCTCAmount: number | null;
  /** Display-friendly from GET /offers. */
  currencyName?: string | null;
  compensationTypeName?: string | null;
  /** Optional IDs for fallback resolution. */
  currencyId?: number | null;
  currencyLookupId?: number | null;
  compensationTypeId?: number | null;
  compensationTypeLookupId?: number | null;
  offerStatus: string;
  offerVersion: number;
  variablePay: number | null;
  joiningBonus: number | null;
  createdByName: string | null;
  createdAt: string;
  /** Optional: Sent / Received when backend provides. */
  documentsStatus?: string | null;
  /** Optional: when backend provides. */
  onboardingStatus?: string | null;
  /** Onboarding document fields (populated after document generation). */
  docType?: 'offer_letter' | 'service_agreement' | null;
  docFileName?: string | null;
  docMimeType?: string | null;
  docFileSize?: number | null;
  docGeneratedAt?: string | null;
}

/** Payload for creating an offer (POST /offers/:candidateId). candidateId from URL, createdBy from backend. */
export interface CreateOfferPayload {
  jobProfileRequirementId: number;
  vendorId?: number | null;
  contractorAddress?: string | null;
  reportingManagerId: number;
  employmentTypeLookupId: number;
  workModelLookupId: number;
  joiningDate: string;
  sign_before_date?: string | null;
  offeredCTCAmount?: number | null;
  currencyLookupId?: number | null;
  compensationTypeLookupId?: number | null;
  variablePay?: number | null;
  joiningBonus?: number | null;
  offerLetterSent?: boolean;
  serviceAgreementSent?: boolean;
  ndaSent: boolean;
  codeOfConductSent: boolean;
}

/** Payload for POST /offers/:offerId/terminate */
export interface TerminateOfferPayload {
  terminationDate: string;
  terminationReason: string;
}

/** Payload for POST /offers/:offerId/revise — at least one of newCTC or newJoiningDate required */
export interface ReviseOfferPayload {
  reason: string;
  newCTC?: number;
  newJoiningDate?: string;
}

/** Payload for POST /offers/:offerId/status */
export interface UpdateOfferStatusPayload {
  status: "ACCEPTED" | "REJECTED";
  decisionDate: string;
  signedOfferLetterReceived?: boolean;
  signedServiceAgreementReceived?: boolean;
  signedNDAReceived?: boolean;
  signedCodeOfConductReceived?: boolean;
  rejectionReason?: string;
}

/** Common API response shape for offer actions */
export interface OfferActionResponse {
  success: boolean;
  message?: string;
}

/** Offer row from GET /offers/:offerId/details (display names included). */
export interface OfferDetailsOffer {
  offerId: number;
  candidateId?: number;
  candidateName: string;
  jobRole: string;
  employmentTypeName: string;
  workModeName: string;
  vendorName?: string | null;
  currencyName?: string | null;
  compensationTypeName?: string | null;
  createdByName?: string | null;
  reportingManagerName?: string | null;
  joiningDate: string | null;
  offeredCTCAmount: number | null;
  offerStatus: string;
  offerVersion: number;
  variablePay?: number | null;
  joiningBonus?: number | null;
  createdAtFormatted?: string | null;
  createdAt?: string | null;
  documentsStatus?: string | null;
  onboardingStatus?: string | null;
}

/** Single revision from offer_revision (newest first). */
export interface OfferRevision {
  revisionId: number;
  offerId: number;
  previousCTC: number | null;
  newCTC: number | null;
  previousJoiningDate: string | null;
  newJoiningDate: string | null;
  reason: string;
  revisedBy?: number;
  revisedByName?: string | null;
}

/** Payload inside GET /offers/:offerId/details response `data`. */
export interface OfferDetailsPayload {
  offer: OfferDetailsOffer;
  revisionCount: number;
  revisions: OfferRevision[];
}

/** Response from GET /offers/form-data. Aligned with backend lookup keys. */
export interface OfferFormDataResponse {
  employmentTypes: { employmentTypeLookupId: number; employmentTypeName: string }[];
  workModes: { workModelLookupId: number; workModelName: string }[];
  currencies: { currencyLookupId: number; currencyName: string }[];
  compensationTypes: { compensationTypeLookupId: number; compensationTypeName: string }[];
  vendors: { vendorId: number; vendorName: string }[];
  members: { memberId: number; memberName: string }[];
  jobProfileRequirements: { jobProfileRequirementId: number; jobRole: string; [key: string]: unknown }[];
}

/** Response from GET /offers/by-candidate/:candidateId — active (PENDING) offer with doc info. */
export interface ActiveOfferData {
  offerId: number;
  jobProfileRequirementId: number | null;
  vendorId: number | null;
  contractorAddress: string | null;
  photoS3Key: string | null;
  aadhaarFrontS3Key: string | null;
  aadhaarBackS3Key: string | null;
  panCardS3Key: string | null;
  reportingManagerId: number | null;
  employmentTypeLookupId: number | null;
  employmentTypeName: string | null;
  workModelLookupId: number | null;
  joiningDate: string | null;
  signBeforeDate: string | null;
  offeredCTCAmount: number | null;
  currencyLookupId: number | null;
  compensationTypeLookupId: number | null;
  variablePay: number | null;
  joiningBonus: number | null;
  offerLetterSent: boolean | null;
  serviceAgreementSent: boolean | null;
  ndaSent: boolean | null;
  codeOfConductSent: boolean | null;
  offerStatus: string;
  docType: 'offer_letter' | 'service_agreement' | null;
  docFileName: string | null;
  docS3Key: string | null;
  docMimeType: string | null;
  docFileSize: number | null;
  docGeneratedBy: number | null;
  docGeneratedAt: string | null;
}

export interface OfferDeletedRecord {
  offerId: number;
  candidateName: string;
  jobRole: string | null;
  offerStatus: string | null;
  deleted_at: string | null;
}

export interface OfferDeletedResponse {
  success: boolean;
  message: string;
  data: OfferDeletedRecord[];
}
