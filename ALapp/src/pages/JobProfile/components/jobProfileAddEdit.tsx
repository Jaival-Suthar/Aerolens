import React, { useState, useEffect, useMemo } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber, type InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { Dropdown, type DropdownChangeEvent } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { classNames } from 'primereact/utils';

import { validateJobProfileRequest } from '../services/jobProfileService';
import type {
  JobProfile,
  JobProfilePayload,
  JobProfileFormErrors,
  ClientOption,
  DepartmentOption,
  JobStatus
} from '../types/jobProfileTypes';

interface Props {
  visible: boolean;
  onHide: () => void;
  onSave: (jobProfile: JobProfilePayload) => Promise<void>;
  jobProfile?: JobProfile | null;
  clients: ClientOption[];
  loading?: boolean;
}

const statusOptions: { label: string; value: JobStatus }[] = [
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Closed', value: 'Closed' },
  { label: 'Cancelled', value: 'Cancelled' },
];

const emptyForm: Partial<JobProfilePayload> = {
  clientId: undefined,
  departmentId: undefined,
  jobProfileDescription: '',
  jobRole: '',
  techSpecification: '',
  positions: 0,
  estimatedCloseDate: '',
  location: '',
  status: undefined,
};

const JobProfileAddEdit: React.FC<Props> = ({
  visible,
  onHide,
  onSave,
  jobProfile,
  clients,
  loading = false,
}) => {
  const [form, setForm] = useState<Partial<JobProfilePayload>>(emptyForm);
  const [errors, setErrors] = useState<JobProfileFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  // Load existing data if editing
  useEffect(() => {
    if (visible) {
      if (jobProfile) {
        setForm({
        clientId: jobProfile.clientId,
        departmentId: jobProfile.departmentId,
        jobProfileDescription: jobProfile.jobProfileDescription,
        jobRole: jobProfile.jobRole,
        techSpecification: jobProfile.techSpecification,
        positions: jobProfile.positions,
        estimatedCloseDate: jobProfile.estimatedCloseDate,
        location: jobProfile.location || '',
        status: jobProfile.status,
      });
      } else {
        setForm({ ...emptyForm });
      }
      setErrors({});
      setSubmitting(false);
    }
  }, [visible, jobProfile]);

  // Get departments for the selected client using useMemo for optimization
  const availableDepartments = useMemo((): DepartmentOption[] => {
    if (!form.clientId) return [];
    
    const selectedClient = clients.find(client => client.clientId === form.clientId);
    return selectedClient ? selectedClient.departments : [];
  }, [form.clientId, clients]);

  // Check if the currently selected department is still valid for the selected client
  const isDepartmentValidForClient = useMemo((): boolean => {
    if (!form.clientId || !form.departmentId) return true;
    
    return availableDepartments.some(dept => dept.departmentId === form.departmentId);
  }, [form.clientId, form.departmentId, availableDepartments]);

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
      if (field === 'clientId') {
        const newClient = clients.find(c => c.clientId === value);
        const currentDepartmentId = prev.departmentId;
        
        if (currentDepartmentId && newClient) {
          const isDepartmentValid = newClient.departments.some(
            dept => dept.departmentId === currentDepartmentId
          );
          
          if (!isDepartmentValid) {
            newForm.departmentId = 0;
          }
        } else {
          newForm.departmentId = 0;
        }
      }
      
      return newForm;
    });

    // Clear field-specific errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    // Validate department is still valid for selected client
    if (form.clientId && form.departmentId && !isDepartmentValidForClient) {
      setErrors({ departmentId: 'Selected department is not valid for the selected client' });
      return;
    }

    const payload: JobProfilePayload = {
      clientId: form.clientId!,
      departmentId: form.departmentId!,
      jobProfileDescription: form.jobProfileDescription!.trim(),
      jobRole: form.jobRole!.trim(),
      techSpecification: form.techSpecification!.trim(),
      positions: form.positions!,
      estimatedCloseDate: new Date(form.estimatedCloseDate!).toISOString(),
      location: form.location!.trim(), // Change from locationId to location
      status: form.status!,
    };

    const validationErrors = validateJobProfileRequest(payload);
    if (validationErrors.length > 0) {
      const errorObj: JobProfileFormErrors = {};
      validationErrors.forEach(err => {
        if (err.includes('Client')) errorObj.clientId = err;
        if (err.includes('Department')) errorObj.departmentId = err;
        if (err.includes('Description')) errorObj.jobProfileDescription = err;
        if (err.includes('Job Role')) errorObj.jobRole = err;
        if (err.includes('Tech Specification')) errorObj.techSpecification = err;
        if (err.includes('Positions')) errorObj.positions = err;
        if (err.includes('Close Date')) errorObj.estimatedCloseDate = err;
        if (err.includes('Location')) errorObj.location = err;
        if (err.includes('Status')) errorObj.status = err;
      });
      setErrors(errorObj);
      return;
    }

    setSubmitting(true);
    try {
      await onSave(payload);
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setSubmitting(false);
    }
  };

  const footer = (
    <div className="flex justify-content-end gap-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        outlined
        onClick={onHide}
        disabled={submitting || loading}
      />
      <Button
        label={jobProfile ? 'Update' : 'Save'}
        icon="pi pi-check"
        onClick={handleSubmit}
        loading={submitting}
        disabled={loading}
      />
    </div>
  );

  return (
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
          <label>Client</label>
          <Dropdown
            value={form.clientId || null}
            options={clientOptions}
            onChange={(e: DropdownChangeEvent) => updateField('clientId', e.value)}
            placeholder="Select Client"
            className={classNames({ 'p-invalid': errors.clientId })}
            optionLabel="label"
            optionValue="value"
          />
          {errors.clientId && <small className="p-error">{errors.clientId}</small>}
        </div>

        <div className="field col-6">
          <label>Department</label>
          <Dropdown
            value={form.departmentId || null}
            options={departmentOptions}
            onChange={(e: DropdownChangeEvent) => updateField('departmentId', e.value)}
            placeholder="Select Department"
            disabled={!form.clientId || availableDepartments.length === 0}
            className={classNames({ 
              'p-invalid': errors.departmentId || (form.departmentId && !isDepartmentValidForClient) 
            })}
            optionLabel="label"
            optionValue="value"
          />
          {!form.clientId && (
            <small className="text-muted"></small>
          )}
          {form.clientId && availableDepartments.length === 0 && (
            <small className="text-muted">No departments available for selected client</small>
          )}
          {form.departmentId && !isDepartmentValidForClient && (
            <small className="p-error">Selected department is not valid for the selected client</small>
          )}
          {errors.departmentId && <small className="p-error">{errors.departmentId}</small>}
        </div>

        <div className="field col-12">
          <label>Job Profile Description</label>
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
          <label>Job Role</label>
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
          <label>Tech Specification</label>
          <InputText
            value={form.techSpecification || ''}
            onChange={e => updateField('techSpecification', e.target.value)}
            className={classNames({ 'p-invalid': errors.techSpecification })}
            placeholder="e.g., Java, React, Spring Boot"
          />
          {errors.techSpecification && <small className="p-error">{errors.techSpecification}</small>}
        </div>

        <div className="field col-4">
          <label>Positions</label>
          <InputNumber
            value={form.positions ?? undefined}
            onValueChange={(e: InputNumberValueChangeEvent) => updateField('positions', e.value ?? 0)}
            min={1}
            className={classNames({ 'p-invalid': errors.positions })}
          />
          {errors.positions && <small className="p-error">{errors.positions}</small>}
        </div>

        <div className="field col-4">
          <label>Estimated Close Date</label>
          <Calendar
            value={form.estimatedCloseDate ? new Date(form.estimatedCloseDate) : null}
            onChange={e => updateField('estimatedCloseDate', (e.value as Date)?.toISOString() ?? '')}
            showIcon
            minDate={tomorrow}
            className={classNames({ 'p-invalid': errors.estimatedCloseDate })}
          />
          {errors.estimatedCloseDate && <small className="p-error">{errors.estimatedCloseDate}</small>}
        </div>

        <div className="field col-4">
          <label>Location</label>
          <InputText
            value={form.location || ''}
            onChange={e => updateField('location', e.target.value)}
            className={classNames({ 'p-invalid': errors.location })}
            placeholder="e.g., US, IDC, Seattle"
          />
          {errors.location && <small className="p-error">{errors.location}</small>}
        </div>

        <div className="field col-12">
          <label>Status</label>
          <Dropdown
            value={form.status || null}
            options={statusOptions}
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
  );
};

export default JobProfileAddEdit;