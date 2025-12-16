import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber, type InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { Dropdown, type DropdownChangeEvent } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { classNames } from 'primereact/utils';
import { Toast } from 'primereact/toast'; // 👈 Import Toast
import DialogButton from '../../../shared/DialogAddEditButton';
import { validateJobProfileRequest } from '../services/jobProfileService';
import type {
  JobProfile,
  JobProfilePayload,
  JobProfileFormErrors,
  ClientOption,
  DepartmentOption,
  Location,

} from '../types/jobProfileTypes';
import { FaCheck } from 'react-icons/fa';

interface Props {
  visible: boolean;
  onHide: () => void;
  onSave: (jobProfile: JobProfilePayload) => Promise<void>;
  jobProfile?: JobProfile | null;
  clients: ClientOption[];
  locations: Location[];
  loading?: boolean;
  statusOptions: string[];
}

const workArrangementOptions = [
  { label: 'On-Site', value: 'Onsite' as const },
  { label: 'Remote', value: 'Remote' as const },
  { label: 'Hybrid', value: 'Hybrid' as const },  
];


const emptyForm: Partial<JobProfilePayload> = {
  clientId: undefined,
  departmentId: undefined,
  jobProfileDescription: '',
  jobRole: '',
  techSpecification: '',
  positions: 1,
  estimatedCloseDate: '',
  location: { city: '', country: '' }, // Update this
  workArrangement: undefined,
  status: undefined,
};

// ⚠️ Define a type guard for required fields to ensure we don't try to submit partial data
type RequiredJobProfilePayload = {
    [K in keyof JobProfilePayload]-?: JobProfilePayload[K];
};

