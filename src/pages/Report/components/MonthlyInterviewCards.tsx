import React from 'react';
import { InterviewerStats } from '../types/reportTypes';
import { Button } from 'primereact/button';

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
      <div className="mt-4 text-center p-4" style={{ color: "#374151" }}>
        No interviewer data available
      </div>
    );
  }

  return (
    <div className="mt-3">
      {/* Heading with CTA Button */}
      <div className="mb-3 flex justify-content-between align-items-center">
        <div>
          <h3 className="font-semibold m-0" style={{ color: "#072844" }}>
            {showAllTime
              ? "All-Time Interviewer Report"
              : "Monthly Interviewer Report Summary"}
          </h3>
          <div 
            style={{
              width: "60px",
              height: "3px",
              background: "linear-gradient(90deg, #072844, #55c62c)",
              borderRadius: "3px",
              marginTop: "4px",
              marginBottom: "6px"
            }}
          />
          <p className="text-sm m-0" style={{ color: "#374151" }}>
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
              background: "#ffffff",
              color: "#072844",
              border: "2px solid #072844",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#072844";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ffffff";
              e.currentTarget.style.color = "#072844";
            }}
          >
            Back to Monthly View
          </button>
        ) : (
          <button
            onClick={onViewAllInterviewers}
            className="px-5 py-3 border-round-md font-large text-m"
            style={{
              background: "linear-gradient(90deg, #072844, #55c62c)",
              color: "white",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(7, 40, 68, 0.3)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 6px 16px rgba(7, 40, 68, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(7, 40, 68, 0.3)";
            }}
          >
            View All Interviewer Stats
          </button>
        )}
      </div>

      {/* Cards - Scrollable Container */}
      <div 
        style={{ 
          maxHeight: "calc(100vh - 160px)",
          overflowY: "auto",
          paddingRight: "8px"
        }}
      >
        {interviewers.map((i) => {
          const totalMinutes =
          typeof i.totalMinutes === "number"
            ? Math.round(i.totalMinutes)
            : Math.round(i.total * i.avgDuration);


          const total = i.total || 0;
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;
          const selectedPercent = total ? Math.round((i.selected / total) * 100) : 0;
          const rejectedPercent = total ? Math.round((i.rejected / total) * 100) : 0;
          const pendingPercent  = total ? Math.round((i.pending / total) * 100) : 0;
          const cancelledPercent = total ? Math.round((i.cancelled / total) * 100) : 0;


          return (
            <div
              key={i.interviewerId}
              className="p-3 mb-3 border-round-lg"
              style={{
                background: "#ffffff",
                border: "2px solid transparent",
                backgroundImage: "linear-gradient(white, white), linear-gradient(90deg, rgba(7, 40, 68, 0.2) 0%, rgba(85, 198, 44, 0.2) 100%)",
                backgroundOrigin: "border-box",
                backgroundClip: "padding-box, border-box",
                boxShadow: "0 2px 8px rgba(7, 40, 68, 0.06)",
              }}
            >
              {/* Header */}
              <div className="flex justify-content-between align-items-center mb-3">
                <div className="font-semibold" style={{ color: "#072844" }}>
                  {i.interviewerName}
                </div>
                <div 
                  className="text-sm font-medium px-2 py-1"
                  style={{ 
                    color: "#072844",
                    background: "rgba(85, 198, 44, 0.1)",
                    borderRadius: "4px"
                  }}
                >
                  {i.total} Interviews
                </div>
              </div>

              {/* Selected */}
              {i.selected > 0 && (
                <>
                  <div className="text-sm mb-1 font-medium" style={{ color: "#55c62c" }}>
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
                          background: "#55c62c",
                        }}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Rejected */}
              {i.rejected > 0 && (
                <>
                  <div className="text-sm mb-1 font-medium" style={{ color: "#ef4444" }}>
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
                  <div className="text-sm mb-1 font-medium" style={{ color: "#f59e0b" }}>
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
                  <div className="text-sm mb-1 font-medium" style={{ color: "#374151" }}>
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
              {/* Footer */}
<div
  className="flex justify-content-between text-sm mt-3 pt-2"
  style={{
    borderTop: "1px solid rgba(7, 40, 68, 0.08)",
    gap: "8px",
  }}
>
  {/* Avg Duration */}
  <span
    style={{
      padding: "4px 10px",
      borderRadius: "999px",
      background: "rgba(7, 40, 68, 0.08)",
      color: "#072844",
      fontWeight: 600,
    }}
  >
    Avg Duration: {Math.round(i.avgDuration)} min
  </span>

  {/* Total Time */}
  <span
    style={{
      padding: "4px 10px",
      borderRadius: "999px",
      background: "rgba(85, 198, 44, 0.12)",
      color: "#14532d",
      fontWeight: 600,
    }}
  >
    Total: {hours > 0 ? `${hours}h ` : ""}{minutes}m
  </span>
</div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyInterviewCards;