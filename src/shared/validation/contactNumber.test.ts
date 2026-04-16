import { describe, it, expect } from "vitest";
import {
  isValidContactNumber,
  CONTACT_NUMBER_ERROR_MESSAGE,
} from "./contactNumber";

describe("contactNumber validation", () => {
  it("exports a stable error message string", () => {
    expect(CONTACT_NUMBER_ERROR_MESSAGE).toContain("10");
    expect(CONTACT_NUMBER_ERROR_MESSAGE.length).toBeGreaterThan(10);
  });

  it("rejects empty or whitespace-only input", () => {
    expect(isValidContactNumber("")).toBe(false);
    expect(isValidContactNumber("   ")).toBe(false);
  });

  it("rejects characters outside allowed set", () => {
    expect(isValidContactNumber("+1 234 abc")).toBe(false);
  });

  it("accepts 10–15 digits with optional formatting", () => {
    expect(isValidContactNumber("+1 (555) 123-4567")).toBe(true);
    expect(isValidContactNumber("1234567890")).toBe(true);
    expect(isValidContactNumber("+123456789012345")).toBe(true);
  });

  it("rejects too few or too many digits", () => {
    expect(isValidContactNumber("123456789")).toBe(false);
    expect(isValidContactNumber("+1234567890123456")).toBe(false);
  });

  it("trims before validating", () => {
    expect(isValidContactNumber("  1234567890  ")).toBe(true);
  });
});
