import React, { useState, useRef, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Toast } from "primereact/toast";
import { FaCheck, FaPencilAlt, FaClock, FaCalendarAlt } from "react-icons/fa";
import { getInterviewFormData, createInterview, updateInterview } from "../services/interviewService";
import { useAuth } from "../../../shared/auth/AuthContext";

// ============================================================
// TIME CONVERSION UTILITIES
// ============================================================

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

// ============================================================
// TYPES
// ============================================================

interface Interview {
  interviewId: number;
  interviewDate: string;
  fromTime: string;
  durationMinutes: number;
  candidateId: number;
  candidateName: string;
  interviewerId: number;
  interviewerName: string;
  scheduledById: number;
  scheduledByName: string;
}

interface AddEditInterviewFormProps {
  visible: boolean;
  isEdit?: boolean;
  interviewToEdit?: Interview | null;
  onHide: () => void;
  onSuccess: () => void;
  candidateId?: number;        // ✅ ADD THIS
  candidateName?: string;
  externalToast?: React.RefObject<Toast>;
}

interface FormData {
  interviewDate: Date | null;
  hour12: number;
  minute: number;
  period: 'AM' | 'PM';
  durationMinutes: number;
  interviewerId: number | null;
  scheduledById: number | null;
}

interface ValidationErrors {
  interviewDate?: string;
  time?: string;
  durationMinutes?: string;
  candidateId?: string;
  interviewerId?: string;
  scheduledById?: string;
}

// Mock Button Component
const DialogButton: React.FC<any> = ({ label, severity, onClick, icon, loading, disabled, className }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className={`p-button p-component ${severity === 'secondary' ? 'p-button-secondary' : 'p-button-success'} ${className}`}
    style={{ 
      padding: '0.5rem 1rem', 
      marginLeft: '0.5rem',
      display: 'inline-flex',
      alignItems: 'center',
      opacity: disabled ? 0.6 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer'
    }}
  >
    {icon}
    {loading ? 'Loading...' : label}
  </button>
);

// ============================================================
// MAIN COMPONENT
// ============================================================

const InterviewAddEditForm: React.FC<AddEditInterviewFormProps> = ({
  visible,
  isEdit = false,
  interviewToEdit = null,
  onHide,
  onSuccess,
  candidateId,      // ✅ ADD THIS
  candidateName, 
  externalToast,
}) => {
  const toast = useRef<Toast>(null);
  const toastRef = externalToast || toast; 
  const [loading, setLoading] = useState(false);
  const [interviewers, setInterviewers] = useState<any[]>([]);
  const [recruiters, setRecruiters] = useState<any[]>([]);
  const { accessToken } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    interviewDate: null,
    hour12: 9,
    minute: 0,
    period: 'AM',
    durationMinutes: 60,
    interviewerId: null,
    scheduledById: null,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  
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

  // Effect to set form data
  useEffect(() => {
    if (visible) {
      loadFormData();
    }

    if (visible && isEdit && interviewToEdit) {
      // Convert 24-hour backend time to 12-hour format
      const { hour12, minute, period } = convert24to12(interviewToEdit.fromTime);
      
      const [year, month, day] = interviewToEdit.interviewDate.split('-').map(Number);
      setFormData({
        interviewDate: new Date(year, month - 1, day),
        hour12,
        minute,
        period,
        durationMinutes: interviewToEdit.durationMinutes,
        interviewerId: interviewToEdit.interviewerId,
        scheduledById: interviewToEdit.scheduledById,
      });
    } else if (visible && !isEdit) {
      resetForm();
    }
  }, [visible, isEdit, interviewToEdit]);

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
      
      if (selectedDate < today) {
        newErrors.interviewDate = "Interview date cannot be in the past";
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

    // For Edit: Check if anything changed
    if (isEdit && interviewToEdit) {
      const currentTime24 = convert12to24(formData.hour12, formData.minute, formData.period);
      
      const selectedDate = formData.interviewDate!.getFullYear() + '-' + 
  String(formData.interviewDate!.getMonth() + 1).padStart(2, '0') + '-' + 
  String(formData.interviewDate!.getDate()).padStart(2, '0');

const hasChanges =
  selectedDate !== interviewToEdit.interviewDate ||
        currentTime24 !== interviewToEdit.fromTime ||
        formData.durationMinutes !== interviewToEdit.durationMinutes ||
        formData.interviewerId !== interviewToEdit.interviewerId ||
        formData.scheduledById !== interviewToEdit.scheduledById;

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

  const payload = {
   interviewDate: formData.interviewDate!.getFullYear() + '-' + 
    String(formData.interviewDate!.getMonth() + 1).padStart(2, '0') + '-' + 
    String(formData.interviewDate!.getDate()).padStart(2, '0'),
    fromTime: time24,
    durationMinutes: formData.durationMinutes,
    interviewerId: formData.interviewerId,
    scheduledById: formData.scheduledById,
  };

  try {
    if (isEdit && interviewToEdit) {
      await updateInterview(interviewToEdit.interviewId, payload, accessToken!);

      toastRef.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Interview updated successfully",
        life: 2000,  // ✅ Changed to 2 seconds
      });
    } else {
      await createInterview(candidateId!, payload, accessToken!);

      // ✅ ONLY show toast if NO external toast (i.e., when used in Interview page)
      if (!externalToast) {
        toastRef.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Interview created successfully",
          life: 2000,  // ✅ Changed to 2 seconds
        });
      }
    }

    resetForm();
    onSuccess();  // ✅ This will trigger the external toast in InterviewScheduler
    onHide();
  } catch (err: any) {
    toastRef.current?.show({
      severity: "error",
      summary: "Error",
      detail: err.message || "Something went wrong",
      life: 2000,  // ✅ Changed to 2 seconds
    });
  } finally {
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
    });
    setErrors({});
  };

  const handleHide = () => {
    resetForm();
    onHide();
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
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
    <div>
      <DialogButton
        label="Cancel"
        severity="secondary"
        onClick={handleHide}
        className="w-auto"
        disabled={loading}
      />
      <DialogButton
        label={isEdit ? "Save Changes" : "Schedule Interview"}
        severity="success"
        icon={
          isEdit ? (
            <FaPencilAlt style={{ fontSize: 14, marginRight: 8, marginLeft: 4 }} />
          ) : (
            <FaCheck style={{ fontSize: 16, marginRight: 8, marginLeft: 4 }} />
          )
        }
        onClick={handleSubmit}
        className="w-auto"
        loading={loading}
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
              minDate={new Date()}
              showIcon
              icon={() => <FaCalendarAlt />}
              className={errors.interviewDate ? "p-invalid" : ""}
              disabled={loading}
            />
            {errors.interviewDate && <small className="p-error">{errors.interviewDate}</small>}
          </div>

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
            {errors.time && <small className="p-error">{errors.time}</small>}
            <div className="flex align-items-center gap-2 mt-2">
              <FaClock style={{ color: '#6366f1' }} />
              <small className="text-600">Selected: <strong>{displayTime}</strong></small>
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
            {errors.interviewerId && <small className="p-error">{errors.interviewerId}</small>}
          </div>

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