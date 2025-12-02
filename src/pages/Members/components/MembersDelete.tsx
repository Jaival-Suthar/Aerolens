import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Message } from "primereact/message";
import { Toast } from "primereact/toast"; // Added Toast import
import DialogDeleteButton from "../../../shared/DialogDeleteButton";
import { Member } from "../types/memberTypes";
import { deleteMember } from "../services/memberService";
import { useAuth } from "../../../shared/auth/AuthContext";

interface Props {
  visible: boolean;
  onHide: () => void;
  onDelete: () => void;
  selectedMember: Member | null;
  loading?: boolean;
}

const MemberDelete: React.FC<Props> = ({
  visible,
  onHide,
  onDelete,
  selectedMember,
  loading = false,
}) => {
  const [error, setError] = useState<string | null>(null);
  const toast = useRef<Toast>(null); // Toast ref
  const { accessToken } = useAuth();

  if (!selectedMember) return null;

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

  return (
    <>
      
      <Dialog
        visible={visible}
        header="Delete Member"
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

        {/* Member Details Card */}
        <div className="bg-surface-50 p-3 border-round mb-4">
          <div className="grid">
           <div className="text-center">
            <p className="m-0 font-bold text-lg text-color-secondary">
              Are you sure you want to delete this member?
            </p>
          </div>

          <div className="col-12 mt-3">
            <strong className="text-xl">Member Details:</strong>
          </div>


            <div className="col-6">
              <span className="text-color-secondary">Member ID:</span>
            </div>
            <div className="col-6">{selectedMember.memberId}</div>

            <div className="col-6">
              <span className="text-color-secondary">Name:</span>
            </div>
            <div className="col-6">{selectedMember.memberName}</div>

            <div className="col-6">
              <span className="text-color-secondary">Email:</span>
            </div>
            <div className="col-6">{selectedMember.email}</div>

            <div className="col-6">
              <span className="text-color-secondary">Contact:</span>
            </div>
            <div className="col-6">{selectedMember.memberContact}</div>

            <div className="col-6">
              <span className="text-color-secondary">Designation:</span>
            </div>
            <div className="col-6">{selectedMember.designation}</div>

            <div className="col-6">
              <span className="text-color-secondary">Location:</span>
            </div>
            <div className="col-6">
              {selectedMember.location
                ? `${selectedMember.location.city}, ${selectedMember.location.country}`
                : "-"}
            </div>

            <div className="col-6">
              <span className="text-color-secondary">Client:</span>
            </div>
            <div className="col-6">{selectedMember.clientName || "-"}</div>

            <div className="col-6">
              <span className="text-color-secondary">Organisation:</span>
            </div>
            <div className="col-6">{selectedMember.organisation || "-"}</div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default MemberDelete;
