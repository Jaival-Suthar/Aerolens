import React from "react";
import { Button } from "primereact/button";

type ButtonSeverity = "success" | "secondary" | "info" | "warning" | "danger" | "help" | "contrast";

type DialogButtonProps = {
  label: string;
  severity?: ButtonSeverity;
  icon?: React.ReactNode | null;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  loading?: boolean;  // <-- add this line
};

const DialogButton: React.FC<DialogButtonProps> = ({
  label,
  severity = "success",
  icon = null,
  onClick,
  className = "",
  disabled = false,
  loading = false,    // <-- add this default
}) => {
  return (
    <Button
      label={label}
      severity={severity}
      icon={icon}
      size="small"
      onClick={onClick}
      className={`w-auto ${className}`}
      disabled={disabled}
      loading={loading}  // <-- forward loading prop here
      style={{
        padding: "0.4rem 1rem",
        borderRadius: "6px",
        fontWeight: severity === "secondary" ? 500 : 600,
      }}
    />
  );
};

export default DialogButton;
