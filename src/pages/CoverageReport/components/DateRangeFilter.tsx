import { Calendar } from "primereact/calendar";
import { useState, useRef } from "react";
import { FiCheck, FiX } from "react-icons/fi";

const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

interface Props {
  onApply: (startDate: string, endDate: string) => void;
  onClear: () => void;
}

const DateRangeFilter: React.FC<Props> = ({ onApply, onClear }) => {
  const [range, setRange] = useState<Date[] | null>(null);
  const calendarRef = useRef<Calendar>(null);

  const isCompleteRange = range && range.length === 2;

  const apply = () => {
    if (!isCompleteRange) return;

    onApply(
      formatDateLocal(range[0]),
      formatDateLocal(range[1])
    );
    calendarRef.current?.hide(); // 🔥 Close calendar after Apply
  };

  const clear = () => {
    setRange(null);
    onClear();
    calendarRef.current?.hide(); // 🔥 Close calendar after Clear
  };

  return (
    <>
      {/* Enhanced styling matching InterviewCalendar theme */}
      <style>{`
        /* Header styling - gradient background */
        .range-calendar-panel .p-datepicker-header {
          background: linear-gradient(90deg, #072844, #55c62c) !important;
          border: none !important;
          padding: 8px !important;
          border-radius: 8px 8px 0 0 !important;
        }
        
        .range-calendar-panel .p-datepicker-header .p-datepicker-title {
          color: #ffffff !important;
          font-weight: 600 !important;
          font-size: 14px !important;
        }
        
        .range-calendar-panel .p-datepicker-header .p-datepicker-title select {
          color: #ffffff !important;
          font-weight: 700 !important;
        }
        
        .range-calendar-panel .p-datepicker-header .p-datepicker-prev,
        .range-calendar-panel .p-datepicker-header .p-datepicker-next {
          color: #ffffff !important;
        }
        
        .range-calendar-panel .p-datepicker-header .p-datepicker-prev:hover,
        .range-calendar-panel .p-datepicker-header .p-datepicker-next:hover {
          background: rgba(255, 255, 255, 0.1) !important;
        }

        /* Remove default highlights */
        .range-calendar-panel .p-highlight {
          background: transparent !important;
        }

        /* Cell sizing */
        .range-calendar-panel .p-datepicker table td > span {
          width: 32px !important;
          height: 32px !important;
          border-radius: 50% !important;
        }

        .range-calendar-panel .p-datepicker table td {
          padding: 2px !important;
        }
        /* Date number */
        .range-calendar-panel .p-datepicker table td > span > div {
          font-size: 14px !important;
          font-weight: 500;
        }

        /* Today indicator - subtle */
        .range-calendar-panel .p-datepicker table td.p-datepicker-today > span {
          background: transparent !important;
          color: inherit !important;
        }
        .range-calendar-panel .p-datepicker-title .p-datepicker-month,
        .range-calendar-panel .p-datepicker-title .p-datepicker-year {
          color: #ffffff !important;
          font-weight: 700;
        }
        .range-calendar-panel .p-datepicker-prev,
        .range-calendar-panel .p-datepicker-next {
          color: #ffffff !important;
        }
        /* Footer styling */
        .range-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px;
          border-top: 1px solid #e5e7eb;
          background: #ffffff;
        }

        .range-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
          font-size: 14px;
        }

        .apply-btn {
          background: linear-gradient(90deg, #072844, #55c62c);
          color: #ffffff;
        }

        .apply-btn:hover:not(:disabled) {
          box-shadow: 0 0 12px rgba(7,40,68,.35), 0 0 18px rgba(85,198,44,.25);
          transform: translateY(-1px);
        }

        .apply-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .clear-btn {
          background: transparent;
          color: #072844;
          border: 1px solid #072844;
        }

        .clear-btn:hover {
          background: rgba(7, 40, 68, 0.05);
        }

        /* External Clear Button */
        .external-clear-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 6px;
          background: transparent;
          color: #072844;
          border: 1px solid #072844;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .external-clear-btn:hover {
          background: rgba(7, 40, 68, 0.05);
        }

        .external-clear-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .date-filter-container {
          position: relative;
          display: flex;
          align-items: center;
        }
        .range-calendar-panel .p-datepicker-calendar {
          table-layout: fixed;
          width: 100%;
        }

        .range-calendar-panel .p-datepicker-calendar th,
        .range-calendar-panel .p-datepicker-calendar td {
          padding: 2px !important;
        }

        .range-calendar-panel .p-datepicker-calendar th span {
          font-size: 14px;
        }
      `}</style>

      <div className="date-filter-container">
        <Calendar
          ref={calendarRef}
          value={range}
          onChange={(e) => setRange(e.value as Date[])}
          selectionMode="range"
          hideOnRangeSelection={false}
          readOnlyInput
          showIcon
          dateFormat="dd/mm/yy"
          className="range-calendar"
          placeholder="Select date range"
          aria-label="Select date range"
          panelClassName="range-calendar-panel"
          dateTemplate={(date) => {
            const d = new Date(date.year, date.month, date.day);
            const start = range?.[0];
            const end = range?.[1];

            const isStart = start && d.toDateString() === start.toDateString();
            const isEnd = end && d.toDateString() === end.toDateString();
            const isBetween = start && end && d > start && d < end;

            return (
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  fontSize: 14,
                  fontWeight: isStart || isEnd ? 600 : 500,
                  cursor: "pointer",
                  position: "relative",
                  // Start/End dates - full gradient with glow
                  ...(isStart || isEnd
                    ? {
                        background: "linear-gradient(90deg, #072844, #55c62c)",
                        color: "#ffffff",
                        boxShadow:
                          "0 0 15px rgba(7, 40, 68, 0.4), 0 0 25px rgba(85, 198, 44, 0.3)",
                      }
                    : {}),
                  // Between dates - subtle gradient background
                  ...(isBetween
                    ? {
                        background: "linear-gradient(90deg, rgba(7, 40, 68, 0.15), rgba(85, 198, 44, 0.15))",
                        color: "#072844",
                      }
                    : {}),
                  // Regular dates
                  ...(!isStart && !isEnd && !isBetween
                    ? {
                        color: "#475569",
                      }
                    : {}),
                }}
              >
                {date.day}
              </div>
            );
          }}
          panelStyle={{
            maxWidth: "300px",
            minWidth: "unset"
          }}
          footerTemplate={() => (
            <div className="range-footer">
              <button className="range-btn clear-btn" onClick={clear}>
                <FiX /> Clear
              </button>
              <button
                className="range-btn apply-btn"
                disabled={!isCompleteRange}
                onClick={apply}
              >
                <FiCheck /> Apply
              </button>
            </div>
          )}
        />
        
        {/* External Clear Button */}
        <button
          className="external-clear-btn ml-1"
          onClick={clear}
          disabled={!range}
          title="Clear date range"
          aria-label="Clear date range"
        >
          <FiX size={18} />
        </button>
      </div>
    </>
  );
};

export default DateRangeFilter;