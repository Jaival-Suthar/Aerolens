// Interview object returned by GET /api/interview
// Interview object returned by GET /api/interview
export interface Interview {
  interviewId: number;

  candidateId: number;
  candidateName: string;

  interviewerId: number;
  interviewerName: string;

  scheduledById: number;
  scheduledByName: string;
  eventTimestamp: string;
  /**
   * Display/helper date (YYYY-MM-DD).
   * NOT authoritative for time calculations.
   */
  interviewDate: string;

  /**
   * UTC datetime string returned by backend
   * Format: "YYYY-MM-DD HH:mm:ss.SSSSSS"
   */
  fromTime: string;

  /**
   * UTC datetime string returned by backend
   * Format: "YYYY-MM-DD HH:mm:ss.SSSSSS"
   */
  toTime: string;

  /**
   * IANA timezone in which the interview was scheduled
   * Example: "Asia/Kolkata", "America/New_York"
   */
  eventTimezone: string;

  durationMinutes: number;

  // Rounds
  roundNumber: number;
  totalInterviews: number;

  // Status / Notes
  result?: InterviewResult;
  recruiterNotes?: string;
  interviewerFeedback?: string;
  meetingUrl?: string;

  isActive?: boolean;
}
  
  // Response from GET /api/interview
  export interface GetAllInterviewsResponse {
    success: boolean;
    message: string;
    data: Interview[];
    statusCode: number;
  }
  
  // Response from GET /api/interview/:id
  export interface GetInterviewByIdResponse {
    success: boolean;
    message: string;
    data: Interview;
    statusCode: number;
  }
  
  // Response from POST /api/interview
  export interface CreateInterviewRequest {
    interviewDate: string;      // ISO date string, cannot be in the past
    fromTime: string;           // "HH:MM"
    toTime: string;             // "HH:MM"
    durationMinutes: number;    // min 15, max 480
    eventTimezone: string;
    candidateId: number;
    interviewerId: number;
    scheduledById: number;
    recruiterNotes?: string;
    interviewerFeedback?: string;
  }
  
  // Response from POST /api/interview
  export interface CreateInterviewResponse {
    success: boolean;
    message: string;
    data: Interview;
    statusCode: number;
  }
  
  // Request to PATCH /api/interview/:id
  export interface UpdateInterviewRequest {
    interviewDate?: string;
    fromTime?: string;
    durationMinutes?: number;
    eventTimezone?: string;
    result?: "Pending" | "Selected" | "Rejected" | "Cancelled";
    recruiterNotes?: string;
    interviewerFeedback?: string;
  }
  
  // Response from PATCH /api/interview/:id
  export interface UpdateInterviewResponse {
    success: boolean;
    message: string;
    data: Partial<Interview>;
    statusCode: number;
  }
  
  // Response from DELETE /api/interview/:id
  export interface DeleteInterviewResponse {
    success: boolean;
    message: string;
    data: null;
    statusCode: number;
  }
  
  export type InterviewResult = "Pending" | "Selected" | "Rejected" | "Cancelled";

// Request to PUT /api/interview/:interviewId/finalize
export interface FinalizeInterviewRequest {
  result: InterviewResult;
  recruiterNotes?: string;
  interviewerFeedback?: string;
  meetingUrl?: string;
}

// Response from PUT /api/interview/:interviewId/finalize
export interface FinalizeInterviewResponse {
  success: boolean;
  message: string;
  data: {
    interviewId: number;
    result: InterviewResult;
    recruiterNotes?: string;
    interviewerFeedback?: string;
    meetingUrl?: string;
  };
  statusCode: number;
}

export interface InterviewerDailyCapacity {
  interviewerId: number;
  capacity: number;
  scheduledCount: number;
  scheduledTimesUTC: string[];
  isFull: boolean;
}

export interface ApiError {
  success: false;
  message: string;
  error: {
    code: string;
    details?: any;
  };
}

export interface InterviewDeletedRecord {
  interviewId: number;
  candidateName: string;
  interviewerName: string | null;
  roundNumber: number | null;
  result: string | null;
  deleted_at: string | null;
}

export interface InterviewDeletedResponse {
  success: boolean;
  message: string;
  data: InterviewDeletedRecord[];
}
