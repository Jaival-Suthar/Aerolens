import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { FaRoute, FaClock, FaUserTie, FaCalendarAlt } from "react-icons/fa";
import { getInterviewsByCandidate } from "../services/candidateInterviewService";
import { useAuth } from "../../../shared/auth/AuthContext";
import { DateTime } from "luxon";
const browserTimezone =
  Intl.DateTimeFormat().resolvedOptions().timeZone;

const normalizeBackendDateTime = (value?: string) => {
  if (!value) return null;

  // "2025-12-20 09:15:00.000000" → "2025-12-20T09:15:00"
  return value.includes(" ")
    ? value.replace(" ", "T").split(".")[0]
    : value;
};

const parseEventToViewerTime = (
  backendDateTime?: string,
  eventTimezone?: string
) => {
  const normalized = normalizeBackendDateTime(backendDateTime);
  if (!normalized || !eventTimezone) return null;

  // 1️⃣ Parse in EVENT timezone (truth)
  const eventDT = DateTime.fromISO(normalized, {
    zone: eventTimezone,
  });

  // 2️⃣ Convert to VIEWER timezone
  return eventDT.setZone(browserTimezone);
};

const formatLocalDate = (
  backendDateTime?: string,
  eventTimezone?: string
) => {
  const dt = parseEventToViewerTime(backendDateTime, eventTimezone);
  return dt ? dt.toFormat("dd MMM yyyy") : "-";
};

const formatTimeRange = (
  fromTime?: string,
  toTime?: string,
  eventTimezone?: string
) => {
  const start = parseEventToViewerTime(fromTime, eventTimezone);
  const end = parseEventToViewerTime(toTime, eventTimezone);

  if (!start || !end) {
    return { text: "-", tooltip: "" };
  }

  return {
    // ⬅️ TZ shown ONCE
    text: `${start.toFormat("hh:mm a")} – ${end.toFormat("hh:mm a")} (${start.offsetNameShort})`,
    tooltip: `Scheduled in ${eventTimezone}`,
  };
};
interface CandidateRoundsDialogProps {
  visible: boolean;
  candidateId: number | null;
  candidateName?: string | null;
  onHide: () => void;
}

interface RoundItem {
  interviewId: number;
  roundNumber: number;
  totalInterviews: number;
  interviewDate: string;
  fromTime: string;
  toTime: string;
  durationMinutes: number;
  result?: string;
  interviewerName: string;
  eventTimezone: string;
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const ResultBadge = ({ result }: { result?: string }) => {
  const status = result || "Pending";

  const styles: Record<
    string,
    { bg: string; border: string; text: string; dot: string }
  > = {
    Selected: {
      bg: "#ecfdf5",
      border: "#10b981",
      text: "#047857",
      dot: "#10b981",
    },
    Rejected: {
      bg: "#fef2f2",
      border: "#ef4444",
      text: "#991b1b",
      dot: "#ef4444",
    },
    Cancelled: {
      bg: "#f3f4f6",
      border: "#6b7280",
      text: "#374151",
      dot: "#6b7280",
    },
    Pending: {
      bg: "#fffbeb",
      border: "#f59e0b",
      text: "#b45309",
      dot: "#f59e0b",
    },
  };

  const s = styles[status];

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 12px",
        borderRadius: 999,
        background: s.bg,
        border: `1.5px solid ${s.border}`,
        color: s.text,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.01em",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: s.dot,
        }}
      />
      {status}
    </div>
  );
};

