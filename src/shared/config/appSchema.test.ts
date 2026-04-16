import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  APP_SCHEMA_VERSION,
  APP_SCHEMA_VERSION_STORAGE_KEY,
  TABLE_STORAGE_PREFIXES,
  initializeAppSchemaVersion,
  isTableStorageKey,
} from "./appSchema";

describe("initializeAppSchemaVersion", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const tableKeys = [
    "candidateTable.visibleColumns",
    "member-management:visible-columns",
    "job-profile:visible-columns",
    "job-profile-requirements:visible-columns",
    "interview-tracker:visible-columns",
    "departmentTablePage",
    "departmentTableRows",
    "clientTablePagination",
    "contact_rows",
    "lookupPagination",
    "table:candidate:filters",
  ];

  const nonTableKeys = [
    "accessToken",
    "auth_email_history",
    "user_theme",
  ];

  it("clears only table keys when schema version mismatches", () => {
    localStorage.setItem(APP_SCHEMA_VERSION_STORAGE_KEY, "1");

    tableKeys.forEach((key, index) => {
      localStorage.setItem(key, `value-${index}`);
    });

    nonTableKeys.forEach((key, index) => {
      localStorage.setItem(key, `non-table-${index}`);
    });

    initializeAppSchemaVersion(localStorage);

    tableKeys.forEach((key) => {
      expect(localStorage.getItem(key)).toBeNull();
    });

    nonTableKeys.forEach((key, index) => {
      expect(localStorage.getItem(key)).toBe(`non-table-${index}`);
    });

    expect(localStorage.getItem(APP_SCHEMA_VERSION_STORAGE_KEY)).toBe(APP_SCHEMA_VERSION);
  });

  it("clears table keys and sets schema version when no version exists", () => {
    tableKeys.forEach((key, index) => {
      localStorage.setItem(key, `value-${index}`);
    });

    initializeAppSchemaVersion(localStorage);

    tableKeys.forEach((key) => {
      expect(localStorage.getItem(key)).toBeNull();
    });

    expect(localStorage.getItem(APP_SCHEMA_VERSION_STORAGE_KEY)).toBe(APP_SCHEMA_VERSION);
  });

  it("keeps table keys when schema version already matches", () => {
    localStorage.setItem(APP_SCHEMA_VERSION_STORAGE_KEY, APP_SCHEMA_VERSION);

    tableKeys.forEach((key, index) => {
      localStorage.setItem(key, `value-${index}`);
    });

    initializeAppSchemaVersion(localStorage);

    tableKeys.forEach((key, index) => {
      expect(localStorage.getItem(key)).toBe(`value-${index}`);
    });
  });

  it("prefix list matches known table key naming", () => {
    tableKeys.forEach((key) => {
      expect(
        TABLE_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix))
      ).toBe(true);
    });
  });

  it("isTableStorageKey is false for unrelated keys", () => {
    expect(isTableStorageKey("accessToken")).toBe(false);
    expect(isTableStorageKey("table:candidate:filters")).toBe(true);
  });

  it("logs a warning when clearing table keys throws", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    localStorage.setItem(APP_SCHEMA_VERSION_STORAGE_KEY, "1");
    localStorage.setItem("lookupPagination", "keep-me");

    const spy = vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("blocked");
    });

    initializeAppSchemaVersion();

    expect(warn).toHaveBeenCalledWith(
      "Failed to initialize app schema version in localStorage",
      expect.any(Error)
    );

    spy.mockRestore();
    warn.mockRestore();
  });
});
