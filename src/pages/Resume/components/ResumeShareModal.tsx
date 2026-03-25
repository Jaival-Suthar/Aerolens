import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import type { Toast } from "primereact/toast";
import type { MutableRefObject } from "react";
import { FaCopy, FaEnvelope, FaWhatsapp } from "react-icons/fa";
import { useResumeShare } from "../hooks/useResumeShare";
import type { Candidate } from "../types/resumeTypes";

export type ResumeShareModalProps = {
  visible: boolean;
  onHide: () => void;
  candidate: Candidate | null;
  accessToken: string | null;
  toastRef: MutableRefObject<Toast | null>;
};

const ResumeShareModal: React.FC<ResumeShareModalProps> = ({
  visible,
  onHide,
  candidate,
  accessToken,
  toastRef,
}) => {
  const candidateId = candidate?.candidateId ?? null;
  const jobRole = candidate?.jobRole ?? "";

  const {
    loading,
    shareUrl,
    popupBlockedHint,
    copyLink,
    shareViaWhatsApp,
    shareViaEmail,
  } = useResumeShare({
    candidateId,
    jobRole,
    accessToken,
    toastRef,
    visible,
  });

  return (
    <Dialog
      header="Share Resume"
      visible={visible}
      onHide={onHide}
      style={{ width: "min(420px, 92vw)" }}
      className="resume-share-dialog"
      draggable={false}
      dismissableMask
      blockScroll
    >
      <div className="flex flex-column gap-3">
        {loading && (
          <div className="flex align-items-center gap-2 text-600" style={{ fontSize: "14px" }}>
            <ProgressSpinner style={{ width: "1.5rem", height: "1.5rem" }} strokeWidth="4" />
            <span>Generating link…</span>
          </div>
        )}

        {!loading && visible && candidateId != null && !shareUrl && (
          <p className="m-0 text-sm text-600" role="status">
            Share link could not be created. Close and open this dialog to retry.
          </p>
        )}

        {popupBlockedHint && (
          <p className="m-0 text-sm text-orange-700" role="status">
            If WhatsApp didn&apos;t open, use <strong>Copy Link</strong> below.
          </p>
        )}

        <div className="flex flex-column gap-2">
          <Button
            type="button"
            label="Copy Link"
            icon={<FaCopy className="mr-2" />}
            onClick={() => void copyLink()}
            disabled={loading || candidateId == null}
            className="w-full justify-content-start"
            outlined
          />
          <Button
            type="button"
            label="Share via WhatsApp"
            icon={<FaWhatsapp className="mr-2" />}
            onClick={() => shareViaWhatsApp()}
            disabled={loading || candidateId == null || !shareUrl}
            className="w-full justify-content-start"
            outlined
          />
          <Button
            type="button"
            label="Share via Email"
            icon={<FaEnvelope className="mr-2" />}
            onClick={() => shareViaEmail()}
            disabled={loading || candidateId == null || !shareUrl}
            className="w-full justify-content-start"
            outlined
          />
        </div>
      </div>
    </Dialog>
  );
};

export default ResumeShareModal;
