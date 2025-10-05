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
          onDelete={() => {
            onDelete(client);
            onHide();
          }}
        // loading={loading} // optional, pass if you have loading state
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
