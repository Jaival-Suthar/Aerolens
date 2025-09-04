import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

const ClientAddEdit = ({
  visible = false,
  onHide,
  onSave,
  mode = "add",
  client = null
}) => {
  const [clientName, setClientName] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState({});

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

  const validateForm = () => {
    const newErrors = {};
    
    if (!clientName || clientName.trim() === "") {
      newErrors.clientName = "Client Name is required";
    }
    
    if (!address || address.trim() === "") {
      newErrors.address = "Address is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const clientData = {
      ...client, // Include existing client data (like clientId for edits)
      clientName: clientName.trim(),
      address: address.trim(),
    };

    if (onSave) {
      onSave(clientData);
    }
  };

  const handleCancel = () => {
    setClientName("");
    setAddress("");
    setErrors({});
    if (onHide) {
      onHide();
    }
  };

  const dialogHeader = mode === "add" ? "Add New Client" : "Edit Client";

  return (
    <Dialog
      header={dialogHeader}
      visible={visible}
      modal
      onHide={handleCancel}
      style={{ width: "30vw", minWidth: "300px" }}
      breakpoints={{ '960px': '50vw', '641px': '90vw' }}
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
                setErrors(prev => ({ ...prev, clientName: null }));
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
                setErrors(prev => ({ ...prev, address: null }));
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