import { Calendar, CalendarMonthChangeEvent } from "primereact/calendar";
import { useState, useEffect, useRef } from "react";

interface Props {
  initialMonth: Date;
  selectableDates: string[];
  onMonthChange: (year: number, month: number) => void;
  onDateSelect: (date: string) => void;
}

const InterviewCalendar: React.FC<Props> = ({
  initialMonth,
  selectableDates,
  onMonthChange,
  onDateSelect,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // 🔥 Calendar owns its month
  const [currentMonth, setCurrentMonth] = useState<Date>(() => 
    new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1)
  );
  
  // Track if change came from internal navigation
  const isInternalChange = useRef(false);

  // Sync ONLY when URL changes externally (not from our own navigation)
  useEffect(() => {
    // If this change came from our handleMonthChange, ignore it
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    
    const urlYear = initialMonth.getFullYear();
    const urlMonth = initialMonth.getMonth();
    
    const currentYear = currentMonth.getFullYear();
    const currentMonthIdx = currentMonth.getMonth();
    
    if (urlYear !== currentYear || urlMonth !== currentMonthIdx) {
      setCurrentMonth(new Date(urlYear, urlMonth, 1));
    }
  }, [initialMonth]);

  const handleMonthChange = (e: CalendarMonthChangeEvent) => {
    const targetYear = e.year;
    const targetMonth = e.month - 1; // 🔥 SUBTRACT 1

    // Mark this as internal change to prevent sync loop
    isInternalChange.current = true;
    
    const newMonth = new Date(targetYear, targetMonth, 1);
    setCurrentMonth(newMonth);
    setSelectedDate(null);

    // Notify parent (1-based month)
    onMonthChange(targetYear, targetMonth + 1);
  };

  const handleDateSelect = (e: any) => {
    if (!(e.value instanceof Date)) return;
    
    const localDate = e.value;
    const dateStr = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, "0")}-${String(localDate.getDate()).padStart(2, "0")}`;
    
    if (!selectableDates.includes(dateStr)) {
      return;
    }
    setSelectedDate(localDate);
    onDateSelect(dateStr);
  };

  return (
    <>
      <style>{`
        .interview-calendar .p-datepicker table td > span {
          width: 100% !important;
          height: 100% !important;
          border-radius: 50% !important;
        }
        
        .interview-calendar .p-datepicker table td {
          padding: 4px !important;
        }
        
        .interview-calendar .p-datepicker table td.p-datepicker-today > span {
          background: transparent !important;
          color: inherit !important;
        }
        
        .interview-calendar .p-highlight {
          background: transparent !important;
        }
        
        .interview-calendar .p-datepicker-header {
          background: linear-gradient(90deg, #072844, #55c62c) !important;
          border: none !important;
          padding: 12px !important;
          border-radius: 8px 8px 0 0 !important;
        }
        
        .interview-calendar .p-datepicker-header .p-datepicker-title {
          color: #ffffff !important;
          font-weight: 600 !important;
          font-size: 16px !important;
        }
        
        .interview-calendar .p-datepicker-header .p-datepicker-title select {
          color: #ffffff !important;
          font-weight: 600 !important;
        }
        
        .interview-calendar .p-datepicker-header .p-datepicker-prev,
        .interview-calendar .p-datepicker-header .p-datepicker-next {
          display: none !important;
        }
        
        .interview-calendar .p-datepicker-header .p-datepicker-month,
        .interview-calendar .p-datepicker-header .p-datepicker-year {
          color: #ffffff !important;
        }

        .interview-calendar .p-datepicker-header span {
          color: #ffffff !important;
        }
      `}</style>
      
      <Calendar
        value={selectedDate}
        inline
        viewDate={currentMonth} // 🔥 INTERNAL state, not parent-controlled
        showOtherMonths
        selectOtherMonths={false}
        className="interview-calendar"
        
        style={{
          width: "100%",
          minWidth: "100%",
        }}

        panelStyle={{
          width: "100%",
        }}

        onMonthChange={handleMonthChange}
        onSelect={handleDateSelect}

        dateTemplate={(date) => {
          const dateStr = `${date.year}-${String(date.month + 1).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
          const isEnabled = selectableDates.includes(dateStr);
          
          const isSelected = selectedDate && 
            selectedDate.getDate() === date.day &&
            selectedDate.getMonth() === date.month &&
            selectedDate.getFullYear() === date.year;

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
                fontWeight: 500,
                cursor: isEnabled ? "pointer" : "default",
                position: "relative",
                ...(isEnabled && !isSelected ? {
                  background: "linear-gradient(90deg, #072844, #55c62c)",
                  padding: "2px",
                } : {}),
                ...(isSelected && isEnabled ? {
                  background: "linear-gradient(90deg, #072844, #55c62c)",
                  color: "#ffffff",
                  fontWeight: 600,
                  boxShadow: "0 0 15px rgba(7, 40, 68, 0.4), 0 0 25px rgba(85, 198, 44, 0.3)",
                } : {}),
                ...(!isEnabled ? {
                  color: "#9ca3af",
                  background: "transparent",
                } : {}),
              }}
            >
              {isEnabled && !isSelected ? (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    background: "#ffffff",
                    color: "#072844",
                  }}
                >
                  {date.day}
                </div>
              ) : (
                date.day
              )}
            </div>
          );
        }}
      />
    </>
  );
};

export default InterviewCalendar;