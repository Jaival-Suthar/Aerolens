import React from "react";
import { InputTextarea } from "primereact/inputtextarea";

interface EditableListProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  label?: string;
  height?: number;
}

const EditableList: React.FC<EditableListProps> = ({
  items,
  onChange,
  placeholder = "Enter items (one per line)",
  label = "Items",
  height = 200
}) => {
  const cleanBullet = (text: string) =>
    text
      // remove hidden/private unicode chars
      .replace(/[\uE000-\uF8FF]/g, "")
      // remove common bullet symbols and various punctuation
      .replace(/^[\s•▪–—\-*➤►●◦∙■□▪▫○◘◙‣⁃⦾⦿⁌⁍∘∙⋅⚫⚪🔸🔹▸▹►▻⮞⮟↦⇒→➔➜➙➛➝➞➟➠➡➢➣➤➥➦➧➨➩➪➫➬➭➮➯➱➲➳➴➵➶➷➸➹➺➻➼➽➾]+/g, "")
      // remove numbered list patterns (1. 2) etc.)
      .replace(/^\d+[\.\)]\s*/g, "")
      .trim();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {/* Label */}
      <label
        style={{
          fontWeight: 600,
          fontSize: "0.9rem",
          color: "#495057",
          marginBottom: "-0.25rem"
        }}
      >
        {label}
      </label>

      {/* Editable Text Area */}
      <InputTextarea
        value={items.join("\n")}
        onChange={(e) =>
          onChange(
            e.target.value
              .split(/\r?\n/)
              .map((l) => cleanBullet(l))
              .filter(Boolean)
          )
        }
        placeholder={placeholder}
        style={{
          width: "100%",
          height: `${height}px`,
          padding: "1rem",
          border: "1px solid #dee2e6",
          borderRadius: "6px",
          fontSize: "0.95rem",
          lineHeight: "1.6",
          resize: "vertical",
          fontFamily: "inherit",
          backgroundColor: "#ffffff",
          transition: "border-color 0.2s ease"
        }}
        autoResize={false}
        onFocus={(e) => (e.target.style.borderColor = "#86b7fe")}
        onBlur={(e) => (e.target.style.borderColor = "#dee2e6")}
      />
    </div>
  );
};

export default EditableList;