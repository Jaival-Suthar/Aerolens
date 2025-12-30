// DailyInterviewCards.tsx
import { DailyInterview } from "../types/reportTypes";

interface Props {
  date: string;
  interviews: DailyInterview[];
}
const formatTime = (time24: string): string => {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${minutes} ${period}`;
};

const formatDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-');
  return `${day}-${month}-${year}`;
};

const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
const DailyInterviewCards: React.FC<Props> = ({
  date,
  interviews,
}) => {
  if (!interviews.length) {
    return (
      <div
        className="mt-4 p-4 border-round-lg text-center"
        style={{ 
          background: "#ffffff",
          border: "2px solid transparent",
          backgroundImage: "linear-gradient(white, white), linear-gradient(90deg, rgba(7, 40, 68, 0.2) 0%, rgba(85, 198, 44, 0.2) 100%)",
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box",
        }}
      >
        <p className="m-0" style={{ color: "#374151" }}>
          No interviews scheduled for {date}
        </p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "selected":
        return "#55c62c";
      case "rejected":
        return "#ef4444";
      case "pending":
        return "#f59e0b";
      default:
        return "#374151";
    }
  };

  return (
    <div className="mt-4">
      {/* Header */}
      <div className="mb-3">
        <h3 className="font-semibold m-0" style={{ color: "#072844" }}>
          Daily Interview Schedule
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
        <p className="text-m m-0 font-semibold" style={{ color: "#072844" }}>
          Interviews conducted on {formatDate(date)}
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
                background: "#ffffff",
                border: "2px solid transparent",
                backgroundImage: "linear-gradient(white, white), linear-gradient(90deg, rgba(7, 40, 68, 0.2) 0%, rgba(85, 198, 44, 0.2) 100%)",
                backgroundOrigin: "border-box",
                backgroundClip: "padding-box, border-box",
                boxShadow: "0 2px 8px rgba(7, 40, 68, 0.06)",
                transition: "all 0.3s ease",
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
                  marginBottom: "8px",
                  background: `linear-gradient(135deg, ${getStatusColor(interview.result)}, ${getStatusColor(interview.result)}dd)`,
                  boxShadow: `0 0 8px ${getStatusColor(interview.result)}40`
                }}
              />

              {/* Candidate Info */}
              <div className="mb-2">
                <div
                  className="font-semibold mb-1"
                  style={{ color: "#072844" }}
                >
                  {interview.candidateName}
                </div>
              </div>

              {/* Status Badge */}
              <div className="mb-2">
                <span
                  className="px-2 py-1 border-round text-xs font-semibold"
                  style={{
                    background: `${getStatusColor(interview.result)}15`,
                    color: getStatusColor(interview.result),
                    border: `1px solid ${getStatusColor(interview.result)}30`,
                  }}
                >
                  {capitalizeFirst(interview.result)}
                </span>
              </div>

              {/* Interview Details */}
              <div className="text-sm" style={{ color: "#374151" }}>
                <div className="mb-1">
                  <strong style={{ color: "#072844" }}>Interviewer:</strong>{" "}
                  {interview.interviewerName}
                </div>
                <div className="mb-1">
                  <strong style={{ color: "#072844" }}>Time:</strong>{" "}
                  {formatTime(interview.fromTime)} - {formatTime(interview.toTime)}
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