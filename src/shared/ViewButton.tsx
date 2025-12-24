import React from "react";
import { Button } from "primereact/button";
import { FaEye } from "react-icons/fa";

type ViewButtonProps = {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  tooltip?: string;
};

const ViewButton: React.FC<ViewButtonProps> = ({
  onClick,
  disabled,
  tooltip,
}) => (
  <Button
    onClick={onClick}
    disabled={disabled}
    aria-label="View"
    tooltip={tooltip || "View details"}
    tooltipOptions={{ position: "bottom" }}
    rounded
    className="font-medium mr-1"
    style={{
      backgroundColor: "#f0fdf4",
      color: "#2e7d32",
      border: "none",
      boxShadow: "none",
      width: 40,
      height: 40,
      padding: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <FaEye style={{ fontSize: 18 }} />
  </Button>
);

export default ViewButton;
