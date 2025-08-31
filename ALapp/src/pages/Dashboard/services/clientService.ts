// import type { Client } from "../types/Client";

// let clients: Client[] = [
//   { clientId: 1, clientName: "Acme Corp", address: "123 Main St", location: "NY" },
//   { clientId: 2, clientName: "Beta LLC", address: "456 Maple Ave", location: "LA" },
// ];

// // Simulated delay helper
// const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// export const clientService = {
//   async getAll(): Promise<Client[]> {
//     await delay(50);
//     return [...clients];
//   },
//   async add(client: Client): Promise<void> {
//     await delay(50);
//     clients.push(client);
//   },
//   async update(client: Client): Promise<void> {
//     await delay(50);
//     const idx = clients.findIndex((c) => c.clientId === client.clientId);
//     if (idx > -1) clients[idx] = client;
//   },
//   async delete(clientId: number): Promise<void> {
//     await delay(50);
//     clients = clients.filter((c) => c.clientId !== clientId);
//   },
// };
