import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import DialogButton from "./shared/DialogAddEditButton";
import { useAuth } from "./shared/auth/AuthContext"; 
import { PasswordInput } from "./shared/PasswordInput";
import { Toast } from "primereact/toast";
import { useRef } from "react";
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
   API (Service Layer)
   Storage-agnostic; token passed explicitly
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
    throw {
      errorCode: data?.error,
      message: data?.message || "Unable to change password",
      details: data?.details,
    };
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
  const { accessToken, logoutAll } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useRef<Toast>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const resetState = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setLoading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubmit = async () => {
  setError(null);
  setFieldErrors({});

  if (!accessToken) {
    toast.current?.show({
      severity: "error",
      summary: "Not authenticated",
      detail: "Please login again.",
    });
    return;
  }

  const frontendErrors = validateNewPassword(
  currentPassword,
  newPassword,
  confirmPassword
);

if (Object.keys(frontendErrors).length > 0) {
  setFieldErrors(frontendErrors);

  toast.current?.show({
    severity: "error",
    summary: "Invalid Password",
    detail: "Please fix the highlighted fields.",
  });

  return; // 🚫 STOP API CALL
}


  try {
    setLoading(true);

    await changePassword({ currentPassword, newPassword }, accessToken);

    // 1️⃣ Show toast
    toast.current?.show({
      severity: "success",
      summary: "Password Changed",
      detail: "For security reasons, please log in again.",
      life: 2500,
    });

    // 2️⃣ Close dialog immediately
    resetState();
    onClose();

    setTimeout(() => {
      // 3️⃣ Invoke success callback if any
      logoutAll();
    }, 350);


  } catch (err: any) {
    // 🔥 Map backend error codes
    if (err.errorCode === "INVALID_CURRENT_PASSWORD") {
      setFieldErrors({
        currentPassword: "Current password is incorrect",
      });

      toast.current?.show({
        severity: "error",
        summary: "Incorrect Password",
        detail: "The current password you entered is wrong.",
      });
    }

    else if (err.errorCode === "VALIDATION_ERROR" && err.details?.validationErrors) {
      const errors: any = {};
      err.details.validationErrors.forEach((e: any) => {
        errors[e.field] = e.message;
      });
      setFieldErrors(errors);

      toast.current?.show({
        severity: "error",
        summary: "Invalid Input",
        detail: "Please fix the highlighted fields.",
      });
    }

    else {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: err.message || "Something went wrong.",
      });
    }
  } finally {
    setLoading(false);
  }
};

  const handleNewPasswordChange = (value: string) => {
  setNewPassword(value);
  setFieldErrors((prev) => ({ ...prev, newPassword: undefined }));
};

  const handleConfirmPasswordChange = (value: string) => {
  setConfirmPassword(value);
  setFieldErrors((prev) => ({
    ...prev,
    confirmPassword: undefined,
  }));
};


  
 const dialogFooter = (
  <div className="flex justify-content-end gap-2 w-full">
    <DialogButton
      label="Cancel"
      severity="secondary"
      onClick={handleClose}
      disabled={loading}
    />

    <DialogButton
      label="Save"
      severity="success"
      onClick={handleSubmit}
      loading={loading}
      disabled={loading}
    />
  </div>
);
const validateNewPassword = (
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
) => {
  const errors: {
    newPassword?: string;
    confirmPassword?: string;
  } = {};

  if (!newPassword || newPassword.length < 8) {
    errors.newPassword = "Password must be at least 8 characters long";
  }

  if (newPassword === currentPassword) {
    errors.newPassword = "New password must be different from current password";
  }

  if (newPassword !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
};

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
      footer={dialogFooter}
    >
      <div className="flex flex-column gap-3">
        <div>
        <label className="block mb-1">Current Password</label>
        <PasswordInput
          value={currentPassword}
          autoComplete="current-password"
          onChange={setCurrentPassword}
          invalid={!!fieldErrors.currentPassword}
        />
        {fieldErrors.currentPassword && (
          <small className="text-red-500">
            {fieldErrors.currentPassword}
          </small>
        )}
      </div>


        <div>
          <label className="block mb-1">New Password</label>
          <PasswordInput
            value={newPassword}
            autoComplete="new-password"
            onChange={handleNewPasswordChange}
            invalid={!!fieldErrors.newPassword}
          />
          {fieldErrors.newPassword && (
            <small className="text-red-500">
              {fieldErrors.newPassword}
            </small>
          )}
        </div>


        <div>
          <label className="block mb-1">Confirm New Password</label>
          <PasswordInput
            value={confirmPassword}
            autoComplete="new-password"
            onChange={handleConfirmPasswordChange}
            invalid={!!fieldErrors.confirmPassword}
          />
          {fieldErrors.confirmPassword && (
            <small className="text-red-500">
              {fieldErrors.confirmPassword}
            </small>
          )}
        </div>


        {error && <small className="text-red-500">{error}</small>}

      </div>
    </Dialog>
    </>
  );
  
};
