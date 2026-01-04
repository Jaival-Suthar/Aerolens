import React, { useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import DialogDeleteButton from "../../../shared/DialogDeleteButton";
import type { VendorType } from "../types/vendorTypes";
import { VendorService } from "../services/useVendor";
import { useAuth } from "../../../shared/auth/AuthContext";

type VendorDeleteProps = {
  visible: boolean;
  vendorToDelete: VendorType | null;
  onHide: () => void;
  onUpdate: () => void;
};

const VendorDelete: React.FC<VendorDeleteProps> = ({
  visible,
  vendorToDelete,
  onHide,
  onUpdate,
}) => {
  const { accessToken } = useAuth(); // ✅ explicit auth (same as Add/Edit)
  const toast = useRef<Toast>(null);

  const handleDelete = async () => {
    // ✅ defensive validation
    if (!accessToken) {
      toast.current?.show({
        severity: "error",
        summary: "Authentication Error",
        detail: "You are not authorized to perform this action.",
        life: 2000,
      });
      return;
    }

    if (!vendorToDelete?.vendorId) {
      toast.current?.show({
        severity: "warn",
        summary: "Invalid Action",
        detail: "No vendor selected for deletion.",
        life: 2000,
      });
      return;
    }

    try {
      const res = await VendorService.deleteVendor(
        accessToken,
        vendorToDelete.vendorId
      );

      toast.current?.show({
        severity: "success",
        summary: "Deleted",
        detail: res.message ?? `Vendor "${vendorToDelete.vendorName}" deleted successfully`,
        life: 2000,
      });

      onHide();
      onUpdate();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete vendor";

      toast.current?.show({
        severity: "error",
        summary: "Delete Failed",
        detail: message,
        life: 2000,
      });
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header="Delete Vendor"
        visible={visible}
        onHide={onHide}
        style={{ width: "400px" }}
        modal
        footer={
          <div className="flex justify-content-end gap-2">
            <DialogDeleteButton onCancel={onHide} onDelete={handleDelete} />
          </div>
        }
      >
        <p>
          Are you sure you want to delete vendor{" "}
          <strong>{vendorToDelete?.vendorName}</strong>?
        </p>
      </Dialog>
    </>
  );
};

export default VendorDelete;
