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
  joiningDate: string | null;
  offeredCTCAmount: number | null;
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
}

/** Payload for creating an offer (POST /offers/:candidateId). candidateId from URL, createdBy from backend. */
export interface CreateOfferPayload {
  jobProfileRequirementId: number;
  vendorId?: number | null;
  reportingManagerId: number;
  employmentTypeLookupId: number;
  workModelLookupId: number;
  joiningDate: string;
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

/** Response from GET /offers/form-data. */
export interface OfferFormDataResponse {
  employmentTypes: { employmentTypeLookupId: number; employmentTypeName: string }[];
  workModes: { lookupId: number; value: string }[];
  currencies: { currencyId: number; currencyName: string }[];
  compensationTypes: { compensationTypeId: number; compensationTypeName: string }[];
  vendors: { vendorId: number; vendorName: string }[];
  members: { memberId: number; memberName: string }[];
  jobProfileRequirements: { jobProfileRequirementId: number; jobRole: string; [key: string]: unknown }[];
}
