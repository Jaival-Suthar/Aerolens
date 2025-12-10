import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { ClientAddEditProps, ClientType, ClientAddType } from "../types/clientTypes";
import { FaCheck } from 'react-icons/fa';
import DialogButton from "../../../shared/DialogAddEditButton";
//Testing PreProd Final Workflow
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
      //console.error("Missing clientId in edit mode");
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
  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <DialogButton
        label="Cancel"
            severity="secondary"
            onClick={handleCancel}
            className="w-auto"
          />
          <DialogButton
            label={mode === "add" ? "Add Client" : "Update Client"}
            severity="success"
            icon={<FaCheck style={{ fontSize: 16, marginRight: 8, marginLeft: 4 }} />}
            onClick={handleSubmit}
            className="w-auto"
          />
    </div>
  );

  return (
    <Dialog
      header={dialogHeader}
      footer={dialogFooter}
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
      </div>
    </Dialog>
  );
};

export default ClientAddEdit;
