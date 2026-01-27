import {
  ApiResponse,
  JobProfile,
  ApiJobProfile
} from "../types/jobProfileTypes";

import {
  mapApiToJobProfile
} from "../util/jobProfileMapper";

const API_BASE_URL: string = import.meta.env.VITE_BASE_URL;
const isSuccessResponse = (data: any): boolean => {
  return data?.success === true || data?.status === "success";
};

/* -------------------- Helpers -------------------- */

const makeHeaders = (accessToken?: string) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json"
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  return headers;
};

/* -------------------- Get Tech Specifications -------------------- */

export const getTechSpecifications = async (
  accessToken: string | null
): Promise<ApiResponse<{ id: number; label: string }[]>> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/lookup?page=1&limit=100`,
      {
        method: "GET",
        credentials: "include",
        headers: makeHeaders(accessToken || undefined)
      }
    );

    const data = await response.json();

    if (!response.ok || !isSuccessResponse(data)) {
      throw data;
    }

    // Filter only techSpecification
    const techSpecs = Array.isArray(data.data)
      ? data.data
          .filter((item: any) => item.tag === "techSpecification")
          .map((item: any) => ({
            id: item.lookupKey,
            label: item.value
          }))
      : [];

    return {
      success: true,
      message: data.message,
      data: techSpecs
    };

  } catch (error) {
    console.error("getTechSpecifications error:", error);
    throw error;
  }
};
/* -------------------- Get All Job Profiles -------------------- */

export const getAllJobProfilesWithJD = async (
  accessToken: string | null
): Promise<ApiResponse<JobProfile[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobProfile`, {
      method: "GET",
      credentials: "include",
      headers: makeHeaders(accessToken || undefined)
    });

    const data = await response.json();

    // Backend controlled errors
    if (!response.ok || !isSuccessResponse(data)) {
    throw data;
    }

    const rawProfiles: ApiJobProfile[] = Array.isArray(data.data)
      ? data.data
      : [];

    const mappedProfiles = rawProfiles.map(mapApiToJobProfile);

    return {
      success: true,
      message: data.message,
      data: mappedProfiles
    };

  } catch (error) {
    console.error("getAllJobProfilesWithJD error:", error);
    throw error;
  }
};

/* -------------------- Create Job Profile -------------------- */

export const createJobProfile = async (
  accessToken: string | null,
  payload: FormData
): Promise<ApiResponse<JobProfile>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobProfile`, {
      method: "POST",
      credentials: "include",
      headers: {
        Authorization: accessToken
          ? `Bearer ${accessToken}`
          : ""
      },
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

  } catch (error) {
    console.error("createJobProfile error:", error);
    throw error;
  }
};

/* -------------------- Update Job Profile -------------------- */

export const updateJobProfile = async (
  accessToken: string | null,
  id: number,
  payload: FormData
): Promise<ApiResponse<JobProfile>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobProfile/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        Authorization: accessToken
          ? `Bearer ${accessToken}`
          : ""
      },
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

  } catch (error) {
    console.error("updateJobProfile error:", error);
    throw error;
  }
};


/* -------------------- Delete Job Profile -------------------- */

export const deleteJobProfile = async (
  accessToken: string | null,
  id: number
): Promise<ApiResponse<null>> => {
  try {
    if (!id) {
      throw {
        message: "Invalid job profile id"
      };
    }

    const response = await fetch(`${API_BASE_URL}/jobProfile/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: makeHeaders(accessToken || undefined)
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

  } catch (error) {
    console.error("deleteJobProfile error:", error);
    throw error;
  }
};

/* -------------------- Get Single Job Profile -------------------- */

export const getJobProfileById = async (
  accessToken: string | null,
  id: number
): Promise<ApiResponse<JobProfile>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobProfile/${id}`, {
      method: "GET",
      credentials: "include",
      headers: makeHeaders(accessToken || undefined)
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

  } catch (error) {
    console.error("getJobProfileById error:", error);
    throw error;
  }
};
