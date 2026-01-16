export interface InterviewStatistics {
  totalInterviews: number;
  interviewsConducted: number;
  pending: number;
  selected: number;
  rejected: number;
  cancelled: number;
  cancelledByCandidates: number;
}

export interface Interview {
  candidateId: number;
  candidateName: string;
  role: string;
  round: string;
  date: string;
  result: "Pending" | "Selected" | "Rejected" | "Cancelled";
  feedback?: string | null;
  recruiterId: number;
  recruiterName: string;
}

export interface InterviewerReport {
  interviewerId: number;
  interviewerName: string;
  statistics: InterviewStatistics;
  interviews: Interview[];
}

export interface InterviewerWorkloadResponse {
  interviewers: InterviewerReport[];
}
