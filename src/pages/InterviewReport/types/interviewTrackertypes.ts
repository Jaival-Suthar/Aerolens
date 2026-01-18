export type InterviewResult =
  | "pending"
  | "selected"
  | "rejected"
  | "cancelled";

export interface ExpectedJoiningLocation {
  locationId: number;
  city: string;
  state: string;
  country: string;
}

export interface InterviewTrackerItem {
  interviewDate: string;              // YYYY-MM-DD
  interviewFromTime: string;           // ISO 8601 (UTC)

  interviewerFeedback: string;

  candidateId: number;
  candidateName: string;
  candidatePhone: string;
  candidateEmail: string;

  jobRole: string;
  experienceYears: number;
  noticePeriod: number;

  expectedJoiningLocation: ExpectedJoiningLocation;

  interviewerId: number;
  interviewerName: string;

  recruiterName: string;

  /** Optional – shown only when backend sends it */
  result?: InterviewResult;
}

export interface InterviewTrackerResponse {
  success: boolean;
  message: string;
  data: InterviewTrackerItem[];
}