import React, { useEffect, useState } from "react";
import { Accordion, AccordionTab } from "primereact/accordion";
import Department from "./departmentadd/addedit";

const ClientAccordion = () => {
  const [clients, setClients] = useState([]);
  const baseUrl = import.meta.env.VITE_BASE_URL;  // stable

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch(`${baseUrl}/client`);
        const data = await response.json();
        setClients(data.data || data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };

    fetchClients();
  }, []); // ✅ only once

  return (
    <Accordion multiple activeIndex={0}>
      {clients.map((client) => (
        <AccordionTab 
          key={client.clientId} 
          header={client.clientName}
        >
          <div className="m-0">
            <Department />
          </div>
        </AccordionTab>
      ))}
    </Accordion>
  );
};

export default ClientAccordion;
