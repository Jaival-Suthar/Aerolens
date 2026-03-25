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
 * Handles resume share link generation and Copy / WhatsApp / Web Email flows.
 *
 * The share URL is prefetched when the modal opens so share actions can run
 * synchronously on click.
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

  /**
   * Open web compose strictly in a new tab.
   */
  const openWebCompose = useCallback(
    (url: string) => {
      const popup = window.open(url, "_blank", "noopener,noreferrer");
      if (!popup) {
        toastRef.current?.show({
          severity: "warn",
          summary: "Popup blocked",
          detail: "Allow popups for this site to open email compose in a new tab.",
          life: 5000,
        });
      }
    },
    [toastRef]
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
          "Could not copy the link. Try again or use HTTPS - or copy from the address bar after opening the link in a new tab.",
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

  const openEmailInGmail = useCallback(() => {
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
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent("Resume Sharing")}&body=${encodeURIComponent(message)}`;
    openWebCompose(gmailUrl);
  }, [shareUrl, buildMessage, toastRef, openWebCompose]);

  const openEmailInOutlook = useCallback(() => {
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
    const outlookUrl = `https://outlook.office.com/mail/deeplink/compose?subject=${encodeURIComponent("Resume Sharing")}&body=${encodeURIComponent(message)}`;
    openWebCompose(outlookUrl);
  }, [shareUrl, buildMessage, toastRef, openWebCompose]);

  return {
    loading,
    shareUrl,
    popupBlockedHint,
    setPopupBlockedHint,
    copyLink,
    shareViaWhatsApp,
    openEmailInGmail,
    openEmailInOutlook,
  };
}
