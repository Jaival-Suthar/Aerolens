import React, { useState, useEffect, useCallback } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown, type DropdownChangeEvent } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { classNames } from 'primereact/utils';

import { getDepartmentsByClientId } from '../services/jobProfileService';
import type {
  JobProfile,
  JobProfileFormData,
  JobProfileFormErrors,
  JobProfileRequest,
  ClientOption,
  DepartmentOption,
  JobStatus
} from '../types/jobProfileTypes';

interface Props {
  visible: boolean;
  onHide: () => void;
  onSave: (jobProfile: JobProfileRequest) => Promise<void>;
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

const emptyForm: JobProfileFormData = {
  jobProfileId: undefined,
  clientId: null,
  departmentId: null,
  jobProfileDescription: '',
  jobRole: '',
  techSpecification: '',
  positions: null,
  receivedOn: null,
  estimatedCloseDate: null,
  location: '',
  status: null,
};

const JobProfileAddEdit: React.FC<Props> = ({
  visible,
  onHide,
  onSave,
  jobProfile,
  clients,
  loading = false,
}) => {
  const [form, setForm] = useState<JobProfileFormData>(emptyForm);
  const [errors, setErrors] = useState<JobProfileFormErrors>({});
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  // Load existing data if editing
  useEffect(() => {
    if (visible) {
      if (jobProfile) {
        setForm({
          jobProfileId: jobProfile.jobProfileId,
          clientId: jobProfile.clientId,
          departmentId: jobProfile.departmentId,
          jobProfileDescription: jobProfile.jobProfileDescription,
          jobRole: jobProfile.jobRole,
          techSpecification: jobProfile.techSpecification,
          positions: jobProfile.positions,
          receivedOn: jobProfile.receivedOn ? new Date(jobProfile.receivedOn) : null,
          estimatedCloseDate: jobProfile.estimatedCloseDate ? new Date(jobProfile.estimatedCloseDate) : null,
          location: jobProfile.location,
          status: jobProfile.status,
        });
      } else {
        setForm({ ...emptyForm });
      }
      setErrors({});
      setSubmitting(false);
    }
  }, [visible, jobProfile]);

  // Load departments when client changes
  useEffect(() => {
    const load = async () => {
      if (form.clientId !== null) {
        setLoadingDepartments(true);
        try {
          const data = await getDepartmentsByClientId(form.clientId);
          setDepartments(data);

          // Reset department if current one is not valid for new client
          if (form.departmentId && !data.find(d => d.id === form.departmentId)) {
            setForm(prev => ({ ...prev, departmentId: null }));
          }
        } catch (err) {
          console.error('Error loading departments', err);
          setDepartments([]);
        } finally {
          setLoadingDepartments(false);
        }
      } else {
        // If no client selected, reset departments list and departmentId
        setDepartments([]);
        setForm(prev => ({ ...prev, departmentId: null }));
      }
    };
    load();
  }, [form.clientId]);

  // Generic change handler
  const updateField = <
    K extends keyof JobProfileFormData & keyof JobProfileFormErrors
  >(
    field: K,
    value: JobProfileFormData[K]
  ) => {
    setForm(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Validation
  const validate = useCallback((): boolean => {
    const e: JobProfileFormErrors = {};

    if (!form.clientId) e.clientId = 'Client is required';
    if (!form.departmentId) e.departmentId = 'Department is required';

    if (!form.jobProfileDescription.trim()) {
      e.jobProfileDescription = 'Job Profile Description is required';
    } else if (form.jobProfileDescription.length < 10) {
      e.jobProfileDescription = 'Minimum 10 characters required';
    } else if (form.jobProfileDescription.length > 500) {
      e.jobProfileDescription = 'Maximum 500 characters allowed';
    }

    if (!form.jobRole.trim()) {
      e.jobRole = 'Job Role is required';
    } else if (form.jobRole.length < 2) {
      e.jobRole = 'Minimum 2 characters required';
    } else if (form.jobRole.length > 100) {
      e.jobRole = 'Maximum 100 characters allowed';
    }

    if (!form.techSpecification.trim()) {
      e.techSpecification = 'Tech Specification is required';
    }

    if (form.positions === null || form.positions === undefined) {
      e.positions = 'Positions is required';
    }

    if (!form.estimatedCloseDate) {
      e.estimatedCloseDate = 'Required';
    } else if (form.estimatedCloseDate <= new Date()) {
      e.estimatedCloseDate = 'Must be in the future';
    }

    if (!form.location.trim()) e.location = 'Location required';

    if (!form.status) e.status = 'Status is required';

    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form]);

  // Submit handler
  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);

    const payload: JobProfileRequest = {
      ...(form.jobProfileId && { jobProfileId: form.jobProfileId }),
      clientId: form.clientId!,
      departmentId: form.departmentId!,
      jobProfileDescription: form.jobProfileDescription.trim(),
      jobRole: form.jobRole.trim(),
      techSpecification: form.techSpecification.trim(),
      positions: form.positions!,
      estimatedCloseDate: form.estimatedCloseDate!.toISOString(),
      location: form.location.trim(),
      status: form.status!,
    };

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
            value={form.clientId}
            options={clients.map(c => ({ label: c.name, value: c.id }))}
            onChange={(e: DropdownChangeEvent) => updateField('clientId', e.value)}
            placeholder="Select Client"
            className={classNames({ 'p-invalid': errors.clientId })}
          />
          {errors.clientId && <small className="p-error">{errors.clientId}</small>}
        </div>

        <div className="field col-6">
          <label>Department</label>
          <Dropdown
            value={form.departmentId}
            options={departments.map(d => ({ label: d.name, value: d.id }))}
            onChange={(e: DropdownChangeEvent) => updateField('departmentId', e.value)}
            placeholder="Select Department"
            loading={loadingDepartments}
            disabled={!form.clientId}
            className={classNames({ 'p-invalid': errors.departmentId })}
          />
          {errors.departmentId && <small className="p-error">{errors.departmentId}</small>}
        </div>

        <div className="field col-12">
          <label>Job Profile Description</label>
          <InputTextarea
            value={form.jobProfileDescription}
            onChange={e => updateField('jobProfileDescription', e.target.value)}
            rows={3}
            maxLength={500}
            className={classNames({ 'p-invalid': errors.jobProfileDescription })}
            placeholder="Minimum 10 characters, maximum 500 characters"
          />
          <small className="text-muted">{form.jobProfileDescription.length}/500 characters</small>
          {errors.jobProfileDescription && <small className="p-error">{errors.jobProfileDescription}</small>}
        </div>

        <div className="field col-6">
          <label>Job Role</label>
          <InputText
            value={form.jobRole}
            onChange={e => updateField('jobRole', e.target.value)}
            maxLength={100}
            className={classNames({ 'p-invalid': errors.jobRole })}
            placeholder="e.g., Backend Engineer"
          />
          <small className="text-muted">{form.jobRole.length}/100 characters</small>
          {errors.jobRole && <small className="p-error">{errors.jobRole}</small>}
        </div>

        <div className="field col-6">
          <label>Tech Specification</label>
          <InputText
            value={form.techSpecification}
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
            onInput={(e: React.ChangeEvent<HTMLInputElement>) => updateField('positions', e.target.value ? Number(e.target.value.replace(/,/g, '')) : null)}
            min={1}
            className={classNames({ 'p-invalid': errors.positions })}
          />
          {errors.positions && <small className="p-error">{errors.positions}</small>}
        </div>

        <div className="field col-4">
          <label>Estimated Close Date</label>
          <Calendar
            value={form.estimatedCloseDate}
            onChange={e => updateField('estimatedCloseDate', (e.value as Date) ?? null)}
            showIcon
            minDate={tomorrow}
            className={classNames({ 'p-invalid': errors.estimatedCloseDate })}
          />
          {errors.estimatedCloseDate && <small className="p-error">{errors.estimatedCloseDate}</small>}
        </div>

        <div className="field col-4">
          <label>Location</label>
          <InputText
            value={form.location}
            onChange={e => updateField('location', e.target.value)}
            className={classNames({ 'p-invalid': errors.location })}
            placeholder="e.g., US, IDC, Seattle"
          />
          {errors.location && <small className="p-error">{errors.location}</small>}
        </div>

        <div className="field col-12">
          <label>Status</label>
          <Dropdown
            value={form.status}
            options={statusOptions}
            onChange={(e: DropdownChangeEvent) => updateField('status', e.value)}
            placeholder="Select Status"
            className={classNames({ 'p-invalid': errors.status })}
          />
          {errors.status && <small className="p-error">{errors.status}</small>}
        </div>

      </div>
    </Dialog>
  );
};

export default JobProfileAddEdit;