// Interview object returned by GET /api/interview
export interface Interview {
    interviewId: number;
    interviewDate: string;        // ISO date string
    fromTime: string;             // "HH:MM"
    durationMinutes: number;
    candidateId: number;
    candidateName: string;
    interviewerId: number;
    interviewerName: string;
    scheduledById: number;
    scheduledByName: string;
    result: "pending" | "selected" | "rejected" | "cancelled" | null;
    recruiterNotes?: string | null;
    interviewerFeedback?: string | null;
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
    durationMinutes: number;    // min 15, max 480
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
    result?: "pending" | "selected" | "rejected" | "cancelled";
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
  