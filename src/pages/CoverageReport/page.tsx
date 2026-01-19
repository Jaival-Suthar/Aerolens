import React, { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";

import { useInterviewerReport } from "./hooks/useInterviewerReport";
import InterviewerWorkloadTable from "./components/InterviewerWorkloadTable";
import CoverageReportTable from "./components/CoverageReportTable";
import { useAuth } from "../../shared/auth/AuthContext";
import DateRangeFilter from "./components/DateRangeFilter";

const formatDateDMY = (isoDate: string) => {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
};

const theme = {
  gradient: "linear-gradient(90deg, #072844, #55c62c)",
  primary: "#072844",
  textMuted: "#334155",
  shadow: "0 4px 12px rgba(7, 40, 68, 0.25)",
};

const TAB_PARAM = "tab";

const CoverageReportPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get(TAB_PARAM);
  const [activeTab, setActiveTab] = useState<"WORKLOAD" | "COVERAGE">(
    tabFromUrl === "coverage" ? "COVERAGE" : "WORKLOAD"
  );
  const [dateLabel, setDateLabel] = useState<string>("Past 7 Days Interview Report");

  const { accessToken } = useAuth();
  const report = useInterviewerReport(accessToken);

  // Initialize date range from URL on mount
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

  const handleTabChange = (tab: "WORKLOAD" | "COVERAGE") => {
    setActiveTab(tab);

    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.set(TAB_PARAM, tab === "WORKLOAD" ? "workload" : "coverage");
      return params;
    });
  };

  if (report.error) {
    return (
      <div style={{ padding: 16 }}>
        <Message severity="error" text={report.error} />
      </div>
    );
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    background: active ? theme.gradient : "transparent",
    color: active ? "#ffffff" : theme.textMuted,
    fontWeight: 600,
    padding: "8px 14px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    boxShadow: "none",
    transition: "background-color 0.2s ease, color 0.2s ease",
  });

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
      {/* Top Bar: Tabs + Date Filter */}
      <div
        role="tablist"
        aria-label="Interview report views"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
          paddingBottom: 8,
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        {/* Tabs */}
        <div style={{ display: "flex", gap: 12 }}>
          <button
            role="tab"
            aria-selected={activeTab === "WORKLOAD"}
            aria-label="Interviewer workload report"
            onClick={() => handleTabChange("WORKLOAD")}
            style={tabStyle(activeTab === "WORKLOAD")}
          >
            Interviewer Workload
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "COVERAGE"}
            aria-label="Interview coverage report"
            onClick={() => handleTabChange("COVERAGE")}
            style={tabStyle(activeTab === "COVERAGE")}
          >
            Coverage Report
          </button>
        </div>

        {/* Centered Title */}
        <div
          style={{
            textAlign: "center",
            margin: "0",
            padding: "0",
            flex: 1, 
          }}
        >
          <h2
            style={{
              margin: 0,
              lineHeight: 1.2,
              fontWeight: 600,
              fontSize: "1.75rem",
              background: "linear-gradient(90deg, #072844, #55c62c)",
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
              background: "linear-gradient(90deg, #072844, #55c62c)",
              borderRadius: 4,
            }}
          />
        </div>

        {/* Date Range Filter */}
        <DateRangeFilter
          onApply={handleDateFilter}
          onClear={handleClearFilter}
          initialStartDate={searchParams.get("startDate") || undefined}
          initialEndDate={searchParams.get("endDate") || undefined}
        />
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
            aria-label="Loading report data"
          >
            <ProgressSpinner />
          </div>
        ) : activeTab === "WORKLOAD" ? (
          <InterviewerWorkloadTable
            data={report.data}
            loading={report.loading}
          />
        ) : (
          <CoverageReportTable
            data={report.data}
            loading={report.loading}
          />
        )}
      </div>
    </div>
  );
};

export default CoverageReportPage;