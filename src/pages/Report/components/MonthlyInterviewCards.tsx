// MonthlyInterviewCards.tsx
import { InterviewerStats } from "../types/reportTypes";

interface Props {
  interviewers: InterviewerStats[];
  onViewAllInterviewers: () => void;
  onBackToMonthly: () => void;
  showAllTime: boolean;
}

const MonthlyInterviewCards: React.FC<Props> = ({
  interviewers,
  onViewAllInterviewers,
  onBackToMonthly,
  showAllTime,
}) => {
  if (!interviewers.length) {
    return (
      <div className="mt-4 text-center text-500 p-4">
        No interviewer data available
      </div>
    );
  }

  return (
    <div className="mt-4">
      {/* Heading with CTA Button */}
      <div className="mb-3 flex justify-content-between align-items-center">
        <div>
          <h3 className="font-semibold m-0" style={{ color: "#1f2937" }}>
            {showAllTime
              ? "All-Time Interviewer Report"
              : "Monthly Interviewer Report Summary"}
          </h3>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
            {showAllTime
              ? "Complete interviewer performance history"
              : "Interview distribution, outcomes, and time investment"}
          </p>
        </div>

        {/* CTA/Back Button */}
        {showAllTime ? (
          <button
            onClick={onBackToMonthly}
            className="px-4 py-2 border-round-md font-medium text-sm"
            style={{
              background: "rgba(255,255,255,0.9)",
              color: "#3b82f6",
              border: "1px solid #3b82f6",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#3b82f6";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.9)";
              e.currentTarget.style.color = "#3b82f6";
            }}
          >
            ← Back to Monthly View
          </button>
        ) : (
          <button
            onClick={onViewAllInterviewers}
            className="px-4 py-2 border-round-md font-medium text-sm"
            style={{
              background: "linear-gradient(135deg, #3b82f6, #2563eb)",
              color: "white",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 6px 16px rgba(59, 130, 246, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(59, 130, 246, 0.3)";
            }}
          >
            View All-Time Stats →
          </button>
        )}
      </div>

      {/* Cards - Scrollable Container */}
      <div 
        style={{ 
          maxHeight: "calc(100vh - 280px)",
          overflowY: "auto",
          paddingRight: "8px"
        }}
      >
        {interviewers.map((i) => {
          const totalMinutes =
            typeof i.totalMinutes === "number"
                ? i.totalMinutes
                : i.total * i.avgDuration;

          const total = i.total || 0;
          const totalHours = Math.round(totalMinutes / 60);
          const selectedPercent = total ? Math.round((i.selected / total) * 100) : 0;
          const rejectedPercent = total ? Math.round((i.rejected / total) * 100) : 0;
          const pendingPercent  = total ? Math.round((i.pending / total) * 100) : 0;
          const cancelledPercent = total ? Math.round((i.cancelled / total) * 100) : 0;


          return (
            <div
              key={i.interviewerId}
              className="p-3 mb-3 border-round-lg"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(245,248,252,0.85))",
                border: "1px solid rgba(220,230,240,0.8)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
              }}
            >
              {/* Header */}
              <div className="flex justify-content-between align-items-center mb-3">
                <div className="font-semibold" style={{ color: "#111827" }}>
                  {i.interviewerName}
                </div>
                <div className="text-sm" style={{ color: "#374151" }}>
                  {i.total} Interviews
                </div>
              </div>

              {/* Selected */}
              {i.selected > 0 && (
                <>
                  <div className="text-sm mb-1" style={{ color: "#16a34a" }}>
                    Selected: {i.selected} ({selectedPercent}%)
                  </div>
                  <div className="mb-2">
                    <div
                      style={{
                        height: 6,
                        borderRadius: 4,
                        background: "#e5e7eb",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${selectedPercent}%`,
                          height: "100%",
                          background: "#22c55e",
                        }}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Rejected */}
              {i.rejected > 0 && (
                <>
                  <div className="text-sm mb-1" style={{ color: "#dc2626" }}>
                    Rejected: {i.rejected} ({rejectedPercent}%)
                  </div>
                  <div className="mb-2">
                    <div
                      style={{
                        height: 6,
                        borderRadius: 4,
                        background: "#e5e7eb",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${rejectedPercent}%`,
                          height: "100%",
                          background: "#ef4444",
                        }}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Pending */}
              {i.pending > 0 && (
                <>
                  <div className="text-sm mb-1" style={{ color: "#f59e0b" }}>
                    Pending: {i.pending} ({pendingPercent}%)
                  </div>
                  <div className="mb-2">
                    <div
                      style={{
                        height: 6,
                        borderRadius: 4,
                        background: "#e5e7eb",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${pendingPercent}%`,
                          height: "100%",
                          background: "#fbbf24",
                        }}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Cancelled */}
              {i.cancelled > 0 && (
                <>
                  <div className="text-sm mb-1" style={{ color: "#6b7280" }}>
                    Cancelled: {i.cancelled} ({cancelledPercent}%)
                  </div>
                  <div className="mb-2">
                    <div
                      style={{
                        height: 6,
                        borderRadius: 4,
                        background: "#e5e7eb",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${cancelledPercent}%`,
                          height: "100%",
                          background: "#9ca3af",
                        }}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Footer */}
              <div
                className="flex justify-content-between text-sm mt-3 pt-2"
                style={{ 
                  color: "#6b7280",
                  borderTop: "1px solid rgba(220,230,240,0.6)"
                }}
              >
                <span>Avg Duration: {i.avgDuration} min</span>
                <span>Total: {totalHours} hrs</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyInterviewCards;