import React from "react";
import { Button } from "primereact/button";
import { FaPencilAlt } from "react-icons/fa"; // Use FontAwesome pencil icon

type EditButtonProps = {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  tooltip?: string;
};

const EditButton: React.FC<EditButtonProps> = ({ onClick, disabled, tooltip }) => (
  <Button
    onClick={onClick}
    disabled={disabled}
    aria-label="Edit"
    tooltip={tooltip || "Edit"}
    tooltipOptions={{ position: "bottom" }}
    rounded
    text={false}
    className="font-medium mr-1"
    style={{
      backgroundColor: "#d1ecf1",   // light blue for edit
      color: "#0c5460",             // dark blue/teal for icon
      border: "none",               // no border
      boxShadow: "none",
      width: 40,                    // perfect circle
      height: 40,
      padding: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}
  >
    <FaPencilAlt style={{ color: "#0c5460", fontSize: 20 }} />
  </Button>
);

export default EditButton;
