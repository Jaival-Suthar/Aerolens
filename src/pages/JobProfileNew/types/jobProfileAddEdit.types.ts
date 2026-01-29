// types/jobProfileAddEdit.types.ts

export interface JobProfileAddEditProps {
  visible: boolean;
  onHide: () => void;
  selectedJobProfile: import("./jobProfileTypes").JobProfile | null;
  onSuccess: () => void;
  techOptions: {
    id: number;
    label: string;
  }[];
}

export interface AddEditJobProfile {
  position: string;
  experience: string;

  overview: string;

  responsibilities: string[];
  requiredSkills: string[];
  niceToHave: string[];

  techSpecifications: number[];

  jdFile: File | null;
}
