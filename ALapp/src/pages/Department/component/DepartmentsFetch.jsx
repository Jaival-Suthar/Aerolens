import React, { useEffect, useState } from "react";

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch(`${baseUrl}/client`);
        const data = await response.json();
        console.log("Client API response:", data); // 👈 check structure
        setClients(data.data || data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
    fetchClients();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Clients</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {clients.map((client) => (
          <li
            key={client.clientId}
            style={{
              marginBottom: "8px",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              background: "#f9f9f9",
              fontWeight: "bold",
            }}
          >
            {client.clientName}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClientList;
