export const APP_SCHEMA_VERSION = "2";
export const APP_SCHEMA_VERSION_STORAGE_KEY = "app_schema_version";

/**
 * Table state keys in localStorage must start with one of these prefixes.
 * For all new table persistence, prefer `table:<module>:<state>` naming
 * (for example: `table:candidate:columns`, `table:candidate:pagination`).
 * Keeping a stable prefix allows schema-version invalidation to clear all
 * table-related keys automatically without per-key maintenance.
 */
export const TABLE_STORAGE_PREFIXES = [
  "candidateTable",
  "member-management",
  "job-profile",
  "job-profile-requirements",
  "interview-tracker",
  "departmentTable",
  "clientTable",
  "contact",
  "lookup",
  "table:",
] as const;

export const isTableStorageKey = (key: string): boolean =>
  TABLE_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix));

const resolveStorage = (): Storage | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
};

export const initializeAppSchemaVersion = (storage?: Storage): void => {
  const targetStorage = storage ?? resolveStorage();

  if (!targetStorage) {
    return;
  }

  try {
    const storedVersion = targetStorage.getItem(APP_SCHEMA_VERSION_STORAGE_KEY);

    if (storedVersion === APP_SCHEMA_VERSION) {
      return;
    }

    Object.keys(targetStorage).forEach((key) => {
      if (isTableStorageKey(key)) {
        targetStorage.removeItem(key);
      }
    });

    targetStorage.setItem(APP_SCHEMA_VERSION_STORAGE_KEY, APP_SCHEMA_VERSION);
  } catch (error) {
    console.warn("Failed to initialize app schema version in localStorage", error);
  }
};
