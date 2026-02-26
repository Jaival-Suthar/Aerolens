import React, { useState, useRef, useEffect } from "react";
import DialogButton from "../../../shared/DialogAddEditButton";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Toast } from "primereact/toast";
import { FaCheck, FaClock, FaCalendarAlt } from "react-icons/fa";
import { getInterviewFormData, createInterview, updateInterview, getInterviewerDailyCapacity } from "../services/interviewService";
import { useAuth } from "../../../shared/auth/AuthContext";
import { Interview, CreateInterviewRequest, UpdateInterviewRequest, InterviewerDailyCapacity } from "../types/interviewTypes";
import { DateTime } from "luxon";

// ============================================================
// TIME CONVERSION UTILITIES
// ============================================================
const DEFAULT_TIMEZONE =
  Intl.DateTimeFormat().resolvedOptions().timeZone;
const TIMEZONE_OPTIONS =
  typeof Intl.supportedValuesOf === "function"
    ? Intl.supportedValuesOf("timeZone").map(tz => ({
        label: tz,
        value: tz
      }))
    : [
        { label: "Asia/Kolkata", value: "Asia/Kolkata" },
        { label: "America/New_York", value: "America/New_York" },
        { label: "America/Los_Angeles", value: "America/Los_Angeles" }
      ];

const normalizeBackendDateTime = (dateTime: string): string => {
  // Handles: "2025-12-20 09:15:00.000000" → "2025-12-20T09:15:00"
  if (dateTime.includes(' ')) {
    return dateTime.replace(' ', 'T').split('.')[0];
  }
  return dateTime;
};

const convert24to12 = (time24: string): { hour12: number; minute: number; period: 'AM' | 'PM' } => {
  if (!time24) return { hour12: 9, minute: 0, period: 'AM' };
  
  const [hours, minutes] = time24.split(':').map(Number);
  
  let hour12 = hours % 12;
  if (hour12 === 0) hour12 = 12;
  
  const period = hours >= 12 ? 'PM' : 'AM';
  
  return { hour12, minute: minutes, period };
};

const convert12to24 = (hour12: number, minute: number, period: 'AM' | 'PM'): string => {
  let hour24 = hour12;
  
  if (period === 'AM') {
    if (hour12 === 12) hour24 = 0;
  } else {
    if (hour12 !== 12) hour24 = hour12 + 12;
  }
  
  return `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

type InterviewFormState = {
  interviewDate: Date | null;

  // UI-only
  hour12: number;
  minute: number;
  period: "AM" | "PM";

  // API-aligned
  durationMinutes: number;
  interviewerId: number | null;
  scheduledById: number | null;
  eventTimezone: string;
};


interface AddEditInterviewFormProps {
  visible: boolean;
  isEdit?: boolean;
  interviewToEdit?: Interview | null;
  onHide: () => void;
  onSuccess: () => void;
  candidateId?: number;
  candidateName?: string;
  externalToast?: React.RefObject<Toast>;
}



interface ValidationErrors {
  interviewDate?: string;
  time?: string;
  durationMinutes?: string;
  candidateId?: string;
  interviewerId?: string;
  scheduledById?: string;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

const InterviewAddEditForm: React.FC<AddEditInterviewFormProps> = ({
  visible,
  isEdit = false,
  interviewToEdit = null,
  onHide,
  onSuccess,
  candidateId,
  candidateName, 
  externalToast,
}) => {
  const toast = useRef<Toast>(null);
  const toastRef = externalToast || toast; 
  const [loading, setLoading] = useState(false);
  const [interviewers, setInterviewers] = useState<any[]>([]);
  const [recruiters, setRecruiters] = useState<any[]>([]);
  const { accessToken } = useAuth();
  const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false);
  const [formData, setFormData] = useState<InterviewFormState>({
    interviewDate: null,
    hour12: 9,
    minute: 0,
    period: 'AM',
    durationMinutes: 60,
    interviewerId: null,
    scheduledById: null,
    eventTimezone: DEFAULT_TIMEZONE,
  });
  const [capacityData, setCapacityData] = useState<InterviewerDailyCapacity | null>(null);
  const [capacityLoading, setCapacityLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  // Viewer (browser) timezone
  const browserTimezone =
    Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Calculate viewer-time context (read-only, UI-only)
  const getViewerTimeContext = () => {
    if (!formData.interviewDate) return null;

    const dateStr = DateTime
      .fromJSDate(formData.interviewDate)
      .toFormat('yyyy-MM-dd');

    const time24 = convert12to24(
      formData.hour12,
      formData.minute,
      formData.period
    );

    // Build datetime in EVENT timezone (user intent)
    const eventDT = DateTime.fromISO(`${dateStr}T${time24}`, {
      zone: formData.eventTimezone
    });

    // Convert to viewer timezone
    const viewerDT = eventDT.setZone(browserTimezone);

    return {
      date: viewerDT.toFormat('dd MMM yyyy'),
      time: viewerDT.toFormat('hh:mm a'),
      timezone: viewerDT.offsetNameShort,
      isDifferentDay: eventDT.day !== viewerDT.day
    };
  };

  const viewerContext = getViewerTimeContext();

  // Generate hour options (1-12)
  const hourOptions = Array.from({ length: 12 }, (_, i) => ({
    label: String(i + 1).padStart(2, '0'),
    value: i + 1
  }));

  // Generate minute options (00, 15, 30, 45)
  const minuteOptions = [
    { label: '00', value: 0 },
    { label: '15', value: 15 },
    { label: '30', value: 30 },
    { label: '45', value: 45 }
  ];

  const periodOptions = [
    { label: 'AM', value: 'AM' },
    { label: 'PM', value: 'PM' }
  ];
  
  const loadInterviewerCapacity = async (
    interviewerId: number,
    date: Date,
    timezone: string
  ) => {
    try {
      setCapacityLoading(true);

      const formattedDate = DateTime
        .fromJSDate(date)
        .toFormat("yyyy-MM-dd");

      const res = await getInterviewerDailyCapacity(
        accessToken!,
        interviewerId,
        formattedDate,
        timezone
      );

      setCapacityData(res.data);
    } catch (err) {
      console.error("Capacity fetch error", err);
      setCapacityData(null);
    } finally {
      setCapacityLoading(false);
    }
  };

  const loadFormData = async () => {
    try {
      const res = await getInterviewFormData(accessToken!);
      const data = res.data;

      setInterviewers(
        data.interviewers.map((i: any) => ({
          label: i.interviewerName,
          value: i.interviewerId,
        }))
      );

      setRecruiters(
        data.recruiters.map((r: any) => ({
          label: r.recruiterName,
          value: r.recruiterId,
        }))
      );
    } catch (err: any) {
      toastRef.current?.show({
        severity: "error",
        summary: "Error Loading Form",
        detail: err.message || "Failed to fetch form data",
        life: 2000,
      });
    }
  };

  useEffect(() => {
    if (
      formData.interviewerId &&
      formData.interviewDate
    ) {
      loadInterviewerCapacity(
        formData.interviewerId,
        formData.interviewDate,
        formData.eventTimezone
      );
    } else {
      setCapacityData(null);
    }
  }, [
    formData.interviewerId,
    formData.interviewDate,
    formData.eventTimezone
  ]);
  // Effect to set form data
  useEffect(() => {
    if (visible) {
      loadFormData();
    }

    if (visible && isEdit && interviewToEdit) {
      // Parse the backend datetime in the EVENT timezone (not browser timezone)
      const eventDT = DateTime.fromISO(
        interviewToEdit.eventTimestamp,
        { setZone: true } // 👈 CRITICAL
      );
      
      // Extract date and time in the ORIGINAL event timezone
      const { hour12, minute, period } = convert24to12(eventDT.toFormat('HH:mm'));
      const eventDateOnly = DateTime.fromObject(
        {
          year: eventDT.year,
          month: eventDT.month,
          day: eventDT.day
        },
        { zone: interviewToEdit.eventTimezone }
      );

      setFormData({
        interviewDate: eventDateOnly.toJSDate(), // safe now
        hour12,
        minute,
        period,
        durationMinutes: interviewToEdit.durationMinutes,
        interviewerId: interviewToEdit.interviewerId,
        scheduledById: interviewToEdit.scheduledById,
        eventTimezone: interviewToEdit.eventTimezone,
      });
    } else if (visible && !isEdit) {
      resetForm();
    }
  }, [visible, isEdit, interviewToEdit]);

  const getLocalScheduledTimes = () => {
    if (!capacityData?.scheduledTimesUTC) return [];

    const browserTz =
      Intl.DateTimeFormat().resolvedOptions().timeZone;

    return capacityData.scheduledTimesUTC.map((utcTime) =>
      DateTime
        .fromISO(utcTime, { zone: "utc" })
        .setZone(browserTz)
        .toFormat("hh:mm a")
    );
  };

  const mapBackendErrors = (apiError: any): ValidationErrors => {
  const mapped: ValidationErrors = {};
  const errorCode = apiError?.error;
  const details = apiError?.details || {};

  if (
    errorCode === "INTERVIEWER_TIME_CONFLICT" ||
    errorCode === "CANDIDATE_TIME_CONFLICT"
  ) {
    // 🔴 highlight-only fields
    if (details.interviewerId) mapped.interviewerId = "conflict";
    if (details.interviewDate) mapped.interviewDate = "conflict";

    // 🟡 single visible message
    if (details.fromTime) mapped.time = apiError.message;

    return mapped;
  }

  return mapped;
};

  const handleTimezoneChange = (newTz: string) => {
  if (!formData.interviewDate) {
    setFormData(prev => ({ ...prev, eventTimezone: newTz }));
    return;
  }

  const dateStr = DateTime
  .fromJSDate(formData.interviewDate)
  .toFormat('yyyy-MM-dd');
  const time24 = convert12to24(
    formData.hour12,
    formData.minute,
    formData.period
  );

  // Build in OLD timezone
  const oldDT = DateTime.fromISO(`${dateStr}T${time24}`, {
    zone: formData.eventTimezone
  });

  // Convert to NEW timezone
  const newDT = oldDT.setZone(newTz);

  setFormData(prev => ({
    ...prev,
    eventTimezone: newTz,
    hour12: newDT.hour % 12 || 12,
    minute: newDT.minute,
    period: newDT.hour >= 12 ? "PM" : "AM"
  }));
};
  // Validation
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    if (!isEdit && !candidateId) {
    toastRef.current?.show({
      severity: "error",
      summary: "No Candidate Selected",
      detail: "Please select a candidate from the interview list first",
      life: 2000,
    });
    return false;
  }
    // Interview Date validation
    if (!formData.interviewDate) {
      newErrors.interviewDate = "Interview date is required";
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(formData.interviewDate);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (!formData.interviewDate) {
        newErrors.interviewDate = "Interview date is required";
      }
    }

    // Time validation
    if (!formData.hour12 || formData.minute === null || formData.minute === undefined) {
      newErrors.time = "Time is required";
    }

    // Duration validation
    if (!formData.durationMinutes) {
      newErrors.durationMinutes = "Duration is required";
    } else if (formData.durationMinutes < 15) {
      newErrors.durationMinutes = "Minimum duration is 15 minutes";
    } else if (formData.durationMinutes > 480) {
      newErrors.durationMinutes = "Maximum duration is 480 minutes (8 hours)";
    }

    // Interviewer validation
    if (!formData.interviewerId) {
      newErrors.interviewerId = "Interviewer selection is required";
    }

    // Scheduled By validation
    if (!formData.scheduledById) {
      newErrors.scheduledById = "Scheduler selection is required";
    }

    // For Edit: Check if anything changed (INTENT-BASED)
    if (isEdit && interviewToEdit) {
      const currentTime24 = convert12to24(
        formData.hour12,
        formData.minute,
        formData.period
      );

      const selectedDate = DateTime
        .fromJSDate(formData.interviewDate!)
        .toFormat('yyyy-MM-dd');

      // ✅ Parse ORIGINAL intent timestamp (DO NOT convert)
      const originalEventDT = DateTime.fromISO(
        interviewToEdit.eventTimestamp,
        { setZone: true }
      );

      const originalDate = originalEventDT.toFormat('yyyy-MM-dd');
      const originalTime = originalEventDT.toFormat('HH:mm');

      const hasChanges =
        selectedDate !== originalDate ||
        currentTime24 !== originalTime ||
        formData.durationMinutes !== interviewToEdit.durationMinutes ||
        formData.interviewerId !== interviewToEdit.interviewerId ||
        formData.scheduledById !== interviewToEdit.scheduledById ||
        formData.eventTimezone !== interviewToEdit.eventTimezone;

      if (!hasChanges) {
        toastRef.current?.show({
          severity: "warn",
          summary: "No Changes",
          detail: "Please modify at least one field to update",
          life: 2000,
        });
        return false;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async () => {
  if (!validateForm()) return;

  setLoading(true);

  // Convert 12-hour time to 24-hour format for backend
  const time24 = convert12to24(formData.hour12, formData.minute, formData.period);
  const formattedDate = DateTime
    .fromJSDate(formData.interviewDate!)
    .toFormat('yyyy-MM-dd');
    const eventDT = DateTime.fromISO(
    `${formattedDate}T${time24}`,
    { zone: formData.eventTimezone }
  );

  if (!eventDT.isValid) {
    toastRef.current?.show({
      severity: "error",
      summary: "Invalid Time Selection",
      detail: `The selected time does not exist in ${formData.eventTimezone} due to Daylight Saving Time.`,
      life: 4000,
    });
    setLoading(false);
    return;
  }
  const payload: CreateInterviewRequest | UpdateInterviewRequest = {
  interviewDate: formattedDate,
  fromTime: time24,
  durationMinutes: formData.durationMinutes,
  interviewerId: formData.interviewerId!,
  scheduledById: formData.scheduledById!,
  eventTimezone: formData.eventTimezone,
};


  try {
    if (isEdit && interviewToEdit) {
      await updateInterview(interviewToEdit.interviewId, payload, accessToken!);

      toastRef.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Interview updated successfully",
        life: 2000,
      });
    } else {
      await createInterview(candidateId!, payload, accessToken!);

      if (!externalToast) {
        toastRef.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Interview created successfully",
          life: 2000,
        });
      }
    }

    resetForm();
    onSuccess();
    onHide();
  } catch (err: any) {
  const fieldErrors = mapBackendErrors(err);
  setErrors(fieldErrors);

  toastRef.current?.show({
    severity: "error",
    summary: err.error || "Error",
    detail: err.message,
    life: 3000,
  });
}
 finally {
    setLoading(false);
  }
};

  // Helpers
  const resetForm = () => {
    setFormData({
      interviewDate: null,
      hour12: 9,
      minute: 0,
      period: 'AM',
      durationMinutes: 60,
      interviewerId: null,
      scheduledById: null,
      eventTimezone: DEFAULT_TIMEZONE
    });
    setErrors({});
  };

  const handleHide = () => {
    resetForm();
    onHide();
  };

  const handleInputChange = (
    field: keyof InterviewFormState,
    value: any
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };


  // Calculate end time in 12-hour format
  const calculateEndTime = () => {
    if (!formData.hour12 || formData.minute === null || !formData.durationMinutes) return "";
    
    try {
      // Convert to 24-hour, add duration, convert back to 12-hour
      const startTime24 = convert12to24(formData.hour12, formData.minute, formData.period);
      const [hours, minutes] = startTime24.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes + formData.durationMinutes;
      const endHours = Math.floor(totalMinutes / 60) % 24;
      const endMinutes = totalMinutes % 60;
      
      const endTime24 = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
      const { hour12, minute, period } = convert24to12(endTime24);
      
      return `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
    } catch {
      return "";
    }
  };

  // Current selected time display
  const displayTime = `${String(formData.hour12).padStart(2, '0')}:${String(formData.minute).padStart(2, '0')} ${formData.period}`;

  // Dialog Footer
  const dialogFooter = (
  <div className="flex justify-content-end gap-2">
    <DialogButton
      label="Cancel"
      severity="secondary"
      onClick={handleHide}
      disabled={loading}
    />

    <DialogButton
      label={isEdit ? "Save Changes" : "Schedule Interview"}
      severity="success"
      icon={<FaCheck style={{ fontSize: 16, marginRight: 8 }} />}
      onClick={handleSubmit}
      loading={loading}
      disabled={loading}
    />
  </div>
);

  const endTime = calculateEndTime();

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header={
          isEdit
            ? `Edit Interview ID ${interviewToEdit?.interviewId}`
            : "Schedule New Interview"
        }
        visible={visible}
        style={{ width: "650px" }}
        footer={dialogFooter}
        onHide={handleHide}
        draggable={false}
        modal
        data-testid="interview-dialog"
      >
        <div className="p-fluid">
          {/* Candidate Dropdown */}
          <div className="field mb-4">
          <label htmlFor="candidate" className="font-semibold">
            Candidate <span className="text-red-500">*</span>
          </label>
          <InputText
            id="candidate"
            value={candidateName || 'No candidate selected'}
            disabled
            className="bg-gray-100"
          />
        </div>
        {/* Timezone Selector */}
        <div className="field mb-4">
          <label className="font-semibold">
            Timezone <span className="text-red-500">*</span>
          </label>

          <div className="flex align-items-center gap-2">
            <span
              className="px-3 py-2 border-round text-sm"
              style={{
                background: "#f1f5f9",
                border: "1px solid #cbd5e1",
                fontWeight: 500
              }}
            >
              {formData.eventTimezone}
            </span>

            <DialogButton
              label="Change"
              severity="secondary"
              icon={<FaClock style={{ fontSize: 16, marginRight: 8 }} />}
              onClick={() => setShowTimezoneDropdown(true)} 
              disabled={loading}
            />
          </div>

          <small className="text-500">
            Interview time will be scheduled in this timezone.
          </small>
        </div>
        {showTimezoneDropdown && (
        <div className="field mb-4">
          <Dropdown
            value={formData.eventTimezone}
            options={TIMEZONE_OPTIONS}
            onChange={(e) => {
              handleTimezoneChange(e.value);
              setShowTimezoneDropdown(false);
            }}
            filter
            placeholder="Select timezone"
            className="w-full"
          />
          <small className="text-500">
            Changing timezone will reinterpret the selected date & time.
          </small>
        </div>
      )}
          {/* Interview Date */}
          <div className="field mb-4">
            <label htmlFor="interviewDate" className="font-semibold">
              Interview Date <span className="text-red-500">*</span>
            </label>
            <Calendar
              id="interviewDate"
              value={formData.interviewDate}
              onChange={(e) => handleInputChange("interviewDate", e.value)}
              dateFormat="dd/mm/yy"
              placeholder="Select date"
              showIcon
              icon={() => <FaCalendarAlt />}
              className={errors.interviewDate ? "p-invalid" : ""}
              disabled={loading}
            />
          </div>
          {/* Interviewer Dropdown */}
          <div className="field mb-4">
                <label htmlFor="interviewer" className="font-semibold">
                  Interviewer <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  id="interviewer"
                  value={formData.interviewerId}
                  options={interviewers}
                  onChange={(e) => handleInputChange("interviewerId", e.value)}
                  placeholder="Select interviewer"
                  filter
                  className={errors.interviewerId ? "p-invalid" : ""}
                  disabled={loading}
                />
          </div>
         {capacityData && (
          <div
            className="mt-2 px-3 py-2 border-round-xl"
            style={{
              background: capacityData.isFull ? "#fef9c3" : "#ecfdf5",
              border: `1px solid ${
                capacityData.isFull ? "#facc15" : "#34d399"
              }`,
              borderRadius: "12px",
              fontSize: "0.85rem"
            }}
          >
            {capacityLoading ? (
              <small className="text-600">
                Checking interviewer availability...
              </small>
            ) : (
              <>
                {/* Top Row */}
                <div className="flex justify-content-between align-items-center">
                  <div className="flex align-items-center gap-2">
                    <FaClock
                      style={{
                        color: capacityData.isFull ? "#d97706" : "#059669",
                        fontSize: 14
                      }}
                    />
                    <span
                      style={{
                        fontWeight: 600,
                        color: capacityData.isFull ? "#92400e" : "#065f46"
                      }}
                    >
                      {capacityData.isFull
                        ? "Capacity Reached"
                        : "Interview Capacity Per Day"}
                    </span>
                  </div>

                  <span
                    style={{
                      fontWeight: 600,
                      color: capacityData.isFull ? "#92400e" : "#065f46"
                    }}
                  >
                    {capacityData.scheduledCount} / {capacityData.capacity}
                  </span>
                </div>

                {/* Scheduled Times */}
                {capacityData.scheduledTimesUTC.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {getLocalScheduledTimes().map((time, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs"
                        style={{
                          background: "#ffffff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "999px",
                          fontWeight: 500
                        }}
                      >
                        {time}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
          {/* Time Selection Row - 12 Hour Format */}
          <div className="field mb-4">
            <label className="font-semibold">
              Start Time <span className="text-red-500">*</span>
            </label>
            <div className="grid">
              <div className="col-4">
                <Dropdown
                  value={formData.hour12}
                  options={hourOptions}
                  onChange={(e) => handleInputChange("hour12", e.value)}
                  placeholder="Hour"
                  className={errors.time ? "p-invalid" : ""}
                  disabled={loading}
                />
              </div>
              <div className="col-4">
                <Dropdown
                  value={formData.minute}
                  options={minuteOptions}
                  onChange={(e) => handleInputChange("minute", e.value)}
                  placeholder="Min"
                  className={errors.time ? "p-invalid" : ""}
                  disabled={loading}
                />
              </div>
              <div className="col-4">
                <Dropdown
                  value={formData.period}
                  options={periodOptions}
                  onChange={(e) => handleInputChange("period", e.value)}
                  className={errors.time ? "p-invalid" : ""}
                  disabled={loading}
                />
              </div>
            </div>
            {errors.time && (
              <small className="p-error">
                {errors.time} — please adjust the start time.
              </small>
            )}
            {!formData.interviewDate &&
              browserTimezone !== formData.eventTimezone && (
                <small className="text-500 block mt-2">
                  Select a date to see this time in your timezone ({browserTimezone})
                </small>
            )}
            {/* VIEWER TIMEZONE CONTEXT */}
            {viewerContext &&
              browserTimezone !== formData.eventTimezone && (
                <div
                  className="mt-2 p-2 border-round"
                  style={{
                    background: '#fef3c7',
                    border: '1px solid #fbbf24'
                  }}
                >
                  <div className="flex align-items-start gap-2">
                    <FaClock
                      style={{ color: '#d97706', marginTop: 2 }}
                    />
                    <div>
                      <small className="text-700 font-semibold block">
                        Your timezone ({browserTimezone}):
                      </small>

                      <small className="text-700">
                        {viewerContext.date} at {viewerContext.time}
                        {viewerContext.isDifferentDay && (
                          <span
                            style={{
                              color: '#d97706',
                              fontWeight: 600
                            }}
                          >
                            {' '}
                            (different day)
                          </span>
                        )}
                      </small>
                    </div>
                  </div>
                </div>
              )}
            <div className="flex align-items-center gap-2 mt-2 ml-2">
              <FaClock style={{ color: '#6366f1' }} />
              <small className="text-600">
                Scheduled:{" "}
                <strong>
                  {displayTime} ({formData.eventTimezone})
                </strong>
              </small>
            </div>
          </div>

          {/* Duration */}
          <div className="field mb-4">
            <label htmlFor="duration" className="font-semibold">
              Duration (minutes) <span className="text-red-500">*</span>
            </label>
            <InputNumber
              id="duration"
              value={formData.durationMinutes}
              onValueChange={(e) => handleInputChange("durationMinutes", e.value)}
              min={15}
              max={480}
              step={15}
              showButtons
              className={errors.durationMinutes ? "p-invalid" : ""}
              disabled={loading}
            />
            {errors.durationMinutes && <small className="p-error">{errors.durationMinutes}</small>}
            <small className="text-500">15 - 480 minutes</small>
          </div>

          {/* End Time Display */}
          {endTime && (
            <div className="field mb-4 p-3" style={{ backgroundColor: '#f0f9ff', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
              <div className="flex align-items-center gap-2">
                <FaClock style={{ color: '#3b82f6' }} />
                <span className="font-semibold text-700">Estimated End Time:</span>
                <span className="text-900 font-bold">{endTime}</span>
              </div>
            </div>
          )}

          {/* Interviewer Dropdown
          <div className="field mb-4">
            <label htmlFor="interviewer" className="font-semibold">
              Interviewer <span className="text-red-500">*</span>
            </label>
            <Dropdown
              id="interviewer"
              value={formData.interviewerId}
              options={interviewers}
              onChange={(e) => handleInputChange("interviewerId", e.value)}
              placeholder="Select interviewer"
              filter
              className={errors.interviewerId ? "p-invalid" : ""}
              disabled={loading}
            />
          </div> */}

          {/* Scheduled By Dropdown */}
          <div className="field">
            <label htmlFor="scheduledBy" className="font-semibold">
              Scheduled By <span className="text-red-500">*</span>
            </label>
            <Dropdown
              id="scheduledBy"
              value={formData.scheduledById}
              options={recruiters}
              onChange={(e) => handleInputChange("scheduledById", e.value)}
              placeholder="Select recruiter"
              filter
              className={errors.scheduledById ? "p-invalid" : ""}
              disabled={loading}
            />
            {errors.scheduledById && <small className="p-error">{errors.scheduledById}</small>}
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default InterviewAddEditForm;