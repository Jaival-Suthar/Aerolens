import React, { useState, useCallback } from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";

import { useInterviewerReport } from "./hooks/useInterviewerReport";
import InterviewerWorkloadTable from "./components/InterviewerWorkloadTable";
import CoverageReportTable from "./components/CoverageReportTable";
import { useAuth } from "../../shared/auth/AuthContext";
import DateRangeFilter from "./components/DateRangeFilter";

/**
 * Theme tokens (inline, reused)
 */
const theme = {
  gradient: "linear-gradient(90deg, #072844, #55c62c)",
  primary: "#072844",
  textMuted: "#334155",
  shadow: "0 4px 12px rgba(7, 40, 68, 0.25)",
};

const CoverageReportPage: React.FC = () => {
  const [activeTab, setActiveTab] =
    useState<"WORKLOAD" | "COVERAGE">("WORKLOAD");

  const { accessToken } = useAuth();
  const report = useInterviewerReport(accessToken);

  /**
   * Custom date filter → triggers API
   */
  const handleDateFilter = useCallback(
    (startDate: string, endDate: string) => {
      report.fetchByDateRange(startDate, endDate);
    },
    [report]
  );

  /**
   * 🔥 FIX: Clear handler → restores default past7days data
   */
  const handleClearFilter = useCallback(() => {
    report.fetchDefault();
  }, [report]);

  if (report.error) {
    return (
      <div style={{ padding: 16 }}>
        <Message severity="error" text={report.error} />
      </div>
    );
  }

  /**
   * Tab style factory (inline + stable)
   */
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
            onClick={() => setActiveTab("WORKLOAD")}
            style={tabStyle(activeTab === "WORKLOAD")}
          >
            Interviewer Workload
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "COVERAGE"}
            aria-label="Interview coverage report"
            onClick={() => setActiveTab("COVERAGE")}
            style={tabStyle(activeTab === "COVERAGE")}
          >
            Coverage Report
          </button>
        </div>

        {/* 🔥 FIX: Pass both onApply AND onClear */}
        <DateRangeFilter 
          onApply={handleDateFilter}
          onClear={handleClearFilter}
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