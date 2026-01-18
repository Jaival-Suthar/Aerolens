import React, { useCallback, useState, useEffect } from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";

import { useInterviewTrackerReport } from "./hooks/useInterviewTracker";
import InterviewTrackerTable from "./components/InterviewTrackerTable";
import DateRangeFilter from "./components/DateRangeFilter";
import { useAuth } from "../../shared/auth/AuthContext";
import ColumnSettingsButton from "../../shared/ColumnSettingsButton";
import {
  ALL_INTERVIEW_TRACKER_COLUMNS,
  DEFAULT_INTERVIEW_TRACKER_COLUMNS,
} from "./components/InterviewTrackerColumns";
import { useSearchParams } from "react-router-dom";

const STORAGE_KEY = "interview-tracker:visible-columns";
const loadVisibleColumns = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const fields: string[] = JSON.parse(raw);

    return ALL_INTERVIEW_TRACKER_COLUMNS.filter(col =>
      fields.includes(col.field)
    );
  } catch {
    return null;
  }
};
const formatDateDMY = (isoDate: string) => {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
};
const HEADER_HEIGHT = 62;
/**
 * Theme tokens (same as before)
 */
const theme = {
  gradient: "linear-gradient(90deg, #072844, #55c62c)",
  primary: "#072844",
  textMuted: "#334155",
  shadow: "0 4px 12px rgba(7, 40, 68, 0.25)",
};

/**
 * Static tab style (always active)
 */
const tabStyle: React.CSSProperties = {
  background: theme.gradient,
  color: "#ffffff",
  fontWeight: 600,
  padding: "8px 14px",
  borderRadius: 6,
  border: "none",
  cursor: "default",
  boxShadow: "none",
};

const InterviewTrackerPage: React.FC = () => {
  const { accessToken } = useAuth();
  const report = useInterviewTrackerReport(accessToken);
  const [searchParams, setSearchParams] = useSearchParams();
  const [dateLabel, setDateLabel] = useState(
    "Past 7 Days Interview Report"
  );
  const [visibleColumns, setVisibleColumns] = useState(() => {
    return (
      loadVisibleColumns() ??
      ALL_INTERVIEW_TRACKER_COLUMNS.filter(col =>
        DEFAULT_INTERVIEW_TRACKER_COLUMNS.includes(col.field)
      )
    );
  });
    useEffect(() => {
    const fields = visibleColumns.map(c => c.field);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fields));
  }, [visibleColumns]);

  useEffect(() => {
    const filter = searchParams.get("filter");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (filter === "custom" && startDate && endDate) {
      report.fetchByDateRange(startDate, endDate);
      setDateLabel(
        `Interview Report from ${formatDateDMY(startDate)} to ${formatDateDMY(endDate)}`
      );
    } else {
      report.fetchDefault();
      setDateLabel("Past 7 Days Interview Report");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDateFilter = useCallback(
    (startDate: string, endDate: string) => {
      report.fetchByDateRange(startDate, endDate);

      setSearchParams(prev => {
        const params = new URLSearchParams(prev);
        params.set("filter", "custom");
        params.set("startDate", startDate);
        params.set("endDate", endDate);
        return params;
      });

      setDateLabel(
        `Interview Report from ${formatDateDMY(startDate)} to ${formatDateDMY(endDate)}`
      );
    },
    [report, setSearchParams]
  );

  
  const handleClearFilter = useCallback(() => {
    report.fetchDefault();

    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.delete("filter");
      params.delete("startDate");
      params.delete("endDate");
      return params;
    });

    setDateLabel("Past 7 Days Interview Report");
  }, [report, setSearchParams]);

  if (report.error) {
    return (
      <div style={{ padding: 16 }}>
        <Message severity="error" text={report.error} />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 16,
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflow: "hidden",
      }}
    >
      {/* Top Bar: Static Tab + Title + Date Filter */}
      <div
        role="tablist"
        aria-label="Interview tracker view"
        style={{
          position: "relative",
          display: "flex",
          height: HEADER_HEIGHT,
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
          paddingBottom: 8,
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        {/* Static Tab */}
        <div style={{ display: "flex", gap: 12 }}>
          <button
            role="tab"
            aria-selected="true"
            style={tabStyle}
          >
            Interview Tracker
          </button>
        </div>

        {/* Center Title */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <h2
            style={{
              margin: 0,
              lineHeight: 1.2,
              fontWeight: 600,
              fontSize: "1.75rem",
              background: theme.gradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {dateLabel}
          </h2>

          <div
            style={{
              width: "64px",
              height: "3px",
              margin: "6px auto",
              background: theme.gradient,
              borderRadius: 4,
            }}
          />
        </div>

        {/* Date Filter */}
        <div
          style={{
            marginLeft: "2px",
            marginRight: "2px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <ColumnSettingsButton
            value={visibleColumns}
            options={ALL_INTERVIEW_TRACKER_COLUMNS}
            optionLabel="header"
            onChange={setVisibleColumns}
            onReset={() =>
              setVisibleColumns(
                ALL_INTERVIEW_TRACKER_COLUMNS.filter(col =>
                  DEFAULT_INTERVIEW_TRACKER_COLUMNS.includes(col.field)
                )
              )
            }
          />
          <DateRangeFilter
            onApply={handleDateFilter}
            onClear={handleClearFilter}
            initialStartDate={searchParams.get("startDate") || undefined}
            initialEndDate={searchParams.get("endDate") || undefined}
          />
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        {report.loading && report.data.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            aria-label="Loading interview tracker data"
          >
            <ProgressSpinner />
          </div>
        ) : (
          <InterviewTrackerTable
            data={report.data}
            loading={report.loading}
            visibleColumns={visibleColumns}
          />
        )}
      </div>
    </div>
  );
};

export default InterviewTrackerPage;