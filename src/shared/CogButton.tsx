import React from "react";
import { Button } from "primereact/button";
import { FaCog } from "react-icons/fa";

type CogButtonProps = {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  tooltip?: string;
};

const CogButton: React.FC<CogButtonProps> = ({ onClick, disabled, tooltip }) => (
  <Button
    onClick={onClick}
    disabled={disabled}
    aria-label="Settings"
    tooltip={tooltip || "Settings"}
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
      justifyContent: "center",
    }}
  >
    <FaCog style={{ color: "#1976d2", fontSize: 20 }} />
  </Button>
);

export default CogButton;
