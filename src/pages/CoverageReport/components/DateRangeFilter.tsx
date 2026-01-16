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
        .range-calendar .p-datepicker-header {
          background: linear-gradient(90deg, #072844, #55c62c) !important;
          border: none !important;
          padding: 12px !important;
          border-radius: 8px 8px 0 0 !important;
        }
        
        .range-calendar .p-datepicker-header .p-datepicker-title {
          color: #ffffff !important;
          font-weight: 600 !important;
          font-size: 16px !important;
        }
        
        .range-calendar .p-datepicker-header .p-datepicker-title select {
          color: #ffffff !important;
          font-weight: 600 !important;
        }
        
        .range-calendar .p-datepicker-header .p-datepicker-prev,
        .range-calendar .p-datepicker-header .p-datepicker-next {
          color: #ffffff !important;
        }
        
        .range-calendar .p-datepicker-header .p-datepicker-prev:hover,
        .range-calendar .p-datepicker-header .p-datepicker-next:hover {
          background: rgba(255, 255, 255, 0.1) !important;
        }

        /* Remove default highlights */
        .range-calendar .p-highlight {
          background: transparent !important;
        }

        /* Cell sizing */
        .range-calendar .p-datepicker table td > span {
          width: 40px !important;
          height: 40px !important;
          border-radius: 50% !important;
        }

        .range-calendar .p-datepicker table td {
          padding: 4px !important;
        }

        /* Today indicator - subtle */
        .range-calendar .p-datepicker table td.p-datepicker-today > span {
          background: transparent !important;
          color: inherit !important;
        }

        /* Footer styling */
        .range-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
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

        .calendar-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
        }
      `}</style>

      <div className="calendar-wrapper">
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
                  width: "40px",
                  height: "40px",
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
          panelStyle={{ paddingBottom: 0 }}
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
          className="external-clear-btn"
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