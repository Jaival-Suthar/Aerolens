import { 
  Member,
  ApiResponse
} from '../types/memberTypes';

const API_BASE_URL: string = import.meta.env.VITE_BASE_URL;

// Common headers
const makeHeaders = (accessToken?: string): HeadersInit => {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  return headers;
};

// --------------------------
// API → Frontend Mapper
// --------------------------
export function mapApiMember(data: any): Member {
  return {
    memberId: data.memberId,
    memberName: data.memberName,
    memberContact: data.memberContact,
    email: data.email,
    designation: data.designation,

    isRecruiter: Boolean(data.isRecruiter),
    isActive: Boolean(data.isActive),

    lastLogin: data.lastLogin || null,
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,

    location: {
      city: data.cityName || "",
      country: data.country || "",
    },

    clientName: data.clientName ?? "",
    organisation: data.organisation ?? "",

    isInterviewer: Boolean(data.isInterviewer),
    interviewerCapacity: data.interviewerCapacity ?? 0,

    skills: data.skills ?? "",
  };
}

// --------------------------
// GET ALL Members
// --------------------------
export const getMembers = async (
  accessToken: string | null
): Promise<ApiResponse<Member[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/member`, {
      credentials: 'include',
      headers: makeHeaders(accessToken || undefined),
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error("Unauthorized – invalid or expired token");
      throw new Error(`Failed to fetch members: ${response.status}`);
    }

    const data = await response.json();

    // Backend returns: { success: true, message, data: [...] }
    if (!data.success) {
      throw new Error(data.message || "Failed to fetch members");
    }

    const mapped = Array.isArray(data.data)
      ? data.data.map(mapApiMember)
      : [];

    return {
      success: true,
      message: data.message,
      data: mapped,
    };
  } catch (error) {
    console.error("Error in getMembers:", error);
    throw error;
  }
};

// --------------------------
// GET Member by ID
// --------------------------
export const getMemberById = async (
  accessToken: string | null,
  id: number
): Promise<ApiResponse<Member>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/member/${id}`, {
      credentials: 'include',
      headers: makeHeaders(accessToken || undefined),
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error("Unauthorized – invalid or expired token");
      throw new Error(`Failed to fetch member: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Member not found");
    }

    const mapped = mapApiMember(data.data);

    return {
      success: true,
      message: data.message,
      data: mapped,
    };
  } catch (error) {
    console.error("Error in getMemberById:", error);
    throw error;
  }
};

export const deleteMember = async (
  accessToken: string | null,
  memberId: number
): Promise<ApiResponse<null>> => {
  if (!accessToken) throw new Error("Access token is required");
  if (!memberId || memberId <= 0) throw new Error("Invalid memberId");

  try {
    const response = await fetch(`${API_BASE_URL}/member/${memberId}`, { // Fixed endpoint to match others
      method: "DELETE",
      credentials: "include",
      headers: makeHeaders(accessToken), // Always call makeHeaders with accessToken
    });

    const data = await response.json();

    if (!response.ok) {
      const msg = data.message || `Failed to delete member: ${response.status}`;
      throw new Error(msg);
    }

    if (!data.success) {
      throw new Error(data.message || "Failed to delete member");
    }

    return {
      success: true,
      message: data.message,
      data: null,
    };

  } catch (error) {
    console.error("Error in deleteMember:", error);
    throw error;
  }
};

