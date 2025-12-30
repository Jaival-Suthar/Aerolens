import React, { useRef } from "react";
import { Dialog } from "primereact/dialog";
import DialogDeleteButton from "../../../shared/DialogDeleteButton";
import type { VendorType } from "../types/vendorTypes";
import { useVendorService } from "../services/useVendor";
import { Toast } from "primereact/toast";

type VendorDeleteProps = {
  visible: boolean;
  vendorToDelete: VendorType | null;
  onHide: () => void;
  onUpdate: () => void; // callback to refresh parent table
};

const VendorDelete: React.FC<VendorDeleteProps> = ({ visible, vendorToDelete, onHide, onUpdate }) => {
  const { deleteVendor } = useVendorService();
  const toast = useRef<Toast>(null);

  const handleDelete = async () => {
    if (!vendorToDelete) return;

    try {
      await deleteVendor(vendorToDelete.vendorId);
      toast.current?.show({
        severity: "success",
        summary: "Deleted",
        detail: `Vendor "${vendorToDelete.vendorName}" deleted successfully`,
        life: 3000,
      });

      onHide();
      onUpdate(); // refresh parent table
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete vendor",
        life: 3000,
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
          Are you sure you want to delete vendor <strong>{vendorToDelete?.vendorName}</strong>?
        </p>
      </Dialog>
    </>
  );
};

export default VendorDelete;
