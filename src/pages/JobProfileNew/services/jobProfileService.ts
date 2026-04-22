import {
  ApiResponse,
  JobProfile,
  ApiJobProfile,
  JobProfileDeletedResponse
} from "../types/jobProfileTypes";

import {
  mapApiToJobProfile
} from "../util/jobProfileMapper";

const API_BASE_URL: string = import.meta.env.VITE_BASE_URL;

/* -------------------- Helpers -------------------- */

const isSuccessResponse = (data: any): boolean => {
  return data?.success === true || data?.status === "success";
};



const makeAuthHeaders = (accessToken?: string) => {
  const headers: HeadersInit = {};

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  return headers;
};

/* -------------------- Get Tech Specifications -------------------- */

export const getTechSpecifications = async (
  accessToken: string | null
): Promise<ApiResponse<{ id: number; label: string }[]>> => {

  const response = await fetch(
    `${API_BASE_URL}/lookup?page=1&limit=100`,
    {
      method: "GET",
      credentials: "include",
      headers: makeAuthHeaders(accessToken || undefined)

    }
  );

  const data = await response.json();

  if (!response.ok || !isSuccessResponse(data)) {
    throw data;
  }

  const techSpecs = Array.isArray(data.data)
    ? data.data
        .filter((i: any) => i.tag === "techSpecification")
        .map((i: any) => ({
          id: i.lookupKey,
          label: i.value
        }))
    : [];

  return {
    success: true,
    message: data.message,
    data: techSpecs
  };
};

/* -------------------- Get All Job Profiles -------------------- */

export const getAllJobProfilesWithJD = async (
  accessToken: string | null
): Promise<ApiResponse<JobProfile[]>> => {

  const response = await fetch(`${API_BASE_URL}/jobProfile`, {
    method: "GET",
    credentials: "include",
    headers: makeAuthHeaders(accessToken || undefined)
  });

  const data = await response.json();

  if (!response.ok || !isSuccessResponse(data)) {
    throw data;
  }

  const raw: ApiJobProfile[] = Array.isArray(data.data)
    ? data.data
    : [];

  const mapped = raw.map(mapApiToJobProfile);

  return {
    success: true,
    message: data.message,
    data: mapped
  };
};

/* -------------------- Get Deleted Job Profiles -------------------- */

export const getDeletedJobProfiles = async (
  accessToken: string | null
): Promise<JobProfileDeletedResponse> => {
  const response = await fetch(`${API_BASE_URL}/jobProfile/deletions`, {
    method: "GET",
    credentials: "include",
    headers: makeAuthHeaders(accessToken || undefined)
  });

  const data = await response.json();

  if (!response.ok || !isSuccessResponse(data)) {
    throw data;
  }

  return data;
};

/* -------------------- Create Job Profile -------------------- */

export const createJobProfile = async (
  accessToken: string | null,
  payload: FormData
): Promise<ApiResponse<JobProfile>> => {

  const response = await fetch(`${API_BASE_URL}/jobProfile`, {
    method: "POST",
    credentials: "include",
    headers: makeAuthHeaders(accessToken || undefined),
    body: payload
  });

  const data = await response.json();

  if (!response.ok || !isSuccessResponse(data)) {
    throw data;
  }

  return {
    success: true,
    message: data.message,
    data: mapApiToJobProfile(data.data)
  };
};

/* -------------------- Update Job Profile -------------------- */

export const updateJobProfile = async (
  accessToken: string | null,
  id: number,
  payload: FormData
): Promise<ApiResponse<JobProfile>> => {

  const response = await fetch(`${API_BASE_URL}/jobProfile/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: makeAuthHeaders(accessToken || undefined),
    body: payload
  });

  const data = await response.json();

  if (!response.ok || !isSuccessResponse(data)) {
    throw data;
  }

  return {
    success: true,
    message: data.message,
    data: mapApiToJobProfile(data.data)
  };
};

/* -------------------- Delete Job Profile -------------------- */

export const deleteJobProfile = async (
  accessToken: string | null,
  id: number
): Promise<ApiResponse<null>> => {

  if (!id) {
    throw new Error("Invalid job profile id");
  }

  const response = await fetch(`${API_BASE_URL}/jobProfile/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: makeAuthHeaders(accessToken || undefined)
  });

  const data = await response.json();

  if (!response.ok || !isSuccessResponse(data)) {
    throw data;
  }

  return {
    success: true,
    message: data.message,
    data: null
  };
};

/* -------------------- Get Single Job Profile -------------------- */

export const getJobProfileById = async (
  accessToken: string | null,
  id: number
): Promise<ApiResponse<JobProfile>> => {

  const response = await fetch(`${API_BASE_URL}/jobProfile/${id}`, {
    method: "GET",
    credentials: "include",
    headers: makeAuthHeaders(accessToken || undefined)
  });

  const data = await response.json();

  if (!response.ok || !isSuccessResponse(data)) {
    throw data;
  }

  return {
    success: true,
    message: data.message,
    data: mapApiToJobProfile(data.data)
  };
};
