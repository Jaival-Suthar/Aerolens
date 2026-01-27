// jobProfileAddEdit.types.ts

import { JobProfile, RichSection } from "./jobProfileTypes";

/* -------------------- Props -------------------- */

export interface JobProfileAddEditProps {
  visible: boolean;
  onHide: () => void;
  selectedJobProfile: JobProfile | null;
  onSuccess: () => void;
  techOptions: {
    id: number;
    label: string;
  }[];
}

/* -------------------- Form State -------------------- */

export interface AddEditJobProfile {
  position: string;
  experience: string;

  overview: RichSection[];
  techSpecifications: number[];
  responsibilities?: RichSection;
  requiredSkills?: RichSection;
  niceToHave?: RichSection;

  jdFile: File | null;
}

/* -------------------- Parsed API Data -------------------- */

export interface ParsedJobProfileData {
  position: string;
  experience: string;

  overview: string;

  responsibilities: string[];
  requiredSkills: string[];
  niceToHave: string[];
}
