// jobProfile.types.ts

/* -------------------- API Types -------------------- */
export interface ApiTechSpecification {
  lookupId: number;
  value: string;
}

// Raw Backend DTO
export interface ApiJobProfile {
  jobProfileId: number;

  jobRole: string;
  jobOverview: string;
  keyResponsibilities: string;
  requiredSkillsText: string;
  niceToHave: string | null;

  experienceText: string;
  experienceMinYears: number;
  experienceMaxYears: number;

  jdFileName: string | null;
  jdOriginalName: string | null;
  jdUploadDate: string | null;

  createdAt: string;
  updatedAt: string;
  techSpecifications: ApiTechSpecification[];
}

// Generic API Wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/* -------------------- Rich Text Types -------------------- */

export type BulletNode = {
  id: string;
  text: string;
  children?: BulletNode[];
};

export type ParagraphNode = {
  id: string;
  text: string;
};

export type RichSection =
  | {
      type: "paragraph";
      content: ParagraphNode[];
    }
  | {
      type: "bullets";
      content: BulletNode[];
    };

/* -------------------- UI Model -------------------- */

export type JobProfile = {
  id: number;

  position: string;
  experience: string;

  overview: RichSection[];

  responsibilities?: RichSection;
  requiredSkills?: RichSection;
  niceToHave?: RichSection;
  techSpecifications: {
    id: number;
    label: string;
  }[];
  // 🔥 JD Metadata (needed for preview/download later)
  jdFileName?: string | null;
  jdOriginalName?: string | null;
  jdUploadDate?: string | null;

  // 🔥 Audit (optional but useful)
  createdAt?: string;
  updatedAt?: string;
};
