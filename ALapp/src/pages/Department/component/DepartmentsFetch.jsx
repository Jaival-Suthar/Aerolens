import React, { useEffect, useState } from "react";
import { Accordion, AccordionTab } from "primereact/accordion";
import Department from "./departmentadd/addedit";

const ClientAccordion = () => {
  const [clients, setClients] = useState([]);
  const baseUrl = import.meta.env.VITE_BASE_URL; // 👈 from .env
  const fetchClients = async () => {   //
    try {
      const response = await fetch(`${baseUrl}/client`); 
      const data = await response.json();                
      console.log("API response:", data);
      setClients(data.data || data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };
  useEffect(() => {
    
    fetchClients(); // calling the fetch function
  }, [baseUrl]);
  
  return (
    <Accordion multiple activeIndex={0}>
      {clients.map((client) => (
        <AccordionTab 
          key={client.clientId} 
          header={ client.clientName}  
        >
          <div className="m-0">
             <p><Department/></p>
          </div>
        </AccordionTab>
      ))}
    </Accordion>
  );
}  
export default ClientAccordion;
