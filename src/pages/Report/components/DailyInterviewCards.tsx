// DailyInterviewCards.tsx
import { DailyInterview } from "../types/reportTypes";

interface Props {
  date: string;
  interviews: DailyInterview[];
}

const DailyInterviewCards: React.FC<Props> = ({
  date,
  interviews,
}) => {
  if (!interviews.length) {
    return (
      <div
        className="mt-4 p-4 border-round-lg text-center"
        style={{ background: "#f9fafb" }}
      >
        <p className="text-500 m-0">
          No interviews scheduled for {date}
        </p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "selected":
        return "#22c55e";
      case "rejected":
        return "#ef4444";
      case "pending":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  return (
    <div className="mt-4">
      {/* Header */}
      <div className="mb-3">
        <h3 className="font-semibold m-0" style={{ color: "#1f2937" }}>
          Daily Interview Schedule
        </h3>
        <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
          Interviews conducted on {date}
        </p>
      </div>

      {/* Interview Cards */}
      <div className="grid">
        {interviews.map((interview) => (
          <div
            key={interview.interviewId}
            className="col-12 md:col-6 lg:col-4"
          >
            <div
              className="p-3 border-round-lg h-full"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(249,250,251,0.9))",
                border: "1px solid rgba(220,230,240,0.8)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
            >
              {/* Candidate Info */}
              <div className="mb-2">
                <div
                  className="font-semibold mb-1"
                  style={{ color: "#111827" }}
                >
                  {interview.candidateName}
                </div>
              </div>

              {/* Status Badge */}
              <div className="mb-2">
                <span
                  className="px-2 py-1 border-round text-xs font-medium"
                  style={{
                    background: `${getStatusColor(interview.result)}20`,
                    color: getStatusColor(interview.result),
                  }}
                >
                  {interview.result}
                </span>
              </div>

              {/* Interview Details */}
              <div className="text-sm" style={{ color: "#6b7280" }}>
                <div className="mb-1">
                  <strong>Interviewer:</strong>{" "}
                  {interview.interviewerName}
                </div>
                <div className="mb-1">
                  <strong>Time:</strong>{" "}
                  {interview.fromTime} - {interview.toTime}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyInterviewCards;
