// util/jobProfileMapper.ts

import {
  ApiJobProfile,
  JobProfile
} from "../types/jobProfileTypes";


/* -------------------- Helpers -------------------- */

// const parseList = (text?: string | null): string[] => {
//   if (!text) return [];

//   return text
//     // Normalize weird bullets
//     .replace(/[•▪▫◦]/g, "•")

//     // Remove double spaces
//     .replace(/\s+/g, " ")

//     // Normalize new lines
//     .replace(/\r\n/g, "\n")

//     // Split by bullet OR line break
//     .split(/\n|•/)

//     .map(line =>
//       line
//         .replace(/^[-–—•]\s*/, "") // remove leading symbols
//         .trim()
//     )

//     // // Remove junk lines
//     // .filter(line =>
//     //   line.length > 3 &&              // ignore tiny junk
//     //   !line.endsWith(":") &&          // ignore headings
//     //   !/^[A-Z\s&]+:$/.test(line)      // ignore section titles
//     // );
// };
// const parseList = (text?: string | null): string[] => {
//   if (!text) return [];

//   return text
//     // Normalize bullets
//     .replace(/[•▪▫◦]/g, "•")

//     // Normalize line endings
//     .replace(/\r\n/g, "\n")

//     // 🔥 Fix merged headings: ". Title :" → ".\nTitle:"
//     .replace(
//       /([a-z0-9])\.\s+([A-Z][A-Za-z\s&]+)\s*:/g,
//       "$1.\n$2:"
//     )

//     // Fix multiple spaces
//     .replace(/\s+/g, " ")

//     // Split
//     .split(/\n|•/)

//     .map(line =>
//       line
//         .replace(/^[-–—•]\s*/, "")
//         .trim()
//     )

//     .filter(line => line.length > 2);
// };
const parseList = (text?: string | null): string[] => {
  if (!text) return [];

  return text
    .split(/\r?\n+/)
    .map(line => line.trim())
    .filter(Boolean);
};




/* -------------------- Mapper -------------------- */

export const mapApiToJobProfile = (
  api: ApiJobProfile
): JobProfile => {
  return {
    id: api.jobProfileId,

    position: api.position,
    experience: api.experience,

    overview: api.overview || "",

    responsibilities: parseList(api.responsibilities),
    requiredSkills: parseList(api.requiredSkills),
    niceToHave: parseList(api.niceToHave),

    techSpecifications: api.techSpecifications.map(t => ({
      id: t.techSpecificationId,
      label: t.techSpecificationName
    })),

    jdFileName: api.jdFileName,
    jdOriginalName: api.jdOriginalName,
    jdUploadDate: api.jdUploadDate,

    createdAt: api.createdAt,
    updatedAt: api.updatedAt
  };
};
