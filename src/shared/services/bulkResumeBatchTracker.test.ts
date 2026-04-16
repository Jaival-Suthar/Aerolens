import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getResumeBulkStatus } from "../../pages/Resume/services/useResume";
import { showGlobalToast } from "./globalToastService";
import {
  POLLING_INTERVAL,
  MAX_POLL_ATTEMPTS,
  RESUME_BULK_BATCH_FINISHED_EVENT,
  startBulkResumeBatchTracking,
  stopBulkResumeBatchTracking,
} from "./bulkResumeBatchTracker";

vi.mock("../../pages/Resume/services/useResume", () => ({
  getResumeBulkStatus: vi.fn(),
}));

vi.mock("./globalToastService", () => ({
  showGlobalToast: vi.fn(),
}));

const makeStatusResponse = (status: "PROCESSING" | "COMPLETED" | "FAILED") => ({
  status: "success" as const,
  batchId: "batch-1",
  data: {
    status,
    totalFiles: 10,
    processed: status === "COMPLETED" ? 10 : 5,
    linked: 4,
    skipped_no_match: 1,
    skipped_already_exists: 2,
    failed: status === "FAILED" ? 3 : 0,
    errorMessage: status === "FAILED" ? "Batch failed" : null,
    createdAt: "2026-01-01T00:00:00.000Z",
    completedAt: status === "PROCESSING" ? null : "2026-01-01T00:10:00.000Z",
  },
});

describe("bulkResumeBatchTracker", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    localStorage.setItem("accessToken", "mock-token-123");
    vi.mocked(getResumeBulkStatus).mockReset();
    vi.mocked(showGlobalToast).mockReset();
    stopBulkResumeBatchTracking();
  });

  afterEach(() => {
    stopBulkResumeBatchTracking();
    vi.useRealTimers();
  });

  it("polls status every 5 seconds", async () => {
    vi.mocked(getResumeBulkStatus).mockResolvedValue(
      makeStatusResponse("PROCESSING")
    );

    startBulkResumeBatchTracking("batch-1");

    await vi.advanceTimersByTimeAsync(POLLING_INTERVAL - 1);
    expect(getResumeBulkStatus).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(getResumeBulkStatus).toHaveBeenCalledTimes(1);
    expect(getResumeBulkStatus).toHaveBeenCalledWith(
      "mock-token-123",
      "batch-1"
    );
  });

  it("shows completion toast, emits event, and stops polling on COMPLETED", async () => {
    const finishedListener = vi.fn();
    window.addEventListener(RESUME_BULK_BATCH_FINISHED_EVENT, finishedListener);

    vi.mocked(getResumeBulkStatus).mockResolvedValue(
      makeStatusResponse("COMPLETED")
    );

    startBulkResumeBatchTracking("batch-1");
    await vi.advanceTimersByTimeAsync(POLLING_INTERVAL);

    expect(showGlobalToast).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "success",
        summary: "Resume Upload Completed",
      })
    );
    expect(finishedListener).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(POLLING_INTERVAL);
    expect(getResumeBulkStatus).toHaveBeenCalledTimes(1);

    window.removeEventListener(
      RESUME_BULK_BATCH_FINISHED_EVENT,
      finishedListener
    );
  });

  it("stops the previous tracker when a new batch starts", async () => {
    vi.mocked(getResumeBulkStatus).mockResolvedValue(
      makeStatusResponse("PROCESSING")
    );

    startBulkResumeBatchTracking("batch-1");
    startBulkResumeBatchTracking("batch-2");

    await vi.advanceTimersByTimeAsync(POLLING_INTERVAL);

    expect(getResumeBulkStatus).toHaveBeenCalledTimes(1);
    expect(getResumeBulkStatus).toHaveBeenLastCalledWith(
      "mock-token-123",
      "batch-2"
    );
  });

  it("shows error toast and emits on FAILED", async () => {
    const finishedListener = vi.fn();
    window.addEventListener(RESUME_BULK_BATCH_FINISHED_EVENT, finishedListener);
    vi.mocked(getResumeBulkStatus).mockResolvedValue(makeStatusResponse("FAILED"));

    startBulkResumeBatchTracking("batch-fail");
    await vi.advanceTimersByTimeAsync(POLLING_INTERVAL);

    expect(showGlobalToast).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "error",
        summary: "Batch Failed",
      })
    );
    expect(finishedListener).toHaveBeenCalled();
    window.removeEventListener(
      RESUME_BULK_BATCH_FINISHED_EVENT,
      finishedListener
    );
  });

  it("ignores empty batch id", () => {
    startBulkResumeBatchTracking("");
    expect(getResumeBulkStatus).not.toHaveBeenCalled();
  });

  it("stops polling after max attempts", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.mocked(getResumeBulkStatus).mockResolvedValue(
      makeStatusResponse("PROCESSING")
    );

    startBulkResumeBatchTracking("batch-timeout");
    await vi.advanceTimersByTimeAsync(POLLING_INTERVAL * (MAX_POLL_ATTEMPTS + 2));

    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
