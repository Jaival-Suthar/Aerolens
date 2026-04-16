import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Toast } from "primereact/toast";
import { registerGlobalToast, showGlobalToast } from "./globalToastService";

describe("globalToastService", () => {
  beforeEach(() => {
    registerGlobalToast(null);
  });

  it("queues messages when no toast is registered, then flushes on register", () => {
    showGlobalToast({ summary: "A", detail: "queued" });

    const show = vi.fn();
    const mockToast = { show } as unknown as Toast;

    registerGlobalToast(mockToast);

    expect(show).toHaveBeenCalledWith(
      expect.objectContaining({ summary: "A", detail: "queued" })
    );
  });

  it("shows immediately when toast is registered", () => {
    const show = vi.fn();
    registerGlobalToast({ show } as unknown as Toast);

    showGlobalToast({ summary: "B", severity: "success" });

    expect(show).toHaveBeenCalledWith(
      expect.objectContaining({ summary: "B", severity: "success" })
    );
  });
});
