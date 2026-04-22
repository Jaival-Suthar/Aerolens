// // jobProfile.types.ts
// import { RichSection } from "./richText.types";
// /* -------------------- API Types -------------------- */
// export interface ApiTechSpecification {
//   lookupId: number;
//   value: string;
// }

// // Raw Backend DTO
// export interface ApiJobProfile {
//   jobProfileId: number;

//   position: string;
//   experience: string;
//   experienceMinYears: number;
//   experienceMaxYears: number;

//   overview?: RichSection;
//   responsibilities?: RichSection;
//   requiredSkills?: RichSection;
//   niceToHave?: RichSection;

//   techSpecifications: ApiTechSpecification[];

//   jdFileName?: string | null;
//   jdOriginalName?: string | null;
//   jdUploadDate?: string | null;

//   createdAt: string;
//   updatedAt: string;
// }

// // Generic API Wrapper
// export interface ApiResponse<T> {
//   success: boolean;
//   message: string;
//   data: T;
// }

// // /* -------------------- Rich Text Types -------------------- */

// // export type BulletNode = {
// //   id: string;
// //   text: string;
// //   children?: BulletNode[];
// // };

// // export type ParagraphNode = {
// //   id: string;
// //   text: string;
// // };

// // export type RichSection =
// //   | {
// //       type: "paragraph";
// //       content: ParagraphNode[];
// //     }
// //   | {
// //       type: "bullets";
// //       content: BulletNode[];
// //     };

// /* -------------------- UI Model -------------------- */

// export interface JobProfile {
//   id: number;

//   position: string;
//   experience: string;
//   experienceMinYears?: number;
//   experienceMaxYears?: number;

//   overview?: RichSection;
//   responsibilities?: RichSection;
//   requiredSkills?: RichSection;
//   niceToHave?: RichSection;

//   techSpecifications: {
//     id: number;
//     label: string;
//   }[];

//   jdFileName?: string | null;
//   jdOriginalName?: string | null;
//   jdUploadDate?: string | null;

//   createdAt?: string;
//   updatedAt?: string;
// }
// types/jobProfileTypes.ts

/* -------------------- API Types -------------------- */

export interface ApiTechSpecification {
  techSpecificationId: number;
  techSpecificationName: string;
}

export interface ApiJobProfile {
  jobProfileId: number;

  position: string;
  experience: string;

  overview: string | null;
  responsibilities: string | null;
  requiredSkills: string | null;
  niceToHave: string | null;

  experienceMinYears?: number;
  experienceMaxYears?: number;

  jdFileName: string | null;
  jdOriginalName: string | null;
  jdUploadDate: string | null;

  createdAt: string;
  updatedAt: string;

  techSpecifications: ApiTechSpecification[];
}

/* -------------------- UI Model -------------------- */

export interface JobProfile {
  id: number;

  position: string;
  experience: string;

  overview: string;

  responsibilities: string[];
  requiredSkills: string[];
  niceToHave: string[];

  techSpecifications: {
    id: number;
    label: string;
  }[];

  jdFileName?: string | null;
  jdOriginalName?: string | null;
  jdUploadDate?: string | null;

  createdAt?: string;
  updatedAt?: string;
}

/* -------------------- API Wrapper -------------------- */

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface JobProfileDeletedRecord {
  jobProfileId: number;
  jobRole: string;
  deleted_at: string | null;
}

export interface JobProfileDeletedResponse {
  success: boolean;
  message: string;
  data: JobProfileDeletedRecord[];
}
