import { CandidatesResponse,Candidate } from "../types/resumeTypes";
// const API_BASE_URL: string = import.meta.env.VITE_BASE_URL;

let candidates: Candidate[] = [
  {
    candidateId: 1,
    candidateName: "John Doe",
    contactNumber: "1234567890",
    email: "john@example.com",
    recruiterName: "Palash",
    jobRole: "Full Stack",
    preferredJobLocation: "Ahemdabad",
    currentCTC: 20,
    expectedCTC: 25,
    noticePeriod: 60,
    experienceYears: 6,
    status: "In Progress",
    linkedinProfileUrl: "https://linkedin.com/in/johndoe"

  }
];
// CREATE
// CREATE
export const createCandidate = async (candidate: Omit<Candidate, "candidateId">) => {
  const newCandidate: Candidate = {
    ...candidate,
    candidateId: Date.now(), // assign a unique ID
  };
  candidates.push(newCandidate);
  return newCandidate;
};
// READ
// Get all candidates
export const getCandidates = async (): Promise<CandidatesResponse> => {
    try {
      // mock data for now
      return { candidates: candidates };
    } catch (error) {
      console.error('Error fetching candidates:', error);
      throw error;
    }
  };
  
// UPDATE
export const updateCandidate = async (id: number, updated: Partial<Candidate>) => {
  candidates = candidates.map(c => (c.candidateId === id ? { ...c, ...updated } : c));
  return candidates.find(c => c.candidateId === id);
};

// DELETE
export const deleteCandidate = async (id: number) => {
  candidates = candidates.filter(c => c.candidateId !== id);
  return true;
};
