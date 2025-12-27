import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import type { VendorType } from "../types/vendorTypes";

type VendorDeleteProps = {
  visible: boolean;
  vendorToDelete: VendorType | null;
  onHide: () => void;
  onConfirm: () => void;
};

const VendorDelete: React.FC<VendorDeleteProps> = ({ visible, vendorToDelete, onHide, onConfirm }) => {
  return (
    <Dialog
      header="Delete Vendor"
      visible={visible}
      onHide={onHide}
      style={{ width: "400px" }}
      modal
      footer={
        <div className="flex justify-content-end gap-2">
          <Button label="Cancel" onClick={onHide} className="p-button-text" />
          <Button label="Delete" onClick={() => { onConfirm(); onHide(); }} severity="danger" />
        </div>
      }
    >
      <p>
        Are you sure you want to delete vendor <strong>{vendorToDelete?.organisationName}</strong>?
      </p>
    </Dialog>
  );
};

export default VendorDelete;
