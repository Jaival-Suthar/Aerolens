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
    }
  }, [visible]);

  const ensureShareUrl = useCallback(async () => {
    if (candidateId == null || !accessToken) {
      throw new Error("Missing candidate or session");
    }
    if (shareUrl) return shareUrl;
    setLoading(true);
    try {
      const data = await createResumeShareLink(accessToken, candidateId);
      const url = data.shareUrl;
      setShareUrl(url);
      return url;
    } finally {
      setLoading(false);
    }
  }, [accessToken, candidateId, shareUrl]);

  const buildMessage = useCallback(
    (url: string) => {
      const role = jobRole?.trim();
      const tail = role ? `${role} role` : "this role";
      return `Check out this Resume: ${url} for ${tail}`;
    },
    [jobRole]
  );

  const copyLink = useCallback(async () => {
    try {
      const url = await ensureShareUrl();
      await navigator.clipboard.writeText(url);
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
          "Could not copy the link. Try again or use HTTPS — or use Copy Link after generating once.",
        life: 5000,
      });
    }
  }, [ensureShareUrl, toastRef]);

  const shareViaWhatsApp = useCallback(async () => {
    try {
      const url = await ensureShareUrl();
      const message = buildMessage(url);
      const w = window.open(
        `https://wa.me/?text=${encodeURIComponent(message)}`,
        "_blank"
      );
      setPopupBlockedHint(!w);
    } catch {
      toastRef.current?.show({
        severity: "error",
        summary: "Share failed",
        detail: "Could not generate share link.",
        life: 4000,
      });
    }
  }, [ensureShareUrl, buildMessage, toastRef]);

  const shareViaEmail = useCallback(async () => {
    try {
      const url = await ensureShareUrl();
      const message = buildMessage(url);
      window.location.href = `mailto:?subject=${encodeURIComponent("Resume Sharing")}&body=${encodeURIComponent(message)}`;
    } catch {
      toastRef.current?.show({
        severity: "error",
        summary: "Share failed",
        detail: "Could not generate share link.",
        life: 4000,
      });
    }
  }, [ensureShareUrl, buildMessage, toastRef]);

  return {
    loading,
    popupBlockedHint,
    setPopupBlockedHint,
    copyLink,
    shareViaWhatsApp,
    shareViaEmail,
  };
}
