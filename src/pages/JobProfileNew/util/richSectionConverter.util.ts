// richSectionConverter.util.ts

import { RichSection, BulletNode, ParagraphNode } from "../types/jobProfileTypes";
import { ParsedJobProfileData } from "../types/jobProfileAddEdit.types";

let idCounter = 0;
const generateId = () => `node_${Date.now()}_${idCounter++}`;

export function convertToRichSections(parsed: ParsedJobProfileData) {
  // Overview as paragraph
  const overview: RichSection[] = parsed.overview
    ? [
        {
          type: "paragraph" as const,
          content: [
            {
              id: generateId(),
              text: parsed.overview
            }
          ]
        }
      ]
    : [];

  // Responsibilities as bullets
  const responsibilities: RichSection | undefined = parsed.responsibilities.length > 0
    ? {
        type: "bullets" as const,
        content: parsed.responsibilities.map(text => ({
          id: generateId(),
          text
        }))
      }
    : undefined;

  // Required Skills as bullets
  const requiredSkills: RichSection | undefined = parsed.requiredSkills.length > 0
    ? {
        type: "bullets" as const,
        content: parsed.requiredSkills.map(text => ({
          id: generateId(),
          text
        }))
      }
    : undefined;

  // Nice to Have as bullets
  const niceToHave: RichSection | undefined = parsed.niceToHave.length > 0
    ? {
        type: "bullets" as const,
        content: parsed.niceToHave.map(text => ({
          id: generateId(),
          text
        }))
      }
    : undefined;

  return {
    overview,
    responsibilities,
    requiredSkills,
    niceToHave
  };
}