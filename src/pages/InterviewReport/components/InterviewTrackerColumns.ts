export type InterviewTrackerColumn = {
  field: string;
  header: string;
};

export const ALL_INTERVIEW_TRACKER_COLUMNS: InterviewTrackerColumn[] = [
  { field: "candidateName", header: "Candidate Name" },
  { field: "date", header: "Date" },
  { field: "time", header: "Interview Time" },
  { field: "contactInfo", header: "Candidate Contact Info" },
  { field: "location", header: "Location" },
  { field: "noticePeriod", header: "Notice Period (Days)" },
  { field: "experienceYears", header: "Experience (Yrs)" },
  { field: "jobRole", header: "Role" },
  { field: "interviewerName", header: "Interviewer" },
  { field: "clientName", header: "Client" },
  { field: "recruiterName", header: "Recruiter" },
  { field: "interviewerFeedback", header: "Feedback" },
];

export const DEFAULT_INTERVIEW_TRACKER_COLUMNS = [
  "date",
  "candidateName",
  "location",
  "noticePeriod",
  "experienceYears",
  "jobRole",
  "interviewerName",
  "recruiterName",
];