const JobProfileAddEdit: React.FC<Props> = ({
  visible,
  onHide,
  onSave,
  jobProfile,
  clients,
  locations,
  loading = false,
  statusOptions
}) => {
  const [form, setForm] = useState<Partial<JobProfilePayload>>(emptyForm);
  const [errors, setErrors] = useState<JobProfileFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const toast = useRef<Toast>(null); // 👈 Toast Ref
  const toLocalDateString = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const normalizeDateOnly = (value?: string): string => {
  if (!value) return '';

  // Case 1: Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  // Case 2: ISO datetime or anything Date can parse
  const date = new Date(value);
  if (!isNaN(date.getTime())) {
    return toLocalDateString(date);
  }

  return '';
};

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  // Load existing data if editing
// Load existing data if editing
useEffect(() => {
  if (visible) {
    if (jobProfile) {
      // Find the departmentId from departmentName
      const selectedClient = clients.find(c => c.clientId === jobProfile.clientId);
      const selectedDept = selectedClient?.departments.find(
        d => d.departmentName === jobProfile.departmentName
      );
      
      console.log('Loading job profile for edit:', jobProfile);
      console.log('Found department:', selectedDept);
      
      // ⚠️ CRITICAL: Must use the LOOKED-UP departmentId, not the possibly-undefined one from API
      const departmentId = selectedDept?.departmentId ?? jobProfile.departmentId;
      
      if (!departmentId) {
        console.error('FATAL: Cannot find departmentId for:', jobProfile.departmentName);
        toast.current?.show({
          severity: 'error',
          summary: 'Data Error',
          detail: 'Cannot load job profile - department information is missing',
          life: 5000
        });
        onHide();
        return;
      }
      
      setForm({
        clientId: jobProfile.clientId,
        departmentId: departmentId, // ✅ GUARANTEED to have a value now
        jobProfileDescription: jobProfile.jobProfileDescription,
        jobRole: jobProfile.jobRole,
        techSpecification: jobProfile.techSpecification,
        positions: jobProfile.positions,
        estimatedCloseDate: normalizeDateOnly(jobProfile.estimatedCloseDate),
        location: jobProfile.location || { city: '', country: '' },
        workArrangement: jobProfile.workArrangement 
          ? (jobProfile.workArrangement.charAt(0).toUpperCase() + 
             jobProfile.workArrangement.slice(1).toLowerCase()) as 'onsite' | 'hybrid' | 'remote'
          : undefined,
        status: jobProfile.status,
      });
      
      console.log('Set form with departmentId:', departmentId);
    } else {
      setForm({ ...emptyForm });
    }
    setErrors({});
    setSubmitting(false);
  }
}, [visible, jobProfile, clients, onHide, toast]);

  // Get departments for the selected client using useMemo for optimization
  const availableDepartments = useMemo((): DepartmentOption[] => {
    if (!form.clientId) return [];

    const selectedClient = clients.find(client => client.clientId === form.clientId);
    return selectedClient ? selectedClient.departments : [];
  }, [form.clientId, clients]);

  // Check if the currently selected department is still valid for the selected client
  const isDepartmentValidForClient = useMemo((): boolean => {
  if (!form.clientId || form.departmentId === undefined || form.departmentId === null) return true; // Changed this line
  return availableDepartments.some(dept => dept.departmentId === form.departmentId);
}, [form.clientId, form.departmentId, availableDepartments]);

  // Get unique countries from locations
const availableCountries = useMemo((): string[] => {
  const countries = locations.map(loc => loc.country);
  return Array.from(new Set(countries)).sort();
}, [locations]);

// Get cities for the selected country
const availableCities = useMemo((): string[] => {
  if (!form.location?.country) return [];
  
  const cities = locations
    .filter(loc => loc.country === form.location?.country)
    .map(loc => loc.city);
  
  return Array.from(new Set(cities)).sort();
}, [form.location?.country, locations]);

// Check if the currently selected city is valid for the selected country
const isCityValidForCountry = useMemo((): boolean => {
  if (!form.location?.country || !form.location?.city) return true;
  
  return availableCities.includes(form.location.city);
}, [form.location?.country, form.location?.city, availableCities]);

  // Prepare client options for dropdown
  const clientOptions = useMemo(() =>
    clients.map(client => ({
      label: client.clientName,
      value: client.clientId
    }))
  , [clients]);

  // Prepare department options for dropdown
  const departmentOptions = useMemo(() =>
    availableDepartments.map(dept => ({
      label: dept.departmentName,
      value: dept.departmentId
    }))
  , [availableDepartments]);

  // Prepare status options for dropdown from lookup data
    // Prepare status options for dropdown from lookup data
const mappedStatusOptions = useMemo(() => 
  statusOptions.map(status => ({
    label: status,
    value: status // ✅ Now just string, not 'as JobStatus'
  }))
, [statusOptions]);

  // Helper to check if a field is empty
  const isFieldEmpty = (value: any): boolean => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (typeof value === 'number') return isNaN(value) || value <= 0;
    return false;
  };

  // Generic change handler
  const updateField = <
    K extends keyof JobProfilePayload & keyof JobProfileFormErrors
  >(
    field: K,
    value: JobProfilePayload[K]
  ) => {
    setForm(prev => {
      const newForm = { ...prev, [field]: value };

      // Reset departmentId if clientId changes and current department is not valid for new client
      if (field === 'clientId' && !jobProfile) {
      newForm.departmentId = undefined;
    }
      // Reset city if country changes and current city is not valid for new country
      if (field === 'location' && value && typeof value === 'object' && 'country' in value) {
        const currentCity = prev.location?.city;
        
        if (currentCity && value.country) {
          const isCityValid = locations
            .filter(loc => loc.country === value.country)
            .some(loc => loc.city === currentCity);
          
          if (!isCityValid) {
            newForm.location = { ...value, city: '' };
          }
        }
      }
      return newForm;
    });

    // Clear field-specific errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * Run initial, basic field checks for empty/missing required values.
   * This is a quick check before the heavier service validation.
   */
  const preValidateForm = (): boolean => {
  const newErrors: JobProfileFormErrors = {};
  let isValid = true;

  // List of required fields for a quick check
  const requiredFields: (keyof JobProfilePayload)[] = [
    'clientId', 
    'departmentId', 
    'jobProfileDescription', 
    'jobRole', 
    'techSpecification', 
    'positions', 
    'estimatedCloseDate', 
    'status'
  ];

  requiredFields.forEach(field => {
    const value = form[field];
      if (jobProfile && (field === 'clientId' || field === 'departmentId')) {
      return;
    }
    // Special check for Positions, ensuring it's > 0
    if (field === 'positions') {
      if (isFieldEmpty(value) || (typeof value === 'number' && value <= 0)) {
        newErrors.positions = 'Positions must be a number greater than 0.';
        isValid = false;
      }
    } else if (isFieldEmpty(value)) {
      newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1').trim()} is required.`;
      isValid = false;
    }
  });
  
  // Additional validation for Department validity after client change
  if (form.clientId && form.departmentId && !isDepartmentValidForClient) {
    newErrors.departmentId = 'Selected department is not valid for the selected client';
    isValid = false;
  }
  
  // Check work arrangement
  if (!form.workArrangement) {
    newErrors.workArrangement = 'Work Arrangement is required.';
    isValid = false;
  }

  // Check location country and city
  if (!form.location?.country) {
    newErrors.location = 'Country is required.';
    isValid = false;
  }

  if (!form.location?.city) {
    newErrors.location = 'City is required.';
    isValid = false;
  }

  // Validate city for selected country
  if (form.location?.country && form.location?.city && !isCityValidForCountry) {
    newErrors.location = 'Selected city is not valid for the selected country';
    isValid = false;
  }
  
  setErrors(newErrors);
  
  // Show a general error toast if basic validation fails
  if (!isValid) {
    toast.current?.show({ 
      severity: 'error', 
      summary: 'Validation Error', 
      detail: 'Please completethe all required fields and correct the errors.',  
    });
  }

  return isValid;
};

  // Submit handler
const handleSubmit = async () => {
  setErrors({}); 

  if (!preValidateForm()) {
    return;
  }

  const closeDate = form.estimatedCloseDate;
   if (!closeDate) {
    setErrors({ estimatedCloseDate: 'Estimated Close Date is required' });
    return;
  }
   const isValidDateFormat = /^\d{4}-\d{2}-\d{2}$/.test(closeDate);
  if (!isValidDateFormat) {
    setErrors({ estimatedCloseDate: 'Estimated Close Date is invalid' });
    return;
  }
  
  // ✅ SIMPLE: Everything comes from form state (which was populated in useEffect)
  const payload: JobProfilePayload = {
    clientId: form.clientId!,
    departmentId: form.departmentId!,
    jobProfileDescription: form.jobProfileDescription!.trim(),
    jobRole: form.jobRole!.trim(),
    techSpecification: form.techSpecification!.trim(),
    positions: form.positions!,
    estimatedCloseDate: closeDate,
    location: form.location!,
    workArrangement: form.workArrangement!,
    status: form.status!,
  };

  // Run the service-level validation
  const validationErrors = validateJobProfileRequest(payload as RequiredJobProfilePayload);
  if (validationErrors.length > 0) {
    const errorObj: JobProfileFormErrors = {};
    validationErrors.forEach(err => {
      if (err.includes('Client')) errorObj.clientId = err;
      else if (err.includes('Department')) errorObj.departmentId = err;
      else if (err.includes('Description')) errorObj.jobProfileDescription = err;
      else if (err.includes('Job Role')) errorObj.jobRole = err;
      else if (err.includes('Tech Specification')) errorObj.techSpecification = err;
      else if (err.includes('Positions')) errorObj.positions = err;
      else if (err.includes('Close Date')) errorObj.estimatedCloseDate = err;
      else if (err.includes('Location')) errorObj.location = err;
      else if (err.includes('Status')) errorObj.status = err;
      else if (err.includes('Work Arrangement')) errorObj.workArrangement = err;
    });
    setErrors(errorObj);
    toast.current?.show({ 
      severity: 'error', 
      summary: 'Validation Error', 
      detail: 'Please review the highlighted fields for errors.', 
      life: 3000 
    });
    return;
  }

  setSubmitting(true);
  try {
    await onSave(payload);
    
    const successMessage = jobProfile 
      ? 'Job Profile updated successfully!' 
      : 'Job Profile created successfully!';
      
    toast.current?.show({ 
      severity: 'success', 
      summary: 'Success', 
      detail: successMessage, 
      life: 3000 
    });
    
    onHide();
  } catch (err) {
    console.error('Save failed', err);
    toast.current?.show({ 
      severity: 'error', 
      summary: 'Error', 
      detail: 'Failed to save job profile. Please try again.', 
      life: 3000 
    });
  } finally {
    setSubmitting(false);
  }
};


  const footer = (
    <div className="flex justify-content-end gap-2">
      <DialogButton
        label="Cancel"
        onClick={onHide}
        severity="secondary"
      />
      <DialogButton
        label={jobProfile ? 'Update Job Profile' : 'Add Job Profile'}
        severity="success"
        icon={<FaCheck style={{ fontSize: 16, marginRight: 8, marginLeft: 4 }}/>}
        onClick={handleSubmit}
        loading={submitting}
        disabled={loading}
      />

    </div>
  );

  return (
    <>
      <Toast ref={toast} /> {/* 👈 Render the Toast component */}
      <Dialog
        visible={visible}
        header={jobProfile ? 'Edit Job Profile' : 'Add Job Profile'}
        style={{ width: '50rem' }}
        modal
        onHide={onHide}
        footer={footer}
        closable={!submitting}
        draggable={false}
        resizable={false}
      >
        <div className="p-fluid formgrid grid gap-3">
            <div className="field col-6">
            <label htmlFor="clientId">
              Client <span className="p-error">*</span>
            </label>
            {jobProfile ? (
              <InputText
                id="clientName"
                value={jobProfile.clientName}
                disabled
                className="p-disabled"
              />
            ) : (
              <Dropdown
                id="clientId"
                value={form.clientId}
                options={clientOptions}
                onChange={(e: DropdownChangeEvent) => updateField('clientId', e.value)}
                placeholder="Select Client"
                className={classNames({ 'p-invalid': errors.clientId })}
                optionLabel="label"
                optionValue="value"
              />
            )}
            {errors.clientId && <small className="p-error">{errors.clientId}</small>}
          </div>
      

          <div className="field col-6">
          <label htmlFor="departmentId">
            Department <span className="p-error">*</span>
          </label>
          {jobProfile ? (
            <InputText
              id="departmentName"
              value={jobProfile.departmentName}
              disabled
              className="p-disabled"
            />
          ) : (
            <Dropdown
              id="departmentId"
              value={form.departmentId}
              options={departmentOptions}
              onChange={(e: DropdownChangeEvent) => updateField('departmentId', e.value)}
              placeholder="Select Department"
              disabled={!form.clientId || availableDepartments.length === 0}
              className={classNames({ 'p-invalid': errors.departmentId })}
              optionLabel="label"
              optionValue="value"
            />
          )}
          {form.clientId && availableDepartments.length === 0 && !jobProfile && (
            <small className="text-muted">No departments available for selected client</small>
          )}
          {errors.departmentId && <small className="p-error">{errors.departmentId}</small>}
        </div>

          <div className="field col-12">
            <label>Job Profile Description <span className="p-error">*</span></label>
            <InputTextarea
              value={form.jobProfileDescription || ''}
              onChange={e => updateField('jobProfileDescription', e.target.value)}
              rows={3}
              maxLength={500}
              className={classNames({ 'p-invalid': errors.jobProfileDescription })}
              placeholder="Minimum 10 characters, maximum 500 characters"
            />
            <small className="text-muted">{form.jobProfileDescription?.length ?? 0}/500 characters</small>
            {errors.jobProfileDescription && <small className="p-error">{errors.jobProfileDescription}</small>}
          </div>

          <div className="field col-6">
            <label>Job Role <span className="p-error">*</span></label>
            <InputText
              value={form.jobRole || ''}
              onChange={e => updateField('jobRole', e.target.value)}
              maxLength={100}
              className={classNames({ 'p-invalid': errors.jobRole })}
              placeholder="e.g., Backend Engineer"
            />
            <small className="text-muted">{form.jobRole?.length ?? 0}/100 characters</small>
            {errors.jobRole && <small className="p-error">{errors.jobRole}</small>}
          </div>

          <div className="field col-6">
            <label>Tech Specification <span className="p-error">*</span></label>
            <InputText
              value={form.techSpecification || ''}
              onChange={e => updateField('techSpecification', e.target.value)}
              className={classNames({ 'p-invalid': errors.techSpecification })}
              placeholder="e.g., Java, React, Spring Boot"
            />
            {errors.techSpecification && <small className="p-error">{errors.techSpecification}</small>}
          </div>

          <div className="field col-4">
            <label>Positions <span className="p-error">*</span></label>
            <InputNumber
              value={form.positions ?? undefined}
              onValueChange={(e: InputNumberValueChangeEvent) => updateField('positions', e.value ?? 0)}
              min={1}
              className={classNames({ 'p-invalid': errors.positions })}
            />
            {errors.positions && <small data-testid="error-positions" className="p-error">{errors.positions}</small>}

          </div>

          <div className="field col-4">
            <label>Estimated Close Date <span className="p-error">*</span></label>
            <Calendar
              value={
                form.estimatedCloseDate
                  ? (() => {
                      const [y, m, d] = form.estimatedCloseDate.split('-').map(Number);
                      return new Date(y, m - 1, d);
                    })()
                  : null
              }
              onChange={e => {
                const val = e.value;
                if (val instanceof Date && !isNaN(val.getTime())) {
                  updateField('estimatedCloseDate', toLocalDateString(val));
                } else if (typeof val === 'string' && val) {
                  updateField('estimatedCloseDate', val);
                } else {
                  updateField('estimatedCloseDate', '');
                }
              }}
              showIcon
              minDate={tomorrow}
              className={classNames({ 'p-invalid': errors.estimatedCloseDate })}
            />
            {errors.estimatedCloseDate && <small className="p-error">{errors.estimatedCloseDate}</small>}
          </div>

          <div className="field col-4">
            <label>Work Arrangement <span className="p-error">*</span></label>
            <Dropdown
              value={form.workArrangement ?? null}
              options={workArrangementOptions}
              onChange={(e: DropdownChangeEvent) => updateField('workArrangement', e.value)}
              placeholder="Select Work Arrangement"
              className={classNames({ 'p-invalid': errors.workArrangement })}
              optionLabel="label"
              optionValue="value"
            />
            {errors.workArrangement && <small className="p-error">{errors.workArrangement}</small>}
          </div>

          <div className="field col-4">
            <label>Country <span className="p-error">*</span></label>
            <Dropdown
              value={form.location?.country || null}
              options={availableCountries.map(country => ({ label: country, value: country }))}
              onChange={(e: DropdownChangeEvent) => 
                updateField('location', { 
                  country: e.value, 
                  city: '' 
                })
              }
              placeholder="Select Country"
              className={classNames({ 'p-invalid': errors.location })}
              optionLabel="label"
              optionValue="value"
            />
            {errors.location && <small className="p-error">{errors.location}</small>}
          </div>

          <div className="field col-4">
            <label>City <span className="p-error">*</span></label>
            <Dropdown
              value={form.location?.city || null}
              options={availableCities.map(city => ({ label: city, value: city }))}
              onChange={(e: DropdownChangeEvent) => 
                updateField('location', { 
                  country: form.location?.country || '', 
                  city: e.value 
                })
              }
              placeholder="Select City"
              disabled={!form.location?.country || availableCities.length === 0}
              className={classNames({ 'p-invalid': errors.location })}
              optionLabel="label"
              optionValue="value"
            />
            {form.location?.country && availableCities.length === 0 && (
              <small className="text-muted">No cities available for selected country</small>
            )}
            {errors.location && <small className="p-error">{errors.location}</small>}
          </div>

          <div className="field col-12">
            <label>Status <span className="p-error">*</span></label>
            <Dropdown
              value={form.status ?? null}
              options={mappedStatusOptions}
              onChange={(e: DropdownChangeEvent) => updateField('status', e.value)}
              placeholder="Select Status"
              className={classNames({ 'p-invalid': errors.status })}
              optionLabel="label"
              optionValue="value"
            />
            {errors.status && <small className="p-error">{errors.status}</small>}
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default JobProfileAddEdit;