import { CumulativeInterviewSummary } from "../types/reportTypes";

interface Props {
  summary: CumulativeInterviewSummary | null;
}

const TopSummaryCards: React.FC<Props> = ({ summary}) => {
 
  if (!summary) {
    return (
      <div className="p-4 border-round-xl mb-4 text-center text-500">
        Loading interview summary...
      </div>
    );
  }

  const stats = [
    { label: "Total Interviews", value: summary.total },
    { label: "Selected", value: summary.selected },
    { label: "Rejected", value: summary.rejected },
    { label: "Pending", value: summary.pending },
  ];

  return (
    <div
      className="p-4 border-round-xl mb-4"
      style={{
        background:
          "linear-gradient(135deg, #ffffff 0%, #f6f9fc 45%, #eef3f8 100%)",
      }}
    >
      {/* Title */}
      <div className="mb-4 text-center">
        <h2 className="font-bold m-0" style={{ color: "#1f2937" }}>
          Total Aerolens Interview Report
        </h2>
        <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
          Overall interview performance overview
        </p>
      </div>

      {/* Cards */}
      <div className="grid">
        {stats.map((stat) => (
          <div key={stat.label} className="col-6 md:col-3">
            <div
              className="p-4 border-round-lg h-full text-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.85), rgba(245,248,252,0.75))",
                backdropFilter: "blur(12px) saturate(140%)",
                WebkitBackdropFilter: "blur(12px) saturate(140%)",
                boxShadow:
                  "0 12px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
                border: "1px solid rgba(220, 230, 240, 0.6)",
              }}
            >
              <div
                className="text-sm font-medium mb-2"
                style={{ color: "rgba(0, 0, 0, 0.9)" }}
              >
                {stat.label}
              </div>

              <div
                className="font-extrabold"
                style={{
                  fontSize: "2.8rem",
                  color: "#000000ff",
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopSummaryCards;
