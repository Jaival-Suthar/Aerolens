import React from "react";
import { Dialog } from "primereact/dialog";
import type { ClientDeleteProps } from "../types/clientTypes";
import DialogDeleteButton from "../../../shared/DialogDeleteButton";

const ClientDelete: React.FC<ClientDeleteProps> = ({
  visible,
  onHide,
  onDelete,
  client
}) => {
  const dialogFooter = (
  <div className="flex justify-content-end gap-2">
    <DialogDeleteButton
      onCancel={onHide}
      onDelete={async () => {
        try {
          await onDelete(client);
          onHide(); // close ONLY on success
        } catch {
        }
      }}
    />
  </div>
);
  return (
    <Dialog
      header="Confirm Delete"
      footer={dialogFooter}
      visible={visible}
      modal
      onHide={onHide}
      style={{ width: "25vw", minWidth: "300px" }}
    >
      <p>
        Are you sure you want to delete client{" "}
        <strong>{client?.clientName || "this client"}</strong>?
      </p>
    </Dialog>
  );
};

export default ClientDelete;
