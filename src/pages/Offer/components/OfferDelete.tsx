import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import DialogDeleteButton from "../../../shared/DialogDeleteButton";
import { deleteOffer } from "../services/offerService";
import { useAuth } from "../../../shared/auth/AuthContext";
import type { OfferTableRow } from "../types/offerTypes";

type OfferDeleteProps = {
  visible: boolean;
  onHide: () => void;
  selectedOffer: OfferTableRow | null;
  onSuccess: () => void;
  onClearSelection: () => void;
};

const OfferDelete: React.FC<OfferDeleteProps> = ({
  visible,
  onHide,
  selectedOffer,
  onSuccess,
  onClearSelection,
}) => {
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);
  const { accessToken } = useAuth();

  const handleDelete = async (): Promise<void> => {
    if (!selectedOffer) return;
    if (!accessToken) {
      toast.current?.show({
        severity: "error",
        summary: "Auth Error",
        detail: "No token found. Please log in again.",
        life: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await deleteOffer(selectedOffer.offerId, accessToken);
      if (response.success) {
        toast.current?.show({
          severity: "success",
          summary: "Deleted",
          detail: response.message ?? `Offer for "${selectedOffer.candidateName}" deleted successfully`,
          life: 3000,
        });
        onClearSelection();
        onSuccess();
        onHide();
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: response.message ?? "Failed to delete offer",
          life: 3000,
        });
      }
    } catch (error: unknown) {
      const message = error && typeof error === "object" && "message" in error ? String((error as { message: unknown }).message) : "Failed to delete offer.";
      toast.current?.show({ severity: "error", summary: "Error", detail: message, life: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (): void => onHide();

  return (
    <>
      <Toast ref={toast} position="top-right" />
      <Dialog
        visible={visible}
        onHide={handleCancel}
        header="Confirm Deletion"
        footer={
          <div className="flex justify-content-end gap-2">
            <DialogDeleteButton onCancel={handleCancel} onDelete={handleDelete} loading={loading} />
          </div>
        }
        style={{ width: "400px" }}
        modal
        className="p-fluid"
      >
        <div className="confirmation-content">
          <p>
            Are you sure you want to delete the offer for candidate{" "}
            <strong>"{selectedOffer?.candidateName}"</strong>?
          </p>
          <p className="text-sm text-600">This will soft-delete the offer. It will be excluded from the list.</p>
        </div>
      </Dialog>
    </>
  );
};

export default OfferDelete;
