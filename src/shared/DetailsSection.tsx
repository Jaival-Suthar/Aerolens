import React from "react";

interface Props {
  title: string;
  children: React.ReactNode;
}

const DetailsSection: React.FC<Props> = ({ title, children }) => {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "12px",
        padding: "1rem 1.25rem",
        marginBottom: "0.9rem",
        border: "1px solid #e5e7eb",
        boxShadow: "0 4px 10px rgba(7, 40, 68, 0.05)",
      }}
    >
      <div style={{ marginBottom: "0.6rem" }}>
        <h4
          style={{
            margin: 0,
            fontSize: "var(--section-title-size)",
            fontWeight: 600,
            color: "#072844",
          }}
        >
          {title}
        </h4>
        <div
          style={{
            width: "42px",
            height: "3px",
            marginTop: "4px",
            background: "linear-gradient(90deg, #072844, #55c62c)",
            borderRadius: "3px",
          }}
        />
      </div>

      {children}
    </div>
  );
};

export default DetailsSection;
