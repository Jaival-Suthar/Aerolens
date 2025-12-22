import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useAuth } from "./shared/auth/AuthContext"; 
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
  const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
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

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    if (!accessToken) {
      setError("Not authenticated.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await changePassword(
        { currentPassword, newPassword },
        accessToken
      );

      resetState();
      onSuccess?.(); // notify parent of success
      onClose();     // auto-close dialog
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      header="Change Password"
      visible={visible}
      modal
      onHide={handleClose}
      closable={!loading}
      style={{ width: "400px" }}
    >
      <div className="flex flex-column gap-3">
        <div>
          <label className="block mb-1">Current Password</label>
          <InputText
            type="password"
            className="w-full"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1">New Password</label>
          <InputText
            type="password"
            className="w-full"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1">Confirm New Password</label>
          <InputText
            type="password"
            className="w-full"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {error && <small className="text-red-500">{error}</small>}

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
  );
};
