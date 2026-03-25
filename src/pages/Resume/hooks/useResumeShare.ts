import { useState, useCallback, useEffect, type MutableRefObject } from "react";
import type { Toast } from "primereact/toast";
import { createResumeShareLink } from "../services/useResume";

export type UseResumeShareParams = {
  candidateId: number | null;
  jobRole: string;
  accessToken: string | null;
  toastRef: MutableRefObject<Toast | null>;
  visible: boolean;
};

/**
 * Handles resume share link generation and Copy / WhatsApp / Email flows.
 *
 * The share URL is prefetched when the modal opens so Copy / WhatsApp / Email
 * can run synchronously on click. Browsers cancel mailto: and often block
 * window.open after an await, because that breaks the user gesture chain.
 */
export function useResumeShare({
  candidateId,
  jobRole,
  accessToken,
  toastRef,
  visible,
}: UseResumeShareParams) {
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [popupBlockedHint, setPopupBlockedHint] = useState(false);

  useEffect(() => {
    if (!visible) {
      setShareUrl(null);
      setPopupBlockedHint(false);
      setLoading(false);
      return;
    }

    if (candidateId == null || !accessToken) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    createResumeShareLink(accessToken, candidateId)
      .then((data) => {
        if (!cancelled) setShareUrl(data.shareUrl);
      })
      .catch(() => {
        if (!cancelled) {
          toastRef.current?.show({
            severity: "error",
            summary: "Share failed",
            detail: "Could not generate share link. Close the dialog and try again.",
            life: 5000,
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [visible, candidateId, accessToken, toastRef]);

  const buildMessage = useCallback(
    (url: string) => {
      const role = jobRole?.trim();
      const tail = role ? `${role} role` : "this role";
      return `Check out this Resume: ${url} for ${tail}`;
    },
    [jobRole]
  );

  const copyLink = useCallback(async () => {
    if (!shareUrl) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Not ready",
        detail: "Wait for the link to finish generating.",
        life: 3000,
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      toastRef.current?.show({
        severity: "success",
        summary: "Copied",
        detail: "Link copied",
        life: 2500,
      });
    } catch {
      toastRef.current?.show({
        severity: "error",
        summary: "Copy failed",
        detail:
          "Could not copy the link. Try again or use HTTPS — or copy from the address bar after opening the link in a new tab.",
        life: 5000,
      });
    }
  }, [shareUrl, toastRef]);

  const shareViaWhatsApp = useCallback(() => {
    if (!shareUrl) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Not ready",
        detail: "Wait for the link to finish generating.",
        life: 3000,
      });
      return;
    }
    const message = buildMessage(shareUrl);
    const w = window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank"
    );
    setPopupBlockedHint(!w);
  }, [shareUrl, buildMessage, toastRef]);

  /** Must stay synchronous after click — no await before mailto (browser cancels otherwise). */
  const shareViaEmail = useCallback(() => {
    if (!shareUrl) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Not ready",
        detail: "Wait for the link to finish generating.",
        life: 3000,
      });
      return;
    }
    const message = buildMessage(shareUrl);
    window.location.href = `mailto:?subject=${encodeURIComponent("Resume Sharing")}&body=${encodeURIComponent(message)}`;
  }, [shareUrl, buildMessage, toastRef]);

  return {
    loading,
    shareUrl,
    popupBlockedHint,
    setPopupBlockedHint,
    copyLink,
    shareViaWhatsApp,
    shareViaEmail,
  };
}
