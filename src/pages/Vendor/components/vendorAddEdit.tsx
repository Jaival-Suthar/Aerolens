import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { FaCheck } from "react-icons/fa";
import DialogButton from "../../../shared/DialogAddEditButton";
import type { VendorType } from "../types/vendorTypes";
import { useVendorService } from "../services/useVendor";

type VendorAddEditProps = {
  visible: boolean;
  vendorToEdit: VendorType | null;
  onHide: () => void;
  onUpdate: () => void; // callback to refresh parent table
};

const VendorAddEdit: React.FC<VendorAddEditProps> = ({ visible, vendorToEdit, onHide, onUpdate }) => {
  const [formData, setFormData] = useState({ vendorName: "", vendorPhone: "", vendorEmail: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const toast = useRef<Toast>(null);
  const { createVendor, updateVendor } = useVendorService();

  useEffect(() => {
    if (vendorToEdit) {
      setFormData({
        vendorName: vendorToEdit.vendorName,
        vendorPhone: vendorToEdit.vendorPhone || "",
        vendorEmail: vendorToEdit.vendorEmail || "",
      });
    } else {
      setFormData({ vendorName: "", vendorPhone: "", vendorEmail: "" });
    }
    setErrors({});
    setSubmitted(false);
  }, [vendorToEdit, visible]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.vendorName.trim()) newErrors.vendorName = "Organization Name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    setSubmitted(true);
    if (!validateForm()) return;

    try {
      if (vendorToEdit?.vendorId) {
        await updateVendor(vendorToEdit.vendorId, formData);
        toast.current?.show({ severity: "success", summary: "Success", detail: "Vendor updated!", life: 3000 });
      } else {
        await createVendor(formData);
        toast.current?.show({ severity: "success", summary: "Success", detail: "Vendor added!", life: 3000 });
      }

      onHide();
      onUpdate(); // refresh parent table
    } catch (error) {
      toast.current?.show({ severity: "error", summary: "Error", detail: "Failed to save vendor", life: 3000 });
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header={vendorToEdit ? "Edit Vendor" : "Add Vendor"}
        visible={visible}
        onHide={onHide}
        style={{ width: "400px" }}
        modal
        className="p-fluid"
        footer={
          <div className="flex justify-content-end gap-2">
            <DialogButton label="Cancel" severity="secondary" onClick={onHide} />
            <DialogButton
              label={vendorToEdit ? "Update Vendor" : "Add Vendor"}
              severity="success"
              icon={<FaCheck className="mr-2" />}
              onClick={handleSave}
            />
          </div>
        }
      >
        <div className="p-field">
          <label className="font-bold">Organization Name*</label>
          <InputText
            value={formData.vendorName}
            onChange={(e) => setFormData(prev => ({ ...prev, vendorName: e.target.value }))}
            className={submitted && errors.vendorName ? "p-invalid" : ""}
          />
          {submitted && errors.vendorName && <small className="p-error">{errors.vendorName}</small>}
        </div>
        <br />
        <div className="p-field">
          <label className="font-bold">Phone</label>
          <InputText
            value={formData.vendorPhone}
            onChange={(e) => setFormData(prev => ({ ...prev, vendorPhone: e.target.value }))}
          />
        </div>
        <br />
        <div className="p-field">
          <label className="font-bold">Email</label>
          <InputText
            value={formData.vendorEmail}
            onChange={(e) => setFormData(prev => ({ ...prev, vendorEmail: e.target.value }))}
          />
        </div>
      </Dialog>
    </>
  );
};

export default VendorAddEdit;
