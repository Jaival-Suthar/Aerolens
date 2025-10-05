import React from "react";
import { Button } from "primereact/button";
import { FaTrash } from "react-icons/fa";

type DeleteButtonProps = {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  tooltip?: string;
};

const DeleteButton: React.FC<DeleteButtonProps> = ({ onClick, disabled, tooltip }) => (
  <Button
    onClick={onClick}
    disabled={disabled}
    aria-label="Delete"
    tooltip={tooltip || "Delete"}
    tooltipOptions={{ position: "bottom" }}
    rounded
    text={false}
    className="font-medium mr-1"
    style={{
      backgroundColor: "#f8d7da",  // pastel red
      color: "#721c24",            // deeper red for icon
      border: "none",
      boxShadow: "none",
      width: 40,
      height: 40,
      padding: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}
  >
    <FaTrash style={{ color: "#721c24", fontSize: 20 }} />
  </Button>
);

export default DeleteButton;
