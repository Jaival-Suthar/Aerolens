import { getResumeBulkStatus } from "../../pages/Resume/services/useResume";
import type { ResumeBatchStatus } from "../../pages/Resume/types/resumeTypes";
import { showGlobalToast } from "./globalToastService";

export const POLLING_INTERVAL = 5000;
export const MAX_POLLING_DURATION = 10 * 60 * 1000;
export const MAX_POLL_ATTEMPTS = 120;

export const RESUME_BULK_BATCH_FINISHED_EVENT = "resume-bulk-batch-finished";

let activeBatchId: string | null = null;
let pollInterval: ReturnType<typeof setInterval> | null = null;
let pollingStartTime: number | null = null;
let pollAttempts = 0;
let isPollingInProgress = false;

const getAccessToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem("accessToken");
};

const emitBatchFinished = (
  batchId: string,
  status: ResumeBatchStatus["status"]
): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(RESUME_BULK_BATCH_FINISHED_EVENT, {
      detail: { batchId, status },
    })
  );
};

const handleTerminalStatus = (
  batchId: string,
  data: ResumeBatchStatus
): void => {
  if (data.status === "COMPLETED") {
    showGlobalToast({
      severity: "success",
      summary: "Resume Upload Completed",
      detail:
        `Processed: ${data.processed}, Linked: ${data.linked}, ` +
        `No Match: ${data.skipped_no_match}, Existing: ${data.skipped_already_exists}, Failed: ${data.failed}`,
      life: 7000,
    });
  } else if (data.status === "FAILED") {
    showGlobalToast({
      severity: "error",
      summary: "Batch Failed",
      detail: data.errorMessage || "Processing failed",
      life: 6000,
    });
  }

  emitBatchFinished(batchId, data.status);
};

const hasPollingTimedOut = (): boolean => {
  if (!pollingStartTime) {
    return false;
  }

  const elapsed = Date.now() - pollingStartTime;
  return pollAttempts > MAX_POLL_ATTEMPTS || elapsed > MAX_POLLING_DURATION;
};

const pollBatchStatus = async (): Promise<void> => {
  if (!activeBatchId || isPollingInProgress) {
    return;
  }

  const batchId = activeBatchId;
  pollAttempts += 1;

  if (hasPollingTimedOut()) {
    console.warn("Bulk upload polling timed out");
    stopBulkResumeBatchTracking();
    return;
  }

  isPollingInProgress = true;

  try {
    const accessToken = getAccessToken();
    const response = await getResumeBulkStatus(accessToken, batchId);
    const data = response.data;

    if (activeBatchId !== batchId) {
      return;
    }

    if (data.status === "COMPLETED" || data.status === "FAILED") {
      stopBulkResumeBatchTracking();
      handleTerminalStatus(batchId, data);
    }
  } catch (error) {
    console.error("Error while polling bulk resume batch status:", error);
  } finally {
    isPollingInProgress = false;
  }
};

export const stopBulkResumeBatchTracking = (): void => {
  if (pollInterval) {
    clearInterval(pollInterval);
  }

  activeBatchId = null;
  pollInterval = null;
  pollingStartTime = null;
  pollAttempts = 0;
  isPollingInProgress = false;
};

export const startBulkResumeBatchTracking = (batchId: string): void => {
  if (!batchId) {
    return;
  }

  stopBulkResumeBatchTracking();

  activeBatchId = batchId;
  pollingStartTime = Date.now();
  pollAttempts = 0;

  pollInterval = setInterval(() => {
    void pollBatchStatus();
  }, POLLING_INTERVAL);
};
