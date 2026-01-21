import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { FaPlus, FaTrash } from "react-icons/fa";

interface EditableListProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  label?: string;
}

const EditableList: React.FC<EditableListProps> = ({
  items,
  onChange,
  placeholder = "Enter item and press Enter or click Add",
  label = "Items"
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    if (inputValue.trim()) {
      onChange([...items, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleEdit = (index: number, newValue: string) => {
    const updated = [...items];
    updated[index] = newValue;
    onChange(updated);
  };

  const handleDelete = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div>
      {/* Input Area */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
        <InputText
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{ flex: 1 }}
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!inputValue.trim()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            background: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: inputValue.trim() ? "pointer" : "not-allowed",
            opacity: inputValue.trim() ? 1 : 0.5
          }}
        >
          <FaPlus /> Add
        </button>
      </div>

      {/* Scrollable List */}
      <div
        style={{
          maxHeight: "300px",
          overflowY: "auto",
          border: "1px solid #ced4da",
          borderRadius: "4px",
          padding: "0.5rem",
          background: "#f9fafb"
        }}
      >
        {items.length === 0 ? (
          <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: 0 }}>
            No {label.toLowerCase()} added yet. Use the input above to add.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {items.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "flex-start",
                  padding: "0.5rem",
                  background: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "4px"
                }}
              >
                <span
                  style={{
                    minWidth: "24px",
                    color: "#6b7280",
                    fontSize: "0.875rem",
                    fontWeight: "600"
                  }}
                >
                  {index + 1}.
                </span>
                <InputTextarea
                  value={item}
                  onChange={e => handleEdit(index, e.target.value)}
                  autoResize
                  rows={1}
                  style={{
                    flex: 1,
                    minHeight: "38px",
                    fontSize: "0.875rem",
                    padding: "0.5rem"
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleDelete(index)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "32px",
                    height: "32px",
                    background: "#fee2e2",
                    border: "1px solid #fecaca",
                    borderRadius: "4px",
                    cursor: "pointer",
                    flexShrink: 0
                  }}
                  title="Delete"
                >
                  <FaTrash style={{ color: "#dc2626", fontSize: "14px" }} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <small style={{ color: "#6b7280", marginTop: "0.5rem", display: "block" }}>
        {items.length} {label.toLowerCase()} added
      </small>
    </div>
  );
};

export default EditableList;