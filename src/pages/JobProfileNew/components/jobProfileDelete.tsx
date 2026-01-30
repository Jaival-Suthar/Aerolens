import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Message } from "primereact/message";
import { Toast } from "primereact/toast";
import DialogDeleteButton from "../../../shared/DialogDeleteButton";
import { JobProfile } from "../types/jobProfileTypes";
import { deleteJobProfile } from "../services/jobProfileService";
import { useAuth } from "../../../shared/auth/AuthContext";

interface Props {
  visible: boolean;
  onHide: () => void;
  onSuccess: () => void; // refresh table
  selectedJobProfile: JobProfile | null;
}

const JobProfileDelete: React.FC<Props> = ({
  visible,
  onHide,
  onSuccess,
  selectedJobProfile
}) => {
  const { accessToken } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toast = React.useRef<Toast>(null);

  if (!selectedJobProfile) return null;

  /* ========================================
     DELETE HANDLER
  ======================================== */

  const handleDelete = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      setError(null);

      await deleteJobProfile(
        accessToken,
        selectedJobProfile.id
      );

      toast.current?.show({
        severity: "success",
        summary: "Deleted",
        detail: "Job profile deleted successfully",
        life: 3000
      });

      onSuccess(); // refresh table
      onHide();

    } catch (err: any) {
      console.error("Delete error:", err);

      setError(
        err?.message ||
        "Failed to delete job profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleHide = () => {
    if (loading) return;
    setError(null);
    onHide();
  };

  /* ========================================
     DATA
  ======================================== */

  const overviewText =
    selectedJobProfile.overview?.[0]?.type === "paragraph"
      ? selectedJobProfile.overview[0].content[0]?.text || "-"
      : "-";

  const responsibilitiesCount =
    selectedJobProfile.responsibilities?.type === "bullets"
      ? selectedJobProfile.responsibilities.content.length
      : 0;

  const skillsCount =
    selectedJobProfile.requiredSkills?.type === "bullets"
      ? selectedJobProfile.requiredSkills.content.length
      : 0;

  const niceToHaveCount =
    selectedJobProfile.niceToHave?.type === "bullets"
      ? selectedJobProfile.niceToHave.content.length
      : 0;

  /* ========================================
     FOOTER
  ======================================== */

  const footer = (
    <div className="flex justify-content-end gap-2">
      <DialogDeleteButton
        onCancel={handleHide}
        onDelete={handleDelete}
        cancelDisabled={loading}
        deleteDisabled={loading}
        loading={loading}
      />
    </div>
  );

  /* ========================================
     RENDER
  ======================================== */

  return (
    <>
      <Toast ref={toast} />

      <Dialog
        visible={visible}
        header="Delete Job Profile"
        style={{ width: "50rem" }}
        modal
        onHide={handleHide}
        footer={footer}
        draggable={false}
        resizable={false}
      >
        {error && (
          <Message
            severity="error"
            text={error}
            className="mb-3 w-full"
          />
        )}

        {/* Details */}
        <div className="bg-surface-50 p-3 border-round mb-4">
          <div className="grid">

            <div className="col-12 text-center">
              <p className="m-0 font-bold text-lg text-color-secondary">
                Are you sure you want to delete this job profile?
              </p>
            </div>

            <div className="col-12 mt-3">
              <strong className="text-xl">
                Job Profile Details:
              </strong>
            </div>

            <div className="col-6">Position:</div>
            <div className="col-6">
              <strong>{selectedJobProfile.position}</strong>
            </div>

            <div className="col-6">Experience:</div>
            <div className="col-6">
              {selectedJobProfile.experience}
            </div>

            <div className="col-6">Overview:</div>
            <div className="col-6">
              <div
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
                title={overviewText}
              >
                {overviewText}
              </div>
            </div>

            <div className="col-6">Responsibilities:</div>
            <div className="col-6">
              {responsibilitiesCount || "-"}
            </div>

            <div className="col-6">Skills:</div>
            <div className="col-6">
              {skillsCount || "-"}
            </div>

            <div className="col-6">Nice to Have:</div>
            <div className="col-6">
              {niceToHaveCount || "-"}
            </div>

          </div>
        </div>

        <Message
          severity="warn"
          text="This action cannot be undone. All associated data will be permanently deleted."
          className="w-full"
        />
      </Dialog>
    </>
  );
};

export default JobProfileDelete;
