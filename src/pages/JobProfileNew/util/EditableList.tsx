import React, { useEffect, useState } from "react";
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
  const [text, setText] = useState("");

  // Sync external items → textarea
  useEffect(() => {
    setText(items.join("\n"));
  }, [items]);

  const cleanBullet = (text: string) =>
    text
      .replace(/[\uE000-\uF8FF]/g, "")
      .replace(
        /^[\s•▪–—\-*➤►●◦∙■□▪▫○◘◙‣⁃⦾⦿⁌⁍∘∙⋅⚫⚪🔸🔹▸▹►▻⮞⮟↦⇒→➔➜➙➛➝➞➟➠➡➢➣➤➥➦➧➨➩➪➫➬➭➮➯➱➲➳➴➵➶➷➸➹➺➻➼➽➾]+/g,
        ""
      )
      .replace(/^\d+[\.\)]\s*/g, "")
      .trim();

  // User typing (NO cleaning here)
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  // Clean when leaving field
  const handleBlur = () => {
    const cleaned = text
      .split(/\r?\n/)
      .map((l) => cleanBullet(l))
      .filter((l) => l.length > 0);

    onChange(cleaned);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
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

      <InputTextarea
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
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
          backgroundColor: "#ffffff"
        }}
        autoResize={false}
      />
    </div>
  );
};

export default EditableList;