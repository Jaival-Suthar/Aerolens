import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { ClientAddEditProps, ClientType, ClientAddType } from "../types/clientTypes";



const ClientAddEdit: React.FC<ClientAddEditProps> = ({ 
    visible, 
    onHide, 
    onSave, 
    mode = "add", 
    client = null 
  }) => {

  const [clientName, setClientName] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [errors, setErrors] = useState<{ clientName?: string; address?: string }>(
    {}
  );

  // Initialize form data when dialog opens or client changes
  useEffect(() => {
    if (visible) {
      if (client) {
        setClientName(client.clientName || "");
        setAddress(client.address || "");
      } else {
        setClientName("");
        setAddress("");
      }
      setErrors({});
    }
  }, [client, visible]);

  const validateForm = (): boolean => {
    const newErrors: { clientName?: string; address?: string } = {};

    if (!clientName.trim()) {
      newErrors.clientName = "Client Name is required";
    }

    if (!address.trim()) {
      newErrors.address = "Address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (): void => {
  if (!validateForm()) return;

  const trimmedName = clientName.trim();
  const trimmedAddress = address.trim();

  if (mode === "add") {
    const clientData: ClientAddType = {
      clientName: trimmedName,
      address: trimmedAddress,
    };
    onSave(clientData);
  } else {
    // edit mode, clientId must exist in client
    if (!client || !("clientId" in client)) {
      // This is catastrophic: editing client without clientId
      console.error("Missing clientId in edit mode");
      return;
    }
    const clientData: ClientType = {
      clientId: client.clientId,
      clientName: trimmedName,
      address: trimmedAddress,
    };
    onSave(clientData);
  }
};


  const handleCancel = (): void => {
    setClientName("");
    setAddress("");
    setErrors({});
    onHide();
  };

  const dialogHeader = mode === "add" ? "Add New Client" : "Edit Client";

  return (
    <Dialog
      header={dialogHeader}
      visible={visible}
      modal
      onHide={handleCancel}
      style={{ width: "30vw", minWidth: "300px" }}
      breakpoints={{ "960px": "50vw", "641px": "90vw" }}
    >
      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="clientName" className="block mb-2 font-medium">
            Client Name <span className="text-red-500">*</span>
          </label>
          <InputText
            id="clientName"
            value={clientName}
            onChange={(e) => {
              setClientName(e.target.value);
              if (errors.clientName) {
                setErrors((prev) => ({ ...prev, clientName: undefined }));
              }
            }}
            autoFocus
            style={{ borderRadius: "8px" }}
            className={errors.clientName ? "p-invalid" : ""}
          />
          {errors.clientName && (
            <small className="p-error block mt-1">{errors.clientName}</small>
          )}
        </div>

        <div className="field mb-4">
          <label htmlFor="address" className="block mb-2 font-medium">
            Address <span className="text-red-500">*</span>
          </label>
          <InputText
            id="address"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              if (errors.address) {
                setErrors((prev) => ({ ...prev, address: undefined }));
              }
            }}
            style={{ borderRadius: "8px" }}
            className={errors.address ? "p-invalid" : ""}
          />
          {errors.address && (
            <small className="p-error block mt-1">{errors.address}</small>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            label="Cancel"
            text
            severity="secondary"
            size="small"
            onClick={handleCancel}
            className="w-auto"
            style={{
              borderWidth: "1.5px",
              borderColor: "#6c757d",
              color: "#6c757d",
              backgroundColor: "transparent",
              padding: "0.4rem 1rem",
              borderRadius: "6px",
              fontWeight: "500",
            }}
          />
          <Button
            label={mode === "add" ? "Add Client" : "Save Changes"}
            severity="success"
            icon="pi pi-check"
            size="small"
            onClick={handleSubmit}
            className="w-auto"
            style={{
              padding: "0.4rem 1rem",
              borderRadius: "6px",
              fontWeight: "600",
            }}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default ClientAddEdit;
