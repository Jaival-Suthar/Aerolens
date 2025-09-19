import { json } from "react-router-dom";
import { Candidate, AddEditCandidate } from "../types/resumeTypes";
const API_BASE_URL: string = import.meta.env.VITE_BASE_URL;

// CREATE
// CREATE

export const createCandidate = async (candidate: AddEditCandidate): Promise<Candidate> => {
  try {
    const response = await fetch(`${API_BASE_URL}/candidate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(candidate),
    });

    if (!response.ok) {
      throw new Error("Failed to create candidate");
    }

    const data = await response.json();
    return data.data.candidate;
  } catch (error) {
    console.error("Error creating candidate:", error);
    throw error;
  }
};


// READ
// Get all candidates
export const getCandidates = async (): Promise<Candidate[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/candidate`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch candidates");
    }

    const data = await response.json();
    return data.data.candidates;
  } catch (error) {
    console.error("Error fetching candidates:", error);
    throw error;
  }
};


// UPDATE
export const updateCandidate = async (
  id: number,
  candidate: AddEditCandidate
): Promise<AddEditCandidate> => {
  try {
    const response = await fetch(`${API_BASE_URL}/candidate/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(candidate),
    });

    if (!response.ok) {
      throw new Error("Failed to update candidate");
    }

    const data = await response.json();
    return data?.data?.candidate;

  } catch (error) {
    console.error("Error updating candidate:", error);
    throw error;
  }
};

// To read Partial means that the fields in Candidate are optional
// DELETE
export const deleteCandidate = async (id: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/candidate/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete candidate");
    }

    return true;
  } catch (error) {
    console.error("Error deleting candidate:", error);
    throw error;
  }
};
