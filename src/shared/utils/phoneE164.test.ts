import { describe, it, expect } from "vitest";
import { E164_REGEX, isLikelyE164 } from "./phoneE164";

describe("phoneE164", () => {
  describe("isLikelyE164", () => {
    it("returns true for valid E.164 strings", () => {
      expect(isLikelyE164("+14155552671")).toBe(true);
      expect(isLikelyE164("+919876543210")).toBe(true);
    });

    it("trims whitespace before validating", () => {
      expect(isLikelyE164("  +14155552671  ")).toBe(true);
    });

    it("returns false when plus or length rules fail", () => {
      expect(isLikelyE164("14155552671")).toBe(false);
      expect(isLikelyE164("+0123")).toBe(false);
      expect(isLikelyE164("")).toBe(false);
    });
  });

  describe("E164_REGEX", () => {
    it("matches documented pattern shape", () => {
      expect(E164_REGEX.test("+19995550123")).toBe(true);
      expect(E164_REGEX.test("+1234567")).toBe(false);
    });
  });
});
