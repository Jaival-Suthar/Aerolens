import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { FiEye, FiEyeOff } from "react-icons/fi";

type PasswordInputProps = {
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
};

export const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  autoComplete,
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <InputText
        type={visible ? "text" : "password"}
        className="w-full"
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        style={{ paddingRight: "2.5rem" }}
      />

      <span
        onClick={() => setVisible((v) => !v)}
        style={{
          position: "absolute",
          right: "0.75rem",
          top: "50%",
          transform: "translateY(-50%)",
          cursor: "pointer",
          color: "#6b7280",
        }}
      >
        {visible ? <FiEyeOff size={18} /> : <FiEye size={18} />}
      </span>
    </div>
  );
};