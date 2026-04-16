import { describe, it, expect } from "vitest";
import {
  ALL_INTERVIEW_TRACKER_COLUMNS,
  DEFAULT_INTERVIEW_TRACKER_COLUMNS,
} from "./InterviewTrackerColumns";

describe("InterviewTrackerColumns", () => {
  it("lists all column definitions with field and header", () => {
    expect(ALL_INTERVIEW_TRACKER_COLUMNS.length).toBeGreaterThan(5);
    expect(ALL_INTERVIEW_TRACKER_COLUMNS.every((c) => c.field && c.header)).toBe(
      true
    );
  });

  it("default visible columns are a subset of known fields", () => {
    const fields = new Set(ALL_INTERVIEW_TRACKER_COLUMNS.map((c) => c.field));
    DEFAULT_INTERVIEW_TRACKER_COLUMNS.forEach((f) => {
      expect(fields.has(f)).toBe(true);
    });
  });
});
