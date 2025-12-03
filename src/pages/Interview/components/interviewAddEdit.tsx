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

// Mock types - replace with actual imports
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
}

interface FormData {
  interviewDate: Date | null;
  fromTime: string;
  durationMinutes: number;
  candidateId: number | null;
  interviewerId: number | null;
  scheduledById: number | null;
}

interface ValidationErrors {
  interviewDate?: string;
  fromTime?: string;
  durationMinutes?: string;
  candidateId?: string;
  interviewerId?: string;
  scheduledById?: string;
}

// Mock Button Component (replace with actual import)
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

const InterviewAddEditForm: React.FC<AddEditInterviewFormProps> = ({
  visible,
  isEdit = false,
  interviewToEdit = null,
  onHide,
  onSuccess,
}) => {
  const toast = useRef<Toast>(null);
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [interviewers, setInterviewers] = useState<any[]>([]);
  const [recruiters, setRecruiters] = useState<any[]>([]);
  const { accessToken } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    interviewDate: null,
    fromTime: "",
    durationMinutes: 60,
    candidateId: null,
    interviewerId: null,
    scheduledById: null,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  
  const loadFormData = async () => {
  try {
    const token = localStorage.getItem("accessToken"); // or use AuthContext
    const res = await getInterviewFormData(token!);

    const data = res.data;

    setCandidates(
      data.candidates.map((c: any) => ({
        label: c.candidateName,
        value: c.candidateId,
      }))
    );

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
    toast.current?.show({
      severity: "error",
      summary: "Error Loading Form",
      detail: err.message || "Failed to fetch form data",
      life: 3000,
    });
  }
};

  // Effect to set form data on Edit
  useEffect(() => {
  if (visible) {
    loadFormData(); // ← NEW FUNCTION
  }

  if (visible && isEdit && interviewToEdit) {
    setFormData({
      interviewDate: new Date(interviewToEdit.interviewDate),
      fromTime: interviewToEdit.fromTime,
      durationMinutes: interviewToEdit.durationMinutes,
      candidateId: interviewToEdit.candidateId,
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

    // From Time validation
    if (!formData.fromTime.trim()) {
      newErrors.fromTime = "Start time is required";
    } else {
      const timeRegex = /^([01][0-9]|2[0-3]):([0-5][0-9])$/;
      if (!timeRegex.test(formData.fromTime)) {
        newErrors.fromTime = "Time must be in HH:MM format (00:00-23:59)";
      }
    }

    // Duration validation
    if (!formData.durationMinutes) {
      newErrors.durationMinutes = "Duration is required";
    } else if (formData.durationMinutes < 15) {
      newErrors.durationMinutes = "Minimum duration is 15 minutes";
    } else if (formData.durationMinutes > 480) {
      newErrors.durationMinutes = "Maximum duration is 480 minutes (8 hours)";
    }

    // Candidate validation
    if (!formData.candidateId) {
      newErrors.candidateId = "Candidate selection is required";
    }

    // Interviewer validation
    if (!formData.interviewerId) {
      newErrors.interviewerId = "Interviewer selection is required";
    }

    // Scheduled By validation
    if (!formData.scheduledById) {
      newErrors.scheduledById = "Scheduler selection is required";
    }

    // For PATCH/Edit: At least one field must be different from original
    if (isEdit && interviewToEdit) {
      const hasChanges =
        formData.interviewDate?.toISOString().split('T')[0] !== interviewToEdit.interviewDate ||
        formData.fromTime !== interviewToEdit.fromTime ||
        formData.durationMinutes !== interviewToEdit.durationMinutes ||
        formData.candidateId !== interviewToEdit.candidateId ||
        formData.interviewerId !== interviewToEdit.interviewerId ||
        formData.scheduledById !== interviewToEdit.scheduledById;

      if (!hasChanges) {
        toast.current?.show({
          severity: "warn",
          summary: "No Changes",
          detail: "Please modify at least one field to update",
          life: 3000,
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

  const payload = {
    interviewDate: formData.interviewDate,
    fromTime: formData.fromTime,
    durationMinutes: formData.durationMinutes,
    candidateId: formData.candidateId,
    interviewerId: formData.interviewerId,
    scheduledById: formData.scheduledById,
  };

  try {
    if (isEdit && interviewToEdit) {
      await updateInterview(interviewToEdit.interviewId, payload, accessToken!);

      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Interview updated successfully",
        life: 3000,
      });
    } else {
      await createInterview(payload, accessToken!);

      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Interview created successfully",
        life: 3000,
      });
    }

    resetForm();
    onSuccess();
    onHide();
  } catch (err: any) {
    toast.current?.show({
      severity: "error",
      summary: "Error",
      detail: err.message || "Something went wrong",
      life: 3000,
    });
  } finally {
    setLoading(false);
  }
};


  // Helpers
  const resetForm = () => {
    setFormData({
      interviewDate: null,
      fromTime: "",
      durationMinutes: 60,
      candidateId: null,
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
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Calculate end time
  const calculateEndTime = () => {
    if (!formData.fromTime || !formData.durationMinutes) return "";
    
    try {
      const [hours, minutes] = formData.fromTime.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes + formData.durationMinutes;
      const endHours = Math.floor(totalMinutes / 60) % 24;
      const endMinutes = totalMinutes % 60;
      return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
    } catch {
      return "";
    }
  };

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
            <Dropdown
              id="candidate"
              value={formData.candidateId}
              options={candidates}
              onChange={(e) => handleInputChange("candidateId", e.value)}
              placeholder="Select a candidate"
              filter
              className={errors.candidateId ? "p-invalid" : ""}
              disabled={loading}
            />

            {errors.candidateId && <small className="p-error">{errors.candidateId}</small>}
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

          {/* Time and Duration Row */}
          <div className="grid">
            <div className="col-6">
              <div className="field mb-4">
                <label htmlFor="fromTime" className="font-semibold">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <div className="p-inputgroup">
                  <span className="p-inputgroup-addon">
                    <FaClock />
                  </span>
                  <InputText
                    id="fromTime"
                    value={formData.fromTime}
                    onChange={(e) => handleInputChange("fromTime", e.target.value)}
                    placeholder="HH:MM (e.g., 14:30)"
                    maxLength={5}
                    className={errors.fromTime ? "p-invalid" : ""}
                    disabled={loading}
                  />
                </div>
                {errors.fromTime && <small className="p-error">{errors.fromTime}</small>}
                <small className="text-500">Format: 00:00 - 23:59</small>
              </div>
            </div>

            <div className="col-6">
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
            </div>
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
            />
            {errors.scheduledById && <small className="p-error">{errors.scheduledById}</small>}
          </div>
        </div>
      </Dialog>
    </>
  );
};
export default InterviewAddEditForm;