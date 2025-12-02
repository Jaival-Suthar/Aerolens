const BASE_URL = import.meta.env.VITE_BASE_URL;

// ------------------- GET ALL INTERVIEWS -------------------
export const getInterviews = async (token: string) => {
  try {
    const response = await fetch(`${BASE_URL}/api/interviews`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch interviews");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching interviews:", error);
    throw error;
  }
};

// ------------------- GET INTERVIEW BY ID -------------------
export const getInterviewById = async (interviewId: number, token: string) => {
  try {
    const response = await fetch(`${BASE_URL}/api/interview/${interviewId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Interview with ID ${interviewId} not found`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching interview by ID:", error);
    throw error;
  }
};

// ------------------- CREATE INTERVIEW -------------------
export const createInterview = async (payload: any, token: string) => {
  try {
    const response = await fetch(`${BASE_URL}/api/interview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Failed to create interview");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating interview:", error);
    throw error;
  }
};

// ------------------- UPDATE INTERVIEW -------------------
export const updateInterview = async (interviewId: number, payload: any, token: string) => {
  try {
    const response = await fetch(`${BASE_URL}/api/interview/${interviewId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Failed to update interview");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating interview:", error);
    throw error;
  }
};

// ------------------- DELETE INTERVIEW -------------------
export const deleteInterview = async (interviewId: number, token: string) => {
  try {
    const response = await fetch(`${BASE_URL}/api/interview/${interviewId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Failed to delete interview");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting interview:", error);
    throw error;
  }
};
