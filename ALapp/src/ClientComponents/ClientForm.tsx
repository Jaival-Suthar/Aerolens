import React, { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

interface ClientFormData {
  clientName: string;
  address: string;
}

interface ClientFormProps {
  initialData?: ClientFormData;
  onSubmit: (client: ClientFormData) => void | Promise<void>;
  onCancel?: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ onSubmit, initialData, onCancel }) => {
  const [formData, setFormData] = useState<ClientFormData>(
    initialData || { clientName: "", address: "" }
  );

  // Update form if initialData changes (for editing a different client)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ clientName: "", address: "" });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: "10px", minWidth: "350px" }}>
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
        <label htmlFor="address" style={{ display: "block", marginBottom: "0.5rem" }}>
          Address
        </label>
        <InputText
          id="address"
          name="address"
          placeholder="Enter address"
          value={formData.address}
          onChange={handleChange}
          required
          style={{ width: "100%" }}
        />
      </div>

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
        <Button type="submit" label="Save" icon="pi pi-check" severity="success" />
      </div>
    </form>
  );
};

export default ClientForm;
