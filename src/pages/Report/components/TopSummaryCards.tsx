import React from 'react';

interface CumulativeInterviewSummary {
  total: number;
  selected: number;
  rejected: number;
  pending: number;
}

interface Props {
  summary: CumulativeInterviewSummary | null;
}

const TopSummaryCards: React.FC<Props> = ({ summary }) => {
  if (!summary) {
    return (
      <div className="p-4 text-center" style={{ color: "#374151" }}>
        Loading interview summary…
      </div>
    );
  }

  const stats = [
    { label: "Total", value: summary.total, color: "#072844" },
    { label: "Selected", value: summary.selected, color: "#55c62c" },
    { label: "Rejected", value: summary.rejected, color: "#ef4444" },
    { label: "Pending", value: summary.pending, color: "#f59e0b" },
  ];

  return (
    <div className="mb-3">
      {/* Title with gradient underline */}
      <div className="mb-2 px-1">
        <h3
          className="m-0 font-semibold"
          style={{ 
            color: "#072844", 
            fontSize: "2.0 rem",
            marginBottom: "4px"
          }}
        >
          Aerolens Interview Summary
        </h3>
        <div 
          style={{
            width: "60px",
            height: "3px",
            background: "linear-gradient(90deg, #072844, #55c62c)",
            borderRadius: "3px",
            marginBottom: "6px"
          }}
        />
        <p className="m-0" style={{ color: "#374151", fontSize: "0.875rem" }}>
          Cumulative performance snapshot
        </p>
      </div>

      {/* Compact Cards Grid */}
      <div className="grid" style={{ marginTop: "12px" }}>
        {stats.map((stat, index) => (
          <div key={stat.label} className="col-6 md:col-3 px-2" style={{ marginBottom: "8px" }}>
            <div
              className="border-round-lg p-3 text-center h-full"
              style={{
                background: "#ffffff",
                border: "2px solid transparent",
                backgroundImage: "linear-gradient(white, white), linear-gradient(90deg, #072844 0%, #55c62c 100%)",
                backgroundOrigin: "border-box",
                backgroundClip: "padding-box, border-box",
                boxShadow: "0 4px 8px rgba(7, 40, 68, 0.06)",
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(7, 40, 68, 0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(7, 40, 68, 0.06)";
              }}
            >
              {/* Gradient accent dot */}
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  margin: "0 auto 10px",
                  background: `linear-gradient(135deg, ${stat.color}, ${stat.color}dd)`,
                  boxShadow: `0 0 8px ${stat.color}40`
                }}
              />

              <div
                className="text-xs font-medium mb-2"
                style={{ 
                  color: "#374151", 
                  letterSpacing: "0.03em",
                  textTransform: "uppercase",
                  fontSize: "0.7rem"
                }}
              >
                {stat.label}
              </div>

              <div
                style={{
                  fontSize: "2.25rem",
                  fontWeight: 700,
                  background: "linear-gradient(90deg, #072844, #55c62c)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
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