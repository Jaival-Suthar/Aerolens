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
  const [emailFallbackHint, setEmailFallbackHint] = useState(false);

  useEffect(() => {
    if (!visible) {
      setShareUrl(null);
      setPopupBlockedHint(false);
      setEmailFallbackHint(false);
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
    const popup = window.open(gmailUrl, "_blank", "noopener,noreferrer");
    if (!popup) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Popup blocked",
        detail: "Allow popups for this site or copy the link instead.",
        life: 4000,
      });
    }
  }, [shareUrl, buildMessage, toastRef]);

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
    const popup = window.open(outlookUrl, "_blank", "noopener,noreferrer");
    if (!popup) {
      toastRef.current?.show({
        severity: "warn",
        summary: "Popup blocked",
        detail: "Allow popups for this site or copy the link instead.",
        life: 4000,
      });
    }
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
    setEmailFallbackHint(false);
    const message = buildMessage(shareUrl);
    const mailtoUrl = `mailto:?subject=${encodeURIComponent("Resume Sharing")}&body=${encodeURIComponent(message)}`;

    let switchedContext = false;
    const markSwitched = () => {
      switchedContext = true;
      window.removeEventListener("blur", markSwitched);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        markSwitched();
      }
    };

    window.addEventListener("blur", markSwitched, { once: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.location.href = mailtoUrl;

    window.setTimeout(() => {
      window.removeEventListener("blur", markSwitched);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (!switchedContext) {
        setEmailFallbackHint(true);
        toastRef.current?.show({
          severity: "info",
          summary: "Email app not opened?",
          detail:
            "If nothing opened, use Gmail/Outlook buttons below or configure a default mailto handler.",
          life: 6000,
        });
      }
    }, 1200);
  }, [shareUrl, buildMessage, toastRef]);

  return {
    loading,
    shareUrl,
    popupBlockedHint,
    emailFallbackHint,
    setPopupBlockedHint,
    copyLink,
    shareViaWhatsApp,
    shareViaEmail,
    openEmailInGmail,
    openEmailInOutlook,
  };
}
