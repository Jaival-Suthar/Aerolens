// import { useState, useEffect } from "react";
// import type { Client } from "../types/client";
// import { clientService } from "../services/clientService";

// export function useClients() {
//   const [clients, setClients] = useState<Client[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);

//   const fetchClients = async () => {
//     setLoading(true);
//     const data = await clientService.getAll();
//     setClients(data);
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchClients();
//   }, []);

//   return {
//     clients,
//     loading,
//     refresh: fetchClients,
//     setClients,
//   };
// }
