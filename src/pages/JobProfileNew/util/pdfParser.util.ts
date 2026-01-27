import * as pdfjsLib from "pdfjs-dist";
import type {
  TextItem,
  TextMarkedContent
} from "pdfjs-dist/types/src/display/api";

// Configure PDF.js worker
// @ts-ignore
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

function isTextItem(
  item: TextItem | TextMarkedContent
): item is TextItem {
  return "str" in item && "transform" in item;
}

/* ============================================================================
   PDF TEXT EXTRACTION
   ============================================================================ */

export async function extractPdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";

  for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {
    const page = await pdf.getPage(pageNo);
    const content = await page.getTextContent();

    let lastY: number | null = null;
    let currentLine = "";

    const items = content.items.sort((a: any, b: any) => {
      if (Math.abs(a.transform[5] - b.transform[5]) > 5) {
        return b.transform[5] - a.transform[5]; // vertical order
      }
      return a.transform[4] - b.transform[4]; // horizontal order
    });

    for (const item of items) {
      if (!isTextItem(item)) continue;

      const text = item.str.trim();
      if (!text) continue;

      const y = item.transform[5];

      if (lastY !== null && Math.abs(y - lastY) > 5) {
        if (currentLine) fullText += currentLine + "\n";
        currentLine = text;
      } else {
        currentLine += (currentLine ? " " : "") + text;
      }

      lastY = y;
    }

    if (currentLine) fullText += currentLine + "\n";
  }

  console.log("📝 RAW EXTRACTED TEXT (preview):", fullText.substring(0, 1200));
  return fullText;
}

/* ============================================================================
   NORMALIZATION
   ============================================================================ */

function normalizeText(text: string): string {
  return text
    // Remove known junk FIRST
    .replace(/\{?\s*Company address needs to be removed\s*\}?/gi, "")
    .replace(/\[\s*Company Address need to be removed\s*\]/gi, "")
    .replace(/AEROLENS India Private Limited[\s\S]*?hr@aerolen\s*s\.net/gi, "") // Remove company footer
    .replace(/www\.aerolens\.net[\s\S]*?hr@aerolens\.com/gi, "")

    // Fix broken/hyphenated words BEFORE other normalization
    .replace(/Responsibili\s*[-–—]\s*ties/gi, "Responsibilities")
    .replace(/Responsibili\s+ties/gi, "Responsibilities")
    .replace(/appli\s*[-–—]\s*cation/gi, "application")
    .replace(/tech\s*[-–—]\s*nical/gi, "technical")
    .replace(/c\s*[-–—]\s*loud/gi, "cloud")
    .replace(/busi\s*[-–—]\s*ness/gi, "business")
    .replace(/W\s*[-–—]\s*eb/gi, "Web")
    .replace(/M\s*[-–—]\s*ySQL/gi, "MySQL")
    .replace(/t\s*[-–—]\s*esting/gi, "testing")
    .replace(/imp\s*[-–—]\s*lementation/gi, "implementation")

    // Normalize bullet characters → actual bullets
    .replace(/[\u2022\u2023\u25CF\u25AA\u00B7•●○◦]/g, "•")

    // Clean up spaces around colons in section headers
    .replace(/Key Responsibilities\s*:/gi, "Key Responsibilities:")
    .replace(/Technical Skills\s*(?:&\s*Experience)?\s*:/gi, "Technical Skills & Experience:")
    .replace(/Required Skills\s*(?:&\s*Experience)?\s*:/gi, "Required Skills & Experience:")
    .replace(/Nice\s*[-–—]?\s*to\s*[-–—]?\s*Have\s*:/gi, "Nice to Have:")
    .replace(/Job Overview\s*:/gi, "Job Overview:")

    // Clean spacing
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/* ============================================================================
   SECTION EXTRACTION
   ============================================================================ */

function extractSection(
  text: string,
  startPattern: RegExp,
  endPattern: RegExp
): string {
  const startMatch = text.match(startPattern);
  if (!startMatch || startMatch.index == null) {
    console.log(`❌ Section not found: ${startPattern}`);
    return "";
  }

  const startIdx = startMatch.index + startMatch[0].length;
  
  const remainingText = text.slice(startIdx);
  const endMatch = remainingText.match(endPattern);
  
  const endIdx = endMatch?.index != null 
    ? startIdx + endMatch.index 
    : text.length;

  const extracted = text.slice(startIdx, endIdx).trim();
  
  console.log(`✅ Extracted "${startPattern.source.substring(0, 30)}..." (${extracted.length} chars)`);
  return extracted;
}

/* ============================================================================
   BULLET EXTRACTION (MERGE CONTINUATION LINES)
   ============================================================================ */

function extractBulletPoints(sectionText: string): string[] {
  if (!sectionText) return [];

  // 1️⃣ Split into top-level blocks (category headers OR bullets)
  const topLevel = sectionText
    .split(/(?:^|\n)\s*(?:•|\d+\))\s*/)

    .map(t => t.trim())
    .filter(Boolean);

  const finalBullets: string[] = [];

  for (const block of topLevel) {
    // 2️⃣ If block contains inner bullets, split again
    if (block.includes("•")) {
      const inner = block
        .split(/\s*•\s+/)
        .map(t => t.trim())
        .filter(Boolean);

      finalBullets.push(...inner);
    } else {
      finalBullets.push(block);
    }
  }

  console.log(`📌 Extracted ${finalBullets.length} bullet points from section`);
  return finalBullets;
}


