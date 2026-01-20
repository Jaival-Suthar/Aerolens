// jobProfileAddEdit.types.ts

import { JobProfile, RichSection, BulletNode, ParagraphNode } from "./jobProfileTypes";

export interface JobProfileAddEditProps {
  visible: boolean;
  onHide: () => void;
  selectedJobProfile: JobProfile | null;
  onSuccess: () => void;
}

export interface AddEditJobProfile {
  position: string;
  experience: string;
  overview: RichSection[];
  responsibilities?: RichSection;
  requiredSkills?: RichSection;
  niceToHave?: RichSection;
  jdFile: File | null;
}

export interface ParsedJobProfileData {
  position: string;
  experience: string;
  overview: string;
  responsibilities: string[];
  requiredSkills: string[];
  niceToHave: string[];
}