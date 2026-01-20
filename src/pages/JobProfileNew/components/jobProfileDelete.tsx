import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Message } from "primereact/message";
import DialogDeleteButton from "../../../shared/DialogDeleteButton";
import { JobProfile } from "../types/jobProfileTypes";

interface Props {
  visible: boolean;
  onHide: () => void;
  onDelete: () => void;
  selectedJobProfile: JobProfile | null;
  loading?: boolean;
}

const JobProfileDelete: React.FC<Props> = ({
  visible,
  onHide,
  onDelete,
  selectedJobProfile,
  loading = false,
}) => {
  const [error, setError] = useState<string | null>(null);

  if (!selectedJobProfile) return null;

  const handleDelete = () => {
    setError(null);
    onDelete(); // 👈 Just call parent - no API call here
  };

  const handleHide = () => {
    setError(null);
    onHide();
  };

  const footer = (
    <div className="flex justify-content-end gap-2">
      <DialogDeleteButton
        onCancel={handleHide}
        onDelete={handleDelete}
        cancelDisabled={loading}
        deleteDisabled={loading}
      />
    </div>
  );

  // Extract overview text
  const overviewText = selectedJobProfile.overview?.[0]?.type === "paragraph"
    ? selectedJobProfile.overview[0].content[0]?.text || "-"
    : "-";

  // Extract responsibilities count
  const responsibilitiesCount = selectedJobProfile.responsibilities?.type === "bullets"
    ? selectedJobProfile.responsibilities.content.length
    : 0;

  // Extract skills count
  const skillsCount = selectedJobProfile.requiredSkills?.type === "bullets"
    ? selectedJobProfile.requiredSkills.content.length
    : 0;

  // Extract nice-to-have count
  const niceToHaveCount = selectedJobProfile.niceToHave?.type === "bullets"
    ? selectedJobProfile.niceToHave.content.length
    : 0;

  return (
    <>
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
          <Message severity="error" text={error} className="mb-3 w-full" />
        )}

        {/* Job Profile Details Card */}
        <div className="bg-surface-50 p-3 border-round mb-4">
          <div className="grid">
            <div className="text-center">
              <p className="m-0 font-bold text-lg text-color-secondary">
                Are you sure you want to delete this job profile?
              </p>
            </div>

            <div className="col-12 mt-3">
              <strong className="text-xl">Job Profile Details:</strong>
            </div>

            <div className="col-6">
              <span className="text-color-secondary">Position:</span>
            </div>
            <div className="col-6">
              <strong>{selectedJobProfile.position}</strong>
            </div>

            <div className="col-6">
              <span className="text-color-secondary">Experience:</span>
            </div>
            <div className="col-6">{selectedJobProfile.experience}</div>

            <div className="col-6">
              <span className="text-color-secondary">Job Overview:</span>
            </div>
            <div className="col-6">
              <div
                style={{
                  maxWidth: "100%",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
                title={overviewText}
              >
                {overviewText}
              </div>
            </div>

            <div className="col-6">
              <span className="text-color-secondary">Key Responsibilities:</span>
            </div>
            <div className="col-6">
              {responsibilitiesCount > 0 
                ? `${responsibilitiesCount} item${responsibilitiesCount !== 1 ? 's' : ''}`
                : "-"}
            </div>

            <div className="col-6">
              <span className="text-color-secondary">Required Skills:</span>
            </div>
            <div className="col-6">
              {skillsCount > 0 
                ? `${skillsCount} skill${skillsCount !== 1 ? 's' : ''}`
                : "-"}
            </div>

            <div className="col-6">
              <span className="text-color-secondary">Nice to Have:</span>
            </div>
            <div className="col-6">
              {niceToHaveCount > 0 
                ? `${niceToHaveCount} item${niceToHaveCount !== 1 ? 's' : ''}`
                : "-"}
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