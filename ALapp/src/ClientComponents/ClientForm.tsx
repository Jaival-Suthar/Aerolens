import React, { useState } from "react";

interface Client {
  clientId: string;
  clientName: string;
  location: string;
}

interface ClientFormProps {
  onSubmit: (client: Client) => void;
  initialData?: Client;
}

const ClientForm: React.FC<ClientFormProps> = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState<Client>(
    initialData || { clientId: "", clientName: "", location: "" }
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

    // ⏳ Placeholder for API call
    // Example:
    // await fetch("/api/clients", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(formData),
    // });

    onSubmit(formData); // still notify parent
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      <input
        type="text"
        name="clientId"
        placeholder="Client ID"
        value={formData.clientId}
        onChange={handleChange}
      />
      <input
        type="text"
        name="clientName"
        placeholder="Client Name"
        value={formData.clientName}
        onChange={handleChange}
      />
      <input
        type="text"
        name="location"
        placeholder="Location"
        value={formData.location}
        onChange={handleChange}
      />
      <button type="submit">Save</button>
    </form>
  );
};

export default ClientForm;
