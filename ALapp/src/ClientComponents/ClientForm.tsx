import React, { useState } from "react";

interface ClientFormProps {
  onSubmit: (client: { clientId: string; clientName: string; location: string }) => void;
  initialData?: { clientId: string; clientName: string; location: string };
}

const ClientForm: React.FC<ClientFormProps> = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState(
    initialData || { clientId: "", clientName: "", location: "" }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ⏳ placeholder for API call
    // await fetch("API_ENDPOINT", { method: "POST", body: JSON.stringify(formData) });

    onSubmit(formData); // still notify parent, API will be plugged here
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
