/* ======================================================
   Base API Response Types
   ====================================================== */

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
}

/* ======================================================
   Shared Interviewer Statistics
   ====================================================== */

export interface InterviewerStats {
  interviewerId: number;
  interviewerName: string;
  total: number;
  selected: number;
  rejected: number;
  pending: number;
  cancelled: number;
  avgDuration: number;
  totalMinutes: number;
}

/* ======================================================
   1. Overall Interviewer Report
   ====================================================== */

export interface OverallReportData {
  interviewers: InterviewerStats[];
}

export type OverallReportResponse =
  | ApiSuccessResponse<OverallReportData>
  | ApiErrorResponse;

/* ======================================================
   2. Monthly Summary Report
   ====================================================== */

export interface CumulativeInterviewSummary {
  total: number;
  selected: number;
  rejected: number;
  pending: number;
  cancelled: number;
}

export interface InterviewDate {
  interviewDate: string; // YYYY-MM-DD
}

export interface MonthlyReportData {
  summary: CumulativeInterviewSummary;
  interviewers: InterviewerStats[];
  interviewDates: InterviewDate[];
}

export type MonthlyReportResponse =
  | ApiSuccessResponse<MonthlyReportData>
  | ApiErrorResponse;

/* ======================================================
   3. Daily Summary Report
   ====================================================== */

export type InterviewResult =
  | "selected"
  | "rejected"
  | "pending"
  | "cancelled";

export interface DailyInterview {
  interviewerId: number;
  interviewerName: string;
  interviewId: number;
  candidateId: number;
  candidateName: string;
  interviewDate: string;
  fromTime: string;
  toTime: string;
  roundNumber: number;
  totalInterviews: number;
  durationMinutes: number;
  recruiterNotes: string;
  result: InterviewResult;
}

export interface DailyReportData {
  interviews: DailyInterview[];
}

export type DailyReportResponse =
  | ApiSuccessResponse<DailyReportData>
  | ApiErrorResponse;
