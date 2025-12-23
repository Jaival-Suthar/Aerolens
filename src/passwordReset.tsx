import React, { useState, useRef } from "react";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useAuth } from "./shared/auth/AuthContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

/* =======================
   Types
======================= */
type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

type ApiResponse = {
  message: string;
};

type ChangePasswordDialogProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

/* =======================
   API
======================= */
const API_BASE_URL = import.meta.env.VITE_BASE_URL;

async function changePassword(
  payload: ChangePasswordRequest,
  token: string
): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Unable to change password");
  }

  return data;
}

/* =======================
   Dialog Component
======================= */
export const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { accessToken } = useAuth();
  const toast = useRef<Toast>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Eye toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const resetState = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setLoading(false);
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubmit = async () => {
    if (!accessToken) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Not authenticated.",
        life: 3000,
      });
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.current?.show({
        severity: "error",
        summary: "Validation Error",
        detail: "All fields are required.",
        life: 3000,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.current?.show({
        severity: "error",
        summary: "Validation Error",
        detail: "Passwords do not match.",
        life: 3000,
      });
      return;
    }

    try {
      setLoading(true);

      await changePassword(
        { currentPassword, newPassword },
        accessToken
      );

      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Password changed successfully",
        life: 3000,
      });

      resetState();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: err.message || "Something went wrong.",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordField = (
    label: string,
    value: string,
    onChange: (val: string) => void,
    show: boolean,
    toggleShow: () => void
  ) => (
    <div className="relative">
      <label className="block mb-1">{label}</label>
      <InputText
        type={show ? "text" : "password"}
        className="w-full pr-10"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <span
        className="absolute top-9 right-2 cursor-pointer text-gray-500"
        onClick={toggleShow}
      >
        {show ? <FaEyeSlash /> : <FaEye />}
      </span>
    </div>
  );

  return (
    <>
      <Toast ref={toast} position="top-right" />

      <Dialog
        header="Change Password"
        visible={visible}
        modal
        onHide={handleClose}
        closable={!loading}
        style={{ width: "400px" }}
      >
        <div className="flex flex-column gap-3">
          {renderPasswordField(
            "Current Password",
            currentPassword,
            setCurrentPassword,
            showCurrent,
            () => setShowCurrent(!showCurrent)
          )}
          {renderPasswordField(
            "New Password",
            newPassword,
            setNewPassword,
            showNew,
            () => setShowNew(!showNew)
          )}
          {renderPasswordField(
            "Confirm New Password",
            confirmPassword,
            setConfirmPassword,
            showConfirm,
            () => setShowConfirm(!showConfirm)
          )}

          <div className="flex justify-end gap-2 mt-3">
            <Button
              label="Cancel"
              severity="secondary"
              onClick={handleClose}
              disabled={loading}
            />
            <Button
              label="Save"
              onClick={handleSubmit}
              loading={loading}
              severity="success"
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};
