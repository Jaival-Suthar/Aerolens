import {
  ApiJobProfile,
  JobProfile
} from "../types/jobProfileTypes";

import {
  textToParagraphSection,
  textToBulletSection
} from "./richSectionHelpers";

export const mapApiToJobProfile = (
  api: ApiJobProfile
): JobProfile => {
  return {
    id: api.jobProfileId,

    position: api.jobRole || "",
    experience: api.experienceText || "",

    // Paragraph
    overview: textToParagraphSection(api.jobOverview),

    // Tech
    techSpecifications: Array.isArray(api.techSpecifications)
      ? api.techSpecifications.map(t => ({
          id: t.lookupId,
          label: t.value
        }))
      : [],

    // Bullets
    responsibilities: textToBulletSection(api.keyResponsibilities || ""),

    requiredSkills: textToBulletSection(api.requiredSkillsText || ""),

    niceToHave: textToBulletSection(api.niceToHave || ""),

    // JD
    jdFileName: api.jdFileName,
    jdOriginalName: api.jdOriginalName,
    jdUploadDate: api.jdUploadDate,

    createdAt: api.createdAt,
    updatedAt: api.updatedAt
  };
};