/* ============================================================================
   MAIN PARSER
   ============================================================================ */

export function parseJobProfileFromText(text: string) {
  const normalized = normalizeText(text);

  console.log("🔧 NORMALIZED TEXT (first 1200 chars):\n", normalized.substring(0, 1200));
  console.log("\n=====================================\n");

  /* ---------- Position ---------- */
  const positionMatch = normalized.match(/Position:\s*(.+?)(?:\n|$)/i);
  const position = positionMatch?.[1]?.trim() ?? "";
  console.log("📍 Position:", position);

  /* ---------- Experience ---------- */
  const experienceMatch = normalized.match(/Experience:\s*(.+?)(?:\n|$)/i);
  const experience = experienceMatch?.[1]?.trim() ?? "";
  console.log("📅 Experience:", experience);

  /* ---------- Job Overview ---------- */
  const overviewText = extractSection(
    normalized,
    /Job Overview:\s*/i,
    /\nKey Responsibilities:/i
  );

  /* ---------- Key Responsibilities ---------- */
  const responsibilitiesText = extractSection(
    normalized,
    /Key Responsibilities:\s*/i,
    /\n(?:Technical Skills|Required Skills)/i
  );

  /* ---------- Technical/Required Skills ---------- */
  const requiredSkillsText = extractSection(
    normalized,
    /(?:Technical Skills|Required Skills)(?:\s*&\s*Experience)?:\s*/i,
    /\n(?:Nice to Have|Desirable Experience|Leadership|$)/i
  );

  /* ---------- Nice to Have ---------- */
  const niceToHaveText = extractSection(
    normalized,
    /(?:Nice to Have|Desirable Experience):\s*/i,
    /\n(?:Leadership|Relocation|$)/i
  );

  /* ---------- Build Final Structure ---------- */
  const result = {
    position,
    experience,

    overview: overviewText
      ? [
          {
            type: "paragraph" as const,
            content: [
              {
                id: crypto.randomUUID(),
                text: overviewText
              }
            ]
          }
        ]
      : [],

    responsibilities: responsibilitiesText
      ? {
          type: "bullets" as const,
          content: extractBulletPoints(responsibilitiesText).map((t, i) => ({
            id: crypto.randomUUID(),
            text: t
          }))
        }
      : undefined,

    requiredSkills: requiredSkillsText
      ? {
          type: "bullets" as const,
          content: extractBulletPoints(requiredSkillsText).map((t, i) => ({
            id: crypto.randomUUID(),
            text: t
          }))
        }
      : undefined,

    niceToHave: niceToHaveText
      ? {
          type: "bullets" as const,
          content: extractBulletPoints(niceToHaveText).map((t, i) => ({
            id: crypto.randomUUID(),
            text: t
          }))
        }
      : undefined
  };

  console.log("\n📦 FINAL PARSED PAYLOAD:");
  console.log("  - Position:", result.position);
  console.log("  - Experience:", result.experience);
  console.log("  - Overview:", result.overview.length > 0 ? `${result.overview[0].content[0].text.substring(0, 50)}...` : "empty");
  console.log("  - Responsibilities:", result.responsibilities?.content.length ?? 0, "items");
  console.log("  - Required Skills:", result.requiredSkills?.content.length ?? 0, "items");
  console.log("  - Nice to Have:", result.niceToHave?.content.length ?? 0, "items");
  if (
  responsibilitiesText &&
  result.responsibilities?.content.length === 1 &&
  responsibilitiesText.includes("•")
) {
  console.warn("⚠️ Bullet collapse detected in Responsibilities");
}
  return result;
}