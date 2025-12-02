import React from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { FaSearch } from "react-icons/fa";

type SearchButtonProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  tooltip?: string;
};

const SearchButton: React.FC<SearchButtonProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  disabled = false,
  tooltip = "Search"
}) => (
  <span className="p-input-icon-right" style={{ position: "relative" }}>
    <InputText
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        borderRadius: "25px",
        paddingRight: "3.5rem",
        width: "250px"
      }}
    />
    <Button
      aria-label="Search"
      tooltip={tooltip}
      tooltipOptions={{ position: "bottom" }}
      text
      disabled={disabled}
      className="p-input-icon"
      style={{
        position: "absolute",
        right: "5px",
        top: "50%",
        transform: "translateY(-50%)",
        backgroundColor: "#e3f1fc",
        color: "#1976d2",
        border: "none",
        boxShadow: "none",
        width: 32,
        height: 32,
        padding: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        minWidth: "unset"
      }}
    >
      <FaSearch style={{ color: "#1976d2", fontSize: 16 }} />
    </Button>
  </span>
);

export default SearchButton;