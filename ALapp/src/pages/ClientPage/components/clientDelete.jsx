import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

const ClientDelete = ({ visible, onHide, onDelete, client }) => {
  return (
    <Dialog
      header="Confirm Delete"
      visible={visible}
      modal
      onHide={onHide}
      style={{ width: "25vw" }}
    >
      <p>
        Are you sure you want to delete client{" "}
        <strong>{client?.clientName || "this client"}</strong>?
      </p>
      <div className="flex justify-end gap-2 mt-4">
        <Button
          label="Cancel"
          className="p-button-text"
          severity="secondary"
          onClick={onHide}
        />
        <Button
          label="Delete"
          severity="danger"
          icon="pi pi-trash"
          onClick={() => {
            onDelete(client);
            onHide();
          }}
          autoFocus
        />
      </div>
    </Dialog>
  );
};

export default ClientDelete;
