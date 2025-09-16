import { CandidatesResponse,Candidate } from "../types/resumeTypes";

let candidates: Candidate[] = [
  {
    id: 1,
    name: "John Doe",
    contact: "1234567890",
    email: "john@example.com",
    recruiter: "Palash",
    role: "Full Stack",
    location: "IDC",
    ctc: "20 LPA",
    noticePeriod: "60 days",
    experience: "6 years",
    status: "In Progress",
    linkedin: "https://linkedin.com/in/johndoe"
  }
];

// CREATE
export const createCandidate = async (candidate: Candidate) => {
  candidate.id = Date.now();
  candidates.push(candidate);
  return candidate;
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
  candidates = candidates.map(c => (c.id === id ? { ...c, ...updated } : c));
  return candidates.find(c => c.id === id);
};

// DELETE
export const deleteCandidate = async (id: number) => {
  candidates = candidates.filter(c => c.id !== id);
  return true;
};
