// import React from "react";
// import { Column } from "primereact/column";
// import type { Client } from "../types/Client";
// import { InputText } from "primereact/inputtext";
// import { Button } from "primereact/button";

// interface ClientTableSchemaProps {
//   editingRow: number | null;
//   editClient: Client | null;
//   onEditChange: (field: keyof Client, value: string) => void;
//   onSave: () => void;
//   onCancel: () => void;
//   onEditClick: (client: Client) => void;
//   onDeleteClick: (id: number) => void;
// }

// // Individual cell templates
// const nameBodyTemplate = (
//   rowData: Client,
//   editingRow: number | null,
//   editClient: Client | null,
//   onEditChange: (field: keyof Client, value: string) => void
// ) =>
//   editingRow === rowData.clientId && editClient ? (
//     <InputText
//       value={editClient.clientName}
//       onChange={(e) => onEditChange("clientName", e.target.value)}
//     />
//   ) : (
//     rowData.clientName
//   );

// const addressBodyTemplate = (
//   rowData: Client,
//   editingRow: number | null,
//   editClient: Client | null,
//   onEditChange: (field: keyof Client, value: string) => void
// ) =>
//   editingRow === rowData.clientId && editClient ? (
//     <InputText
//       value={editClient.address}
//       onChange={(e) => onEditChange("address", e.target.value)}
//     />
//   ) : (
//     rowData.address
//   );

// const locationBodyTemplate = (
//   rowData: Client,
//   editingRow: number | null,
//   editClient: Client | null,
//   onEditChange: (field: keyof Client, value: string) => void
// ) =>
//   editingRow === rowData.clientId && editClient ? (
//     <InputText
//       value={editClient.location}
//       onChange={(e) => onEditChange("location", e.target.value)}
//     />
//   ) : (
//     rowData.location
//   );

// const actionsBodyTemplate = (
//   rowData: Client,
//   editingRow: number | null,
//   editClient: Client | null,
//   onSave: () => void,
//   onCancel: () => void,
//   onEditClick: (client: Client) => void,
//   onDeleteClick: (id: number) => void
// ) =>
//   editingRow === rowData.clientId && editClient ? (
//     <>
//       <Button label="Save" icon="pi pi-check" onClick={onSave} className="p-button-sm" />
//       <Button
//         label="Cancel"
//         icon="pi pi-times"
//         onClick={onCancel}
//         className="p-button-danger p-button-sm"
//       />
//     </>
//   ) : (
//     <>
//       <Button
//         label="Edit"
//         icon="pi pi-pencil"
//         onClick={() => onEditClick(rowData)}
//         className="p-button-sm"
//       />
//       <Button
//         label="Delete"
//         icon="pi pi-trash"
//         onClick={() => onDeleteClick(rowData.clientId)}
//         className="p-button-danger p-button-sm"
//       />
//     </>
//   );

// export const ClientTableSchema: React.FC<ClientTableSchemaProps> = ({
//   editingRow,
//   editClient,
//   onEditChange,
//   onSave,
//   onCancel,
//   onEditClick,
//   onDeleteClick,
// }) => {
//   return (
//     <>
//       <Column
//         header="Client Name"
//         field="clientName"
//         body={(rowData: Client) =>
//           nameBodyTemplate(rowData, editingRow, editClient, onEditChange)
//         }
//       />
//       <Column
//         header="Address"
//         field="address"
//         body={(rowData: Client) =>
//           addressBodyTemplate(rowData, editingRow, editClient, onEditChange)
//         }
//       />
//       <Column
//         header="Location"
//         field="location"
//         body={(rowData: Client) =>
//           locationBodyTemplate(rowData, editingRow, editClient, onEditChange)
//         }
//       />
//       <Column
//         header="Actions"
//         body={(rowData: Client) =>
//           actionsBodyTemplate(
//             rowData,
//             editingRow,
//             editClient,
//             onSave,
//             onCancel,
//             onEditClick,
//             onDeleteClick
//           )
//         }
//       />
//     </>
//   );
// };