const CandidateRoundsDialog: React.FC<CandidateRoundsDialogProps> = ({
  visible,
  candidateId,
  candidateName,
  onHide,
}) => {
  const { accessToken } = useAuth();
  const [rounds, setRounds] = useState<RoundItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible || !candidateId || !accessToken) return;

    const loadRounds = async () => {
      setLoading(true);
      try {
        const res = await getInterviewsByCandidate(candidateId, accessToken);
        setRounds(res?.data?.data ?? []);
      } catch (err) {
        console.error("Failed to load rounds:", err);
        setRounds([]);
      } finally {
        setLoading(false);
      }
    };

    loadRounds();
  }, [visible, candidateId, accessToken]);

  useEffect(() => {
    if (!visible) {
      setRounds([]);
      setLoading(false);
    }
  }, [visible]);

  const getStatusColor = (result?: string) => {
    const status = result || "Pending";
    const colors: Record<string, string> = {
      Selected: "#10b981",
      Rejected: "#ef4444",
      Cancelled: "#6b7280",
      Pending: "#f59e0b",
    };
    return colors[status] || "#6b7280";
  };

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      modal
      dismissableMask
      closable
      header={
        <div className="flex align-items-center gap-2">
          <FaRoute style={{ fontSize: 16 }} />
          <span style={{ fontSize: 16, fontWeight: 600 }}>
            Interview Rounds {candidateName ? `– ${candidateName}` : ""}
          </span>
        </div>
      }
      style={{ width: "680px", maxHeight: "90vh" }}
      contentStyle={{ padding: "1.25rem 1.5rem" }}
      className="p-fluid"
    >
      {loading && (
        <p style={{ marginLeft: 36, fontSize: 14, color: "#6b7280" }}>
          Loading rounds…
        </p>
      )}

      {!loading && rounds.length === 0 && (
        <p style={{ marginLeft: 36, fontSize: 14, color: "#6b7280" }}>
          No interview rounds found.
        </p>
      )}

      {!loading && rounds.length > 0 && (
        <div style={{ position: "relative" }}>
          {/* Connecting Line */}
          <div
            style={{
              position: "absolute",
              left: 13,
              top: 20,
              bottom: 20,
              width: 2,
              background: "linear-gradient(180deg, #d1d5db 0%, #e5e7eb 100%)",
            }}
          />

          {rounds.map((round, index) => (
            <div
              key={round.interviewId}
              style={{
                position: "relative",
                display: "flex",
                gap: 16,
                paddingBottom: index !== rounds.length - 1 ? 18 : 0,
              }}
            >
              {/* Timeline Indicator with Glow */}
              <div
                style={{
                  position: "relative",
                  flexShrink: 0,
                  zIndex: 1,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "#ffffff",
                    border: `3px solid ${getStatusColor(round.result)}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 0 0 4px ${getStatusColor(round.result)}14, 0 3px 10px ${getStatusColor(round.result)}28`,
                    fontWeight: 700,
                    fontSize: 12,
                    color: getStatusColor(round.result),
                  }}
                >
                  {round.roundNumber}
                </div>
              </div>

              {/* Content Card */}
              <div
                style={{
                  flex: 1,
                  background: "#ffffff",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: 10,
                  padding: "14px 16px",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                  transition: "all 0.2s ease",
                }}
              >
                {/* Header: Round + Badge */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#111827",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Round {round.roundNumber} of {round.totalInterviews}
                  </span>
                  <ResultBadge result={round.result} />
                </div>

                {/* Details - Organized in rows */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {/* Date & Time Row */}
<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 16,
    fontSize: 13,
    color: "#4b5563",
  }}
>
  {/* Date (derived from fromTime only) */}
  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
    <FaCalendarAlt style={{ color: "#9ca3af", fontSize: 11 }} />
    <span>
      {formatLocalDate(round.fromTime, round.eventTimezone)}
    </span>
  </div>

  {/* Time range (single TZ label + tooltip parity) */}
  {(() => {
    const time = formatTimeRange(
      round.fromTime,
      round.toTime,
      round.eventTimezone
    );

    return (
      <div
        title={time.tooltip}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          cursor: "default"
        }}
      >
        <FaClock style={{ color: "#9ca3af", fontSize: 11 }} />
        <span
          style={{
            borderBottom: "1px dotted #9ca3af",
          }}
        >
          {time.text}
        </span>
      </div>
    );
  })()}

  <span
    style={{
      background: "#f3f4f6",
      padding: "2px 8px",
      borderRadius: 6,
      fontSize: 12,
      fontWeight: 500,
      color: "#374151",
    }}
  >
    {round.durationMinutes} min
  </span>
</div>


                  {/* Interviewer Row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      fontSize: 13,
                    }}
                  >
                    <FaUserTie style={{ color: "#9ca3af", fontSize: 11 }} />
                    <span style={{ fontWeight: 500, color: "#1f2937" }}>
                      {round.interviewerName}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Dialog>
  );
};

export default CandidateRoundsDialog;