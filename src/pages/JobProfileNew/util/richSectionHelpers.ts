import { RichSection } from "../types/jobProfileTypes";

/* =====================================================
   TEXT → RICH (Used ONLY for API → UI mapping)
   ===================================================== */

export const textToParagraphSection = (text?: string): RichSection[] => {
  if (!text?.trim()) return [];

  return [
    {
      type: "paragraph",
      content: [
        {
          id: crypto.randomUUID(),
          text: text.trim()
        }
      ]
    }
  ];
};

export const textToBulletSection = (
  text?: string
): RichSection | undefined => {
  if (!text?.trim()) return undefined;

  // Normalize bullets
  const normalized = text.replace(/[\u2022•●○◦]/g, "•");

  const lines = normalized
    .split(/\n|•/g) // split on newline OR bullet
    .map(l => l.trim())
    .filter(Boolean);

  if (!lines.length) return undefined;

  return {
    type: "bullets",
    content: lines.map(line => ({
      id: crypto.randomUUID(),
      text: line
    }))
  };
};

/* =====================================================
   RICH → TEXT (Used for FormData → API)
   ===================================================== */

export const richSectionToText = (
  section?: RichSection | RichSection[]
): string => {
  if (!section) return "";

  if (Array.isArray(section)) {
    return section
      .map(s => {
        if (s.type === "paragraph") {
          return s.content.map(p => p.text).join(" ");
        }

        return s.content.map(b => b.text).join("\n");
      })
      .join("\n");
  }

  if (section.type === "bullets") {
    return section.content.map(b => b.text).join("\n");
  }

  return section.content.map(p => p.text).join(" ");
};
