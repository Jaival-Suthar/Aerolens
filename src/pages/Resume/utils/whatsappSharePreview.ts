import type { Candidate, CandidateCreateData } from "../types/resumeTypes";

const currencySymbols: Record<string, string> = {
  EUR: "€",
  USD: "$",
  INR: "₹",
  GBP: "£",
  AED: "د.إ",
};

function linkedInLine(url: string | null | undefined): string {
  const t = url?.trim();
  if (!t) return "N/A";
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  return `https://${t}`;
}

function formatCtcLine(
  amount: number | null | undefined,
  currencyId: number | null | undefined,
  typeId: number | null | undefined,
  createData: CandidateCreateData | null
): string {
  if (amount == null || amount === undefined || Number.isNaN(Number(amount))) return "N/A";

  const currencyName = createData?.currencies?.find((c) => c.currencyId === currencyId)?.currencyName;
  const typeName = createData?.compensationTypes?.find((t) => t.compensationTypeId === typeId)?.compensationTypeName;

  const symbol = currencySymbols[currencyName || ""] || currencyName || "";
  const typeLabel = typeName?.trim() || "Annual";
  const formatted = new Intl.NumberFormat("en-IN").format(Number(amount));

  return `${symbol} ${formatted} ${typeLabel}`.trim();
}

function experienceLine(years: number | null | undefined): string {
  if (years == null || years === undefined || Number.isNaN(Number(years))) return "N/A";
  return `${years} years`;
}

function noticeLine(notice: number | null | undefined): string {
  if (notice == null || notice === undefined) return "N/A";
  if (notice === 0) return "Immediate";
  return `${notice} days`;
}

/**
 * Client-side fallback matching WhatsApp template body vars {{1}}–{{8}} (same shape as server).
 */
export function buildWhatsAppSharePreviewText(
  candidate: Candidate,
  createData: CandidateCreateData | null
): string {
  const fullName = candidate.candidateName?.trim() || "N/A";
  const contact = candidate.contactNumber?.trim() || "N/A";
  const email = candidate.email?.trim() || "N/A";
  const linkedIn = candidate.linkedinProfileUrl?.trim() ? linkedInLine(candidate.linkedinProfileUrl) : "N/A";

  return [
    "*Candidate Details*",
    "",
    `Full Name: ${fullName}`,
    `Contact Number: ${contact}`,
    `Email ID: ${email}`,
    `LinkedIn: ${linkedIn}`,
    `Years of Experience: ${experienceLine(candidate.experienceYears)}`,
    `Current CTC: ${formatCtcLine(
      candidate.currentCTCAmount,
      candidate.currentCTCCurrencyId,
      candidate.currentCTCTypeId,
      createData
    )}`,
    `Expected CTC: ${formatCtcLine(
      candidate.expectedCTCAmount,
      candidate.expectedCTCCurrencyId,
      candidate.expectedCTCTypeId,
      createData
    )}`,
    `Notice Period: ${noticeLine(candidate.noticePeriod)}`,
  ].join("\n");
}
