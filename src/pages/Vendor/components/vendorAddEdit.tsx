import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { FaCheck } from "react-icons/fa";
import DialogButton from "../../../shared/DialogAddEditButton";
import type { VendorType } from "../types/vendorTypes";
import { VendorService } from "../services/useVendor";
import { useAuth } from "../../../shared/auth/AuthContext";

/** ---------- Types ---------- */
type VendorFormData = {
  vendorName: string;
  vendorPhone: string;
  vendorEmail: string;
};

type VendorAddEditProps = {
  visible: boolean;
  vendorToEdit: VendorType | null;
  onHide: () => void;
  onUpdate: () => void;
};

/** ---------- Validation ---------- */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9]{9,10}$/;

const VendorAddEdit: React.FC<VendorAddEditProps> = ({
  visible,
  vendorToEdit,
  onHide,
  onUpdate,
}) => {
  const { accessToken } = useAuth(); // explicit auth
  const toast = useRef<Toast>(null);

  const [formData, setFormData] = useState<VendorFormData>({
    vendorName: "",
    vendorPhone: "",
    vendorEmail: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

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
    setBackendError(null);
  }, [vendorToEdit, visible]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.vendorName.trim()) newErrors.vendorName = "Organization Name is required";

    if (formData.vendorEmail && !EMAIL_REGEX.test(formData.vendorEmail))
      newErrors.vendorEmail = "Invalid email format";

    if (formData.vendorPhone && !PHONE_REGEX.test(formData.vendorPhone))
      newErrors.vendorPhone = "Phone must be 10 digits if Indian, 9 digits if US";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    setSubmitted(true);
    setBackendError(null);

    if (!validateForm()) return;
    if (!accessToken) return;

    try {
      if (vendorToEdit?.vendorId) {
        await VendorService.updateVendor(accessToken, vendorToEdit.vendorId, formData);
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Vendor updated!",
          life: 3000,
        });
      } else {
        await VendorService.createVendor(accessToken, formData);
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Vendor added!",
          life: 3000,
        });
      }

      onHide();
      onUpdate();
    } catch (error: any) {
      // Surface backend message if available, fallback to generic
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "An unexpected error occurred while saving vendor";

      setBackendError(message);

      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: message,
        life: 4000,
      });
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
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, vendorName: e.target.value }))
            }
            className={submitted && errors.vendorName ? "p-invalid" : ""}
          />
          {submitted && errors.vendorName && (
            <small className="p-error">{errors.vendorName}</small>
          )}
        </div>

        <br />

        <div className="p-field">
          <label className="font-bold">Phone</label>
          <InputText
            value={formData.vendorPhone}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, vendorPhone: e.target.value }))
            }
            className={submitted && errors.vendorPhone ? "p-invalid" : ""}
          />
          {submitted && errors.vendorPhone && (
            <small className="p-error">{errors.vendorPhone}</small>
          )}
        </div>

        <br />

        <div className="p-field">
          <label className="font-bold">Email</label>
          <InputText
            value={formData.vendorEmail}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, vendorEmail: e.target.value }))
            }
            className={submitted && errors.vendorEmail ? "p-invalid" : ""}
          />
          {submitted && errors.vendorEmail && (
            <small className="p-error">{errors.vendorEmail}</small>
          )}
        </div>

        {/* Optional backend error displayed below form fields */}
        {backendError && (
          <div className="p-field">
            <small className="p-error">{backendError}</small>
          </div>
        )}
      </Dialog>
    </>
  );
};

export default VendorAddEdit;
