import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import type { Toast } from "primereact/toast";
import { useResumeShare } from "./useResumeShare";
import * as useResume from "../services/useResume";

vi.mock("../services/useResume", () => ({
  createResumeShareLink: vi.fn(),
}));

describe("useResumeShare", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      "navigator",
      Object.assign(navigator, {
        clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
      })
    );
  });

  function toastRef() {
    return { current: { show: vi.fn() } } as React.RefObject<Toast | null>;
  }

  it("generates share URL when visible with candidate and token", async () => {
    vi.mocked(useResume.createResumeShareLink).mockResolvedValue({
      shareUrl: "https://share.example/x",
    });

    const ref = toastRef();

    const { result, rerender } = renderHook(
      (visible: boolean) =>
        useResumeShare({
          candidateId: 5,
          jobRole: "Engineer",
          accessToken: "t",
          toastRef: ref,
          visible,
        }),
      { initialProps: false }
    );

    rerender(true);

    await waitFor(() => {
      expect(result.current.shareUrl).toBe("https://share.example/x");
    });

    expect(useResume.createResumeShareLink).toHaveBeenCalledWith("t", 5);
  });

  it("shareViaWhatsApp encodes message with trimmed job role", async () => {
    vi.mocked(useResume.createResumeShareLink).mockResolvedValue({
      shareUrl: "https://u",
    });
    const ref = toastRef();
    const open = vi.spyOn(window, "open").mockReturnValue(null);

    const { result, rerender } = renderHook(
      (visible: boolean) =>
        useResumeShare({
          candidateId: 1,
          jobRole: "  Lead  ",
          accessToken: "t",
          toastRef: ref,
          visible,
        }),
      { initialProps: false }
    );

    rerender(true);
    await waitFor(() => expect(result.current.shareUrl).toBeTruthy());

    await act(async () => {
      result.current.shareViaWhatsApp();
    });

    const url = open.mock.calls[0][0] as string;
    expect(url).toContain(encodeURIComponent("Lead role"));
    open.mockRestore();
  });

  it("copyLink warns when shareUrl missing", async () => {
    const ref = toastRef();
    const { result } = renderHook(() =>
      useResumeShare({
        candidateId: 1,
        jobRole: "R",
        accessToken: "t",
        toastRef: ref,
        visible: false,
      })
    );

    await act(async () => {
      await result.current.copyLink();
    });

    expect(ref.current?.show).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "warn" })
    );
  });

  it("copyLink writes clipboard when URL ready", async () => {
    vi.mocked(useResume.createResumeShareLink).mockResolvedValue({
      shareUrl: "https://copy-me",
    });
    const ref = toastRef();

    const { result, rerender } = renderHook(
      (visible: boolean) =>
        useResumeShare({
          candidateId: 1,
          jobRole: "R",
          accessToken: "t",
          toastRef: ref,
          visible,
        }),
      { initialProps: false }
    );

    rerender(true);
    await waitFor(() => expect(result.current.shareUrl).toBe("https://copy-me"));

    await act(async () => {
      await result.current.copyLink();
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("https://copy-me");
  });

  it("shows error toast when share link fails", async () => {
    vi.mocked(useResume.createResumeShareLink).mockRejectedValue(new Error("x"));
    const ref = toastRef();

    const { rerender } = renderHook(
      (visible: boolean) =>
        useResumeShare({
          candidateId: 1,
          jobRole: "R",
          accessToken: "t",
          toastRef: ref,
          visible,
        }),
      { initialProps: false }
    );

    rerender(true);

    await waitFor(() => {
      expect(ref.current?.show).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "error" })
      );
    });
  });
});
