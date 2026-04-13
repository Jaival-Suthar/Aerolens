import { describe, it, expect } from "vitest";
import { buildWhatsAppSharePreviewText } from "./whatsappSharePreview";
import type { Candidate, CandidateCreateData } from "../types/resumeTypes";

describe("buildWhatsAppSharePreviewText", () => {
  const createData: CandidateCreateData = {
    recruiters: [],
    vendors: [],
    locations: [],
    jobProfiles: [],
    currencies: [{ currencyId: 1, currencyName: "USD" }],
    compensationTypes: [{ compensationTypeId: 1, compensationTypeName: "Hourly" }],
    workModes: [],
  };

  const base: Candidate = {
    candidateId: 1,
    candidateName: "Test User",
    contactNumber: "123",
    email: "t@e.com",
    recruiterId: null,
    recruiterName: null,
    recruiterContact: null,
    recruiterEmail: null,
    jobProfileRequirementId: 1,
    jobRole: "Dev",
    noticePeriod: 10,
    experienceYears: 3,
    statusName: "New",
    expectedLocation: null,
    linkedinProfileUrl: null,
    currentCTCAmount: 40,
    currentCTCCurrencyId: 1,
    currentCTCTypeId: 1,
    expectedCTCAmount: 60,
    expectedCTCCurrencyId: 1,
    expectedCTCTypeId: 1,
  };

  it("builds candidate details block with CTC lines", () => {
    const text = buildWhatsAppSharePreviewText(base, createData);
    expect(text).toContain("*Candidate Details*");
    expect(text).toContain("Full Name: Test User");
    expect(text).toContain("Contact Number: 123");
    expect(text).toContain("Email ID: t@e.com");
    expect(text).toContain("LinkedIn: N/A");
    expect(text).toContain("Years of Experience: 3 years");
    expect(text).toContain("Current CTC:");
    expect(text).toContain("$");
    expect(text).toContain("Hourly");
    expect(text).toContain("Expected CTC:");
    expect(text).toContain("Notice Period: 10 days");
  });

  it("uses Immediate for zero notice", () => {
    const text = buildWhatsAppSharePreviewText({ ...base, noticePeriod: 0 }, createData);
    expect(text).toContain("Notice Period: Immediate");
  });

  it("formats LinkedIn as full URL when already absolute", () => {
    const withHttp = buildWhatsAppSharePreviewText(
      { ...base, linkedinProfileUrl: "http://linkedin.com/in/x" },
      createData
    );
    expect(withHttp).toContain("LinkedIn: http://linkedin.com/in/x");

    const withHttps = buildWhatsAppSharePreviewText(
      { ...base, linkedinProfileUrl: "https://linkedin.com/in/y" },
      createData
    );
    expect(withHttps).toContain("LinkedIn: https://linkedin.com/in/y");
  });

  it("prefixes bare LinkedIn paths with https://", () => {
    const text = buildWhatsAppSharePreviewText(
      { ...base, linkedinProfileUrl: "linkedin.com/in/z" },
      createData
    );
    expect(text).toContain("LinkedIn: https://linkedin.com/in/z");
  });

  it("uses N/A for invalid or missing experience and CTC", () => {
    const text = buildWhatsAppSharePreviewText(
      {
        ...base,
        experienceYears: null as unknown as number,
        currentCTCAmount: null as unknown as number,
        expectedCTCAmount: NaN as unknown as number,
        candidateName: "   ",
        contactNumber: "",
        email: undefined as unknown as string,
      },
      createData
    );
    expect(text).toContain("Full Name: N/A");
    expect(text).toContain("Contact Number: N/A");
    expect(text).toContain("Email ID: N/A");
    expect(text).toContain("Years of Experience: N/A");
    expect(text).toMatch(/Current CTC:\s*N\/A/);
    expect(text).toMatch(/Expected CTC:\s*N\/A/);
  });

  it("uses EUR symbol from map and Annual when type name missing", () => {
    const data: CandidateCreateData = {
      ...createData,
      currencies: [{ currencyId: 2, currencyName: "EUR" }],
      compensationTypes: [],
    };
    const text = buildWhatsAppSharePreviewText(
      {
        ...base,
        currentCTCAmount: 1000,
        currentCTCCurrencyId: 2,
        currentCTCTypeId: 99,
      },
      data
    );
    expect(text).toContain("€");
    expect(text).toContain("Annual");
  });
});
