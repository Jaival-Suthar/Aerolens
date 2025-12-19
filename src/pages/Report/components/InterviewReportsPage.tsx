// pages/interview/InterviewReportsPage.tsx
import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { useInterviewData } from "../hooks/useInterviewData";
import TopSummaryCards from "../components/TopSummaryCards";
import MonthlyInterviewCards from "../components/MonthlyInterviewCards";
import InterviewCalendar from "../components/InterviewCalendar";
import DailyInterviewCards from "../components/DailyInterviewCards";

interface Props {
  accessToken: string | null;
}

const formatLocalDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

const InterviewReportsPage: React.FC<Props> = ({ accessToken }) => {
  const {
    loading,
    cumulativeSummary,
    monthlyInterviewers,
    monthlyInterviewDates,
    overallInterviewers,
    dailyInterviews,
    fetchMonthlyReport,
    fetchOverallInterviewers,
    fetchDailyReport,
  } = useInterviewData(accessToken);

  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAllTime, setShowAllTime] = useState(false);

  /**
   * 🔥 Derive initial month from URL (or default to current)
   */
  const initialMonth = useMemo(() => {
    let year = Number(searchParams.get("year"));
    let month = Number(searchParams.get("month"));

    const now = new Date();

    if (!Number.isInteger(year) || year < 1970 || year > 2100) {
      year = now.getFullYear();
    }

    if (!Number.isInteger(month) || month < 1 || month > 12) {
      month = now.getMonth() + 1;
    }

    return new Date(year, month - 1, 1);
  }, [searchParams]);

  /**
   * 🔥 Fetch MONTHLY data when month changes
   */
  useEffect(() => {
    const startDate = new Date(
      initialMonth.getFullYear(),
      initialMonth.getMonth(),
      1
    );

    const endDate = new Date(
      initialMonth.getFullYear(),
      initialMonth.getMonth() + 1,
      0
    );

    fetchMonthlyReport(
      formatLocalDate(startDate),
      formatLocalDate(endDate)
    );

    setSelectedDate(null);
    setShowAllTime(false);
  }, [initialMonth]);

  /**
   * 🔥 Fetch DAILY data when date changes
   * SINGLE SOURCE OF TRUTH
   */
  useEffect(() => {
    if (!selectedDate) return;
    fetchDailyReport(selectedDate);
  }, [selectedDate]);

  /**
   * 🔥 Calendar drives navigation
   */
  const handleMonthChange = (year: number, month: number) => {
    setSearchParams({
      year: String(year),
      month: String(month),
    });
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleViewAllInterviewers = async () => {
    setShowAllTime(true);
    await fetchOverallInterviewers();
  };

  const handleBackToMonthly = () => {
    setShowAllTime(false);
  };

  const displayedInterviewers =
    showAllTime && overallInterviewers.length > 0
      ? overallInterviewers
      : monthlyInterviewers;

  const selectableDates = monthlyInterviewDates.map(
    (d) => d.interviewDate
  );

  return (
    <div className="p-1">
      <TopSummaryCards summary={cumulativeSummary} />

      <div className="grid mt-1">
        <div className="col-12 md:col-7">
          <MonthlyInterviewCards
            interviewers={displayedInterviewers}
            onViewAllInterviewers={handleViewAllInterviewers}
            onBackToMonthly={handleBackToMonthly}
            showAllTime={showAllTime}
          />
        </div>

        <div className="col-12 md:col-5">
          <InterviewCalendar
            initialMonth={initialMonth}
            selectableDates={selectableDates}
            onMonthChange={handleMonthChange}
            onDateSelect={handleDateSelect}
          />

          {selectedDate && (
            <div className="mt-3">
              <DailyInterviewCards
                date={selectedDate}
                interviews={dailyInterviews}
              />
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 flex align-items-center justify-content-center">
          <i className="pi pi-spin pi-spinner text-xl" />
        </div>
      )}
    </div>
  );
};

export default InterviewReportsPage;
