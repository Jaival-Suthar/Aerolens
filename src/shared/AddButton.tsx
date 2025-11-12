import React from "react";
import { Button } from "primereact/button";
import { FaPlus } from "react-icons/fa";

type AddButtonProps = {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  tooltip?: string;
};

const AddButton: React.FC<AddButtonProps> = ({ onClick, disabled, tooltip }) => (
  <Button
    onClick={onClick}
    disabled={disabled}
    aria-label="Add"
    tooltip={tooltip || "Add"}
    tooltipOptions={{ position: "bottom" }}
    rounded
    text={false}
    className="font-medium mr-1"
    style={{
      backgroundColor: "#e3f1fc",
      color: "#1976d2",
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
    <FaPlus style={{ color: "#1976d2", fontSize: 20 }} />
  </Button>
);

export default AddButton;
