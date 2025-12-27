import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import type { VendorType } from "../types/vendorTypes";

type VendorAddEditProps = {
  visible: boolean;
  vendorToEdit: VendorType | null;
  onHide: () => void;
  onSave: (vendor: VendorType) => void;
};

const VendorAddEdit: React.FC<VendorAddEditProps> = ({ visible, vendorToEdit, onHide, onSave }) => {
  const [organisationName, setOrganisationName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (vendorToEdit) {
      setOrganisationName(vendorToEdit.organisationName);
      setPhone(vendorToEdit.phone || "");
      setEmail(vendorToEdit.email || "");
    } else {
      setOrganisationName("");
      setPhone("");
      setEmail("");
    }
  }, [vendorToEdit]);

  const handleSave = () => {
    if (!organisationName.trim()) {
      alert("Organisation Name is mandatory");
      return;
    }

    const newVendor: VendorType = {
      vendorId: vendorToEdit?.vendorId || `v${Date.now()}`, // temporary ID
      organisationName,
      phone,
      email,
    };

    onSave(newVendor);
    onHide();
  };

  return (
    <Dialog
      header={vendorToEdit ? "Edit Vendor" : "Add Vendor"}
      visible={visible}
      onHide={onHide}
      style={{ width: "400px" }}
      modal
    >
      <div className="p-fluid">
        <div className="p-field">
          <label htmlFor="organisationName">Organisation Name*</label>
          <InputText id="organisationName" value={organisationName} onChange={(e) => setOrganisationName(e.target.value)} />
        </div>
        <div className="p-field">
          <label htmlFor="phone">Phone</label>
          <InputText id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="p-field">
          <label htmlFor="email">Email</label>
          <InputText id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>

      <div className="flex justify-content-end mt-4 gap-2">
        <Button label="Cancel" onClick={onHide} className="p-button-text" />
        <Button label="Save" onClick={handleSave} />
      </div>
    </Dialog>
  );
};

export default VendorAddEdit;
