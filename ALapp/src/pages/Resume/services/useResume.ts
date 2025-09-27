import { json } from "react-router-dom";
import { Candidate, AddEditCandidate, CandidateUpdatePayload } from "../types/resumeTypes";
const API_BASE_URL: string = import.meta.env.VITE_BASE_URL;

// CREATE
export const createCandidate = async (candidate: AddEditCandidate): Promise<Candidate> => {
  try {
    console.log("🚀 CREATE CANDIDATE - Starting...");
    console.log("📝 Input candidate data:", candidate);
    console.log("🌐 API_BASE_URL:", API_BASE_URL);
    
    // const formData = new FormData();
    const formData={
      "candidateName":candidate.candidateName,
      "contactNumber":candidate.contactNumber,
      "email":candidate.email,
      "recruiterName":candidate.recruiterName,
      "jobRole":candidate.jobRole,
      "preferredJobLocation":candidate.preferredJobLocation,
      "currentCTC":Number(candidate.currentCTC),
      "expectedCTC":Number(candidate.expectedCTC),
      "noticePeriod": Number(candidate.noticePeriod),
      "experienceYears": Number(candidate.experienceYears),
      "linkedinProfileUrl": candidate.linkedinProfileUrl || "",
      // "status": candidate?.statusName||null,
      "resume": candidate?.resumeFile
    }
    
    const response = await fetch(`${API_BASE_URL}/candidate`, {
      method: "POST",
      //body: formData,
      headers: { "Content-Type": "multipart/form-data" },

      body: JSON.stringify(formData),
    });

    console.log("📡 Response received:");
    console.log("  Status:", response.status);
    console.log("  Status Text:", response.statusText);
    console.log("  Headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error("❌ Response not OK, attempting to parse error...");
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        console.error("🚨 API Error Data:", errorData);
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (parseError) {
        console.error("🚨 Could not parse error as JSON:", parseError);
        try {
          const errorText = await response.text();
          console.error("🚨 Raw error response:", errorText);
        } catch (textError) {
          console.error("🚨 Could not even get text response:", textError);
        }
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("✅ Success response data:", data);
    console.log("✅ Returning candidate:", data.data);
    
    return data.data;
  } catch (error) {
    console.error("💥 Error in createCandidate:", error);
    throw error;
  }
};

// READ
export const getCandidates = async (): Promise<Candidate[]> => {
  try {
    console.log("📖 GET CANDIDATES - Starting...");
    console.log("🌐 API_BASE_URL:", API_BASE_URL);
    
    const response = await fetch(`${API_BASE_URL}/candidate`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("📡 GET Response received:");
    console.log("  Status:", response.status);
    console.log("  Status Text:", response.statusText);

    if (!response.ok) {
      console.error("❌ GET Response not OK");
      throw new Error("Failed to fetch candidates");
    }

    const data = await response.json();
    console.log("✅ GET Success response data:", data);
    console.log("✅ Returning candidates:", data.data.candidates);
    
    return data.data.candidates;
  } catch (error) {
    console.error("💥 Error in getCandidates:", error);
    throw error;
  }
};

// UPDATE
export const updateCandidate = async (
  id: number,
  candidateData: CandidateUpdatePayload
): Promise<any> => {
  try {
    console.log("🔄 UPDATE CANDIDATE - Starting...");
    console.log("🆔 Candidate ID:", id);
    console.log("📝 Input update data:", candidateData);
    console.log("🌐 API_BASE_URL:", API_BASE_URL);

    // Filter out undefined or null values
    const patchPayload = Object.fromEntries(
      Object.entries(candidateData).filter(([_, v]) => v !== undefined && v !== null)
    );
    
    console.log("🔍 Filtered payload (before status mapping):", patchPayload);
    
    // API uses 'status' not 'statusName'
    if (patchPayload.statusName !== undefined) {
      patchPayload.status = patchPayload.statusName;
      delete patchPayload.statusName;
      console.log("🔄 Mapped statusName to status:", patchPayload.status);
    }
    
    console.log("📦 Final PATCH payload:", patchPayload);
    console.log("📦 Payload as JSON string:", JSON.stringify(patchPayload));
    
    const response = await fetch(`${API_BASE_URL}/candidate/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patchPayload), 
    });

    console.log("📡 PATCH Response received:");
    console.log("  Status:", response.status);
    console.log("  Status Text:", response.statusText);
    console.log("  Headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error("❌ PATCH Response not OK");
      try {
        const errorData = await response.json();
        console.error("🚨 PATCH Error Data:", errorData);
        throw new Error(errorData.error || "Failed to update candidate data");
      } catch (parseError) {
        console.error("🚨 Could not parse PATCH error:", parseError);
        throw new Error("Failed to update candidate data");
      }
    }

    const data = await response.json();
    console.log("✅ PATCH Success response data:", data);
    console.log("✅ Returning updated candidate:", data.data);
    
    return data.data; 
  } catch (error) {
    console.error("💥 Error in updateCandidate:", error);
    throw error;
  }
};

// DELETE
export const deleteCandidate = async (id: number): Promise<boolean> => {
  try {
    console.log("🗑️ DELETE CANDIDATE - Starting...");
    console.log("🆔 Candidate ID:", id);
    console.log("🌐 API_BASE_URL:", API_BASE_URL);
    
    const response = await fetch(`${API_BASE_URL}/candidate/${id}`, {
      method: "DELETE",
    });

    console.log("📡 DELETE Response received:");
    console.log("  Status:", response.status);
    console.log("  Status Text:", response.statusText);

    if (!response.ok) {
      console.error("❌ DELETE Response not OK");
      throw new Error("Failed to delete candidate");
    }

    console.log("✅ DELETE Success");
    return true;
  } catch (error) {
    console.error("💥 Error in deleteCandidate:", error);
    throw error;
  }
};

// Upload/Replace resume for existing candidate
export const uploadResume = async (candidateId: number, resumeFile: File): Promise<any> => {
  try {
    console.log("📄 UPLOAD RESUME - Starting...");
    console.log("🆔 Candidate ID:", candidateId);
    console.log("📁 Resume file details:", {
      name: resumeFile.name,
      size: resumeFile.size,
      type: resumeFile.type
    });
    console.log("🌐 API_BASE_URL:", API_BASE_URL);
    
    const formData = new FormData();
    formData.append("resume", resumeFile);
    
    console.log("📦 FormData contents:");
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: [FILE] ${value.name} (${value.size} bytes, ${value.type})`);
      } else {
        console.log(`  ${key}: "${value}"`);
      }
    }
    
    const response = await fetch(`${API_BASE_URL}/candidate/${candidateId}/resume`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: formData,
    });
    
    console.log("📡 UPLOAD Response received:");
    console.log("  Status:", response.status);
    console.log("  Status Text:", response.statusText);
    
    if (!response.ok) {
      console.error("❌ UPLOAD Response not OK");
      throw new Error("Failed to upload resume");
    }
    
    const data = await response.json();
    console.log("✅ UPLOAD Success response data:", data);
    return data;
  } catch (error) {
    console.error("💥 Error in uploadResume:", error);
    throw error;
  }
};

// Download resume
export const downloadResume = (candidateId: number): string => {
  const downloadUrl = `${API_BASE_URL}/candidate/${candidateId}/resume`;
  console.log("📥 DOWNLOAD RESUME URL generated:", downloadUrl);
  console.log("🆔 Candidate ID:", candidateId);
  return downloadUrl;
};