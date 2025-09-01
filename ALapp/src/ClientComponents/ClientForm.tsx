import React, { useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

interface Client {
  // clientId: string;
  clientName: string;
  adress: string;
}

interface ClientFormProps {
  onSubmit: (client: Client) => void;
  initialData?: Client;
  onCancel?: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ onSubmit, initialData, onCancel }) => {
  const [formData, setFormData] = useState<Client>(
    initialData || {  clientName: "", adress: "" }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: "10px", minWidth: "350px" }}>
      {/* {initialData && (
        <div className="p-field" style={{ marginBottom: "1rem" }}>
          <label htmlFor="clientId" style={{ display: "block", marginBottom: "0.5rem" }}>
            Client ID
          </label>
          <InputText
            id="clientId"
            name="clientId"
            value={formData.clientId}
            onChange={handleChange}
            disabled
            style={{ width: "100%" }}
          />
        </div> */}
    

      <div className="p-field" style={{ marginBottom: "1rem" }}>
        <label htmlFor="clientName" style={{ display: "block", marginBottom: "0.5rem" }}>
          Client Name
        </label>
        <InputText
          id="clientName"
          name="clientName"
          placeholder="Enter client name"
          value={formData.clientName}
          onChange={handleChange}
          required
          style={{ width: "100%" }}
        />
      </div>

      <div className="p-field" style={{ marginBottom: "1.5rem" }}>
        <label htmlFor="adress" style={{ display: "block", marginBottom: "0.5rem" }}>
          Address
        </label>
        <InputText
          id="adress"
          name="adress"
          placeholder="Enter address"
          value={formData.adress}
          onChange={handleChange}
          required
          style={{ width: "100%" }}
        />
      </div>

      {/* Buttons Row */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
        {onCancel && (
          <Button
            type="button"
            label="Cancel"
            icon="pi pi-times"
            severity="secondary"
            onClick={onCancel}
          />
        )}
        <Button
          type="submit"
          label="Save"
          icon="pi pi-check"
          severity="success"
        />
      </div>
    </form>
  );
};

export default ClientForm;
