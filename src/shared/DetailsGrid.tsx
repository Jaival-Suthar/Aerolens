interface GridItem {
  label: string;
  value: any;
}

interface Props {
  items: GridItem[];
}

const DetailsGrid: React.FC<Props> = ({ items }) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        rowGap: "0.75rem",
        columnGap: "2rem",
      }}
    >
      {items.map(({ label, value }) => (
        <div key={label}>
          <div
            style={{
              fontSize: "var(--label-size)",
              textTransform: "uppercase",
              letterSpacing: "0.03em",
              color: "#374151",
              marginBottom: "2px",
            }}
          >
            {label}
          </div>

          <div
            style={{
              fontSize: "var(--value-size)",
              fontWeight: 500,
              color: "#111827",
              lineHeight: 1.3,
              wordBreak: "break-word",
              whiteSpace: "pre-line",
            }}
          >
            {Array.isArray(value) ? value.join(", ") : String(value)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DetailsGrid;
