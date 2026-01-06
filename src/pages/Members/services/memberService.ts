import { 
  Member,
  ApiResponse,
  MemberPatchPayload,
  MemberLocation,
  MemberApi,
  MemberFormData
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
export function mapApiMember(data: MemberApi): Member {
  return {
    memberId: data.memberId,
    memberName: data.memberName,
    memberContact: data.memberContact,
    email: data.email,

    designationId: data.designationId,
    designation: data.designation ?? null,

    isRecruiter: data.isRecruiter,
    isInterviewer: data.isInterviewer,
    interviewerCapacity: data.interviewerCapacity ?? null,

    vendorId: data.vendorId ?? null,
    vendorName: data.vendorName ?? null,
    clientId: data.clientId ?? null,
    clientName: data.clientName ?? null,
    organisation: data.organisation ?? null,

    location: {
      city: (data as any).cityName ?? data.city ?? null,
      country: data.country ?? null,
    },

    skills: data.skills ?? [],
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
      if (response.status === 401) throw new Error("Unauthorized - invalid or expired token");
      throw new Error(`Failed to fetch members: ${response.status}`);
    }

    const data = await response.json();
    console.log("getMembers response data:", data);
    
    if (!data.success) {
      throw new Error(data.message || "Failed to fetch members");
    }

    const mapped = Array.isArray(data.data)
      ? data.data.map(mapApiMember)
      : [];
    console.log("Mapped members:", mapped);
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
    console.log("getMemberById response data:", data);
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

export const patchMember = async (
  accessToken: string | null,
  memberId: number,
  payload: MemberPatchPayload
): Promise<ApiResponse<Member>> => {
  if (!accessToken) throw new Error("Access token is required");
  if (!memberId || memberId <= 0) throw new Error("Invalid memberId");

  try {
    const response = await fetch(`${API_BASE_URL}/member/${memberId}`, {
      method: "PATCH",
      credentials: "include",
      headers: makeHeaders(accessToken),
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("patchMember response data:", data);
    if (!response.ok) {
      const msg = data.message || `Failed to update member: ${response.status}`;
      throw new Error(msg);
    }

    if (!data.success) {
      throw new Error(data.message || "Failed to update member");
    }

    const mapped = mapApiMember(data.data);

    return {
      success: true,
      message: data.message,
      data: mapped,
    };
  } catch (error) {
    console.error("Error in patchMember:", error);
    throw error;
  }
};

// memberService.ts
export const getMemberFormData = async (
  accessToken: string | null
): Promise<MemberFormData> => {
  const response = await fetch(`${API_BASE_URL}/member/form-data`, {
    credentials: "include",
    headers: makeHeaders(accessToken || undefined),
  });

  const res = await response.json();

  if (!response.ok || !res.success) {
    throw new Error(res.message || "Failed to load member form data");
  }

  return {
    designations: res.data.designations.map((d: any) => ({
      lookupKey: d.designationId,
      value: d.designationName,
    })),
    vendors: res.data.vendors,
    clients: res.data.clients,
    skills: res.data.skills,
    locations: res.data.locations,
  };
};


export const deleteMember = async (
  accessToken: string | null,
  memberId: number
): Promise<ApiResponse<null>> => {
  if (!accessToken) throw new Error("Access token is required");
  if (!memberId || memberId <= 0) throw new Error("Invalid memberId");

  try {
    const response = await fetch(`${API_BASE_URL}/member/${memberId}`, {
      method: "DELETE",
      credentials: "include",
      headers: makeHeaders(accessToken),
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