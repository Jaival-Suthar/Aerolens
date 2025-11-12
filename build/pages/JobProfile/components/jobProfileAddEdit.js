import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useMemo, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { classNames } from 'primereact/utils';
import { Toast } from 'primereact/toast'; // 👈 Import Toast
import DialogButton from '../../../shared/DialogAddEditButton';
import { validateJobProfileRequest } from '../services/jobProfileService';
import { FaCheck } from 'react-icons/fa';
const statusOptions = [
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Closed', value: 'Closed' },
    { label: 'Cancelled', value: 'Cancelled' },
];
const emptyForm = {
    clientId: undefined,
    departmentId: undefined,
    jobProfileDescription: '',
    jobRole: '',
    techSpecification: '',
    positions: 1,
    estimatedCloseDate: '',
    location: '',
    status: undefined,
};
const JobProfileAddEdit = ({ visible, onHide, onSave, jobProfile, clients, loading = false, }) => {
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const toast = useRef(null); // 👈 Toast Ref
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
                    // Calendar component expects an ISO string or Date object. 
                    // We'll keep it as a string for consistency in the form state.
                    estimatedCloseDate: jobProfile.estimatedCloseDate,
                    location: jobProfile.location || '',
                    status: jobProfile.status,
                });
            }
            else {
                setForm({ ...emptyForm });
            }
            setErrors({});
            setSubmitting(false);
        }
    }, [visible, jobProfile]);
    // Get departments for the selected client using useMemo for optimization
    const availableDepartments = useMemo(() => {
        if (!form.clientId)
            return [];
        const selectedClient = clients.find(client => client.clientId === form.clientId);
        return selectedClient ? selectedClient.departments : [];
    }, [form.clientId, clients]);
    // Check if the currently selected department is still valid for the selected client
    const isDepartmentValidForClient = useMemo(() => {
        if (!form.clientId || !form.departmentId)
            return true;
        return availableDepartments.some(dept => dept.departmentId === form.departmentId);
    }, [form.clientId, form.departmentId, availableDepartments]);
    // Prepare client options for dropdown
    const clientOptions = useMemo(() => clients.map(client => ({
        label: client.clientName,
        value: client.clientId
    })), [clients]);
    // Prepare department options for dropdown
    const departmentOptions = useMemo(() => availableDepartments.map(dept => ({
        label: dept.departmentName,
        value: dept.departmentId
    })), [availableDepartments]);
    // Helper to check if a field is empty
    const isFieldEmpty = (value) => {
        if (value === null || value === undefined)
            return true;
        if (typeof value === 'string')
            return value.trim() === '';
        if (typeof value === 'number')
            return isNaN(value) || value <= 0;
        return false;
    };
    // Generic change handler
    const updateField = (field, value) => {
        setForm(prev => {
            const newForm = { ...prev, [field]: value };
            // Reset departmentId if clientId changes and current department is not valid for new client
            if (field === 'clientId') {
                const newClient = clients.find(c => c.clientId === value);
                const currentDepartmentId = prev.departmentId;
                if (currentDepartmentId && newClient) {
                    const isDepartmentValid = newClient.departments.some(dept => dept.departmentId === currentDepartmentId);
                    if (!isDepartmentValid) {
                        newForm.departmentId = undefined; // Set to undefined for better "empty" state handling
                    }
                }
                else {
                    newForm.departmentId = undefined; // Set to undefined
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
    const preValidateForm = () => {
        const newErrors = {};
        let isValid = true;
        // List of required fields for a quick check
        const requiredFields = [
            'clientId',
            'departmentId',
            'jobProfileDescription',
            'jobRole',
            'techSpecification',
            'positions',
            'estimatedCloseDate',
            'location',
            'status'
        ];
        requiredFields.forEach(field => {
            const value = form[field];
            // Special check for Positions, ensuring it's > 0
            if (field === 'positions') {
                if (isFieldEmpty(value) || (typeof value === 'number' && value <= 0)) {
                    newErrors.positions = 'Positions must be a number greater than 0.';
                    isValid = false;
                }
            }
            else if (isFieldEmpty(value)) {
                newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1').trim()} is required.`;
                isValid = false;
            }
        });
        // Additional validation for Department validity after client change
        if (form.clientId && form.departmentId && !isDepartmentValidForClient) {
            newErrors.departmentId = 'Selected department is not valid for the selected client';
            isValid = false;
        }
        setErrors(newErrors);
        // Show a general error toast if basic validation fails
        if (!isValid) {
            toast.current?.show({
                severity: 'error',
                summary: 'Validation Error',
                detail: 'Please fill in all required fields and correct the errors.',
                life: 3000
            });
        }
        return isValid;
    };
    // Submit handler
    const handleSubmit = async () => {
        setErrors({}); // Clear previous errors before starting validation
        if (!preValidateForm()) {
            return; // Stop if basic pre-validation fails
        }
        // Now, we can safely assume required fields are present for the payload construction
        let isoDate = '';
        const closeDate = form.estimatedCloseDate;
        if (closeDate) {
            const date = new Date(closeDate);
            if (!isNaN(date.getTime())) {
                // Convert to ISO string for the backend payload
                isoDate = date.toISOString();
            }
            else {
                setErrors({ estimatedCloseDate: 'Estimated Close Date is invalid' });
                return;
            }
        }
        else {
            // This case should be covered by preValidateForm, but kept as a safeguard
            setErrors({ estimatedCloseDate: 'Estimated Close Date is required' });
            return;
        }
        // Type assertion is safe here because preValidateForm checked for all required fields
        const payload = {
            clientId: form.clientId,
            departmentId: form.departmentId,
            jobProfileDescription: form.jobProfileDescription.trim(),
            jobRole: form.jobRole.trim(),
            techSpecification: form.techSpecification.trim(),
            positions: form.positions,
            estimatedCloseDate: isoDate,
            location: form.location.trim(),
            status: form.status,
        };
        // Run the service-level validation (e.g., length, formatting checks)
        const validationErrors = validateJobProfileRequest(payload);
        if (validationErrors.length > 0) {
            const errorObj = {};
            validationErrors.forEach(err => {
                // Map the generic error messages back to the specific fields for display
                if (err.includes('Client'))
                    errorObj.clientId = err;
                else if (err.includes('Department'))
                    errorObj.departmentId = err;
                else if (err.includes('Description'))
                    errorObj.jobProfileDescription = err;
                else if (err.includes('Job Role'))
                    errorObj.jobRole = err;
                else if (err.includes('Tech Specification'))
                    errorObj.techSpecification = err;
                else if (err.includes('Positions'))
                    errorObj.positions = err;
                else if (err.includes('Close Date'))
                    errorObj.estimatedCloseDate = err;
                else if (err.includes('Location'))
                    errorObj.location = err;
                else if (err.includes('Status'))
                    errorObj.status = err;
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
            // 🚀 Success Toast Notification
            const successMessage = jobProfile
                ? 'Job Profile updated successfully!'
                : 'Job Profile created successfully!';
            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: successMessage,
                life: 3000
            });
            onHide(); // Close the dialog on success
        }
        catch (err) {
            console.error('Save failed', err);
            // Fallback error toast
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to save job profile. Please try again.',
                life: 3000
            });
        }
        finally {
            setSubmitting(false);
        }
    };
    const footer = (_jsxs("div", { className: "flex justify-content-end gap-2", children: [_jsx(DialogButton, { label: "Cancel", onClick: onHide, severity: "secondary" }), _jsx(DialogButton, { label: jobProfile ? 'Update Job Profile' : 'Add Job Profile', severity: "success", icon: _jsx(FaCheck, { style: { fontSize: 16, marginRight: 8, marginLeft: 4 } }), onClick: handleSubmit, loading: submitting, disabled: loading })] }));
    return (_jsxs(_Fragment, { children: [_jsx(Toast, { ref: toast }), " ", _jsx(Dialog, { visible: visible, header: jobProfile ? 'Edit Job Profile' : 'Add Job Profile', style: { width: '50rem' }, modal: true, onHide: onHide, footer: footer, closable: !submitting, draggable: false, resizable: false, children: _jsxs("div", { className: "p-fluid formgrid grid gap-3", children: [_jsxs("div", { className: "field col-6", children: [_jsxs("label", { children: ["Client ", _jsx("span", { className: "p-error", children: "*" })] }), _jsx(Dropdown, { value: form.clientId ?? null, options: clientOptions, onChange: (e) => updateField('clientId', e.value), placeholder: "Select Client", className: classNames({ 'p-invalid': errors.clientId }), optionLabel: "label", optionValue: "value" }), errors.clientId && _jsx("small", { className: "p-error", children: errors.clientId })] }), _jsxs("div", { className: "field col-6", children: [_jsxs("label", { children: ["Department ", _jsx("span", { className: "p-error", children: "*" })] }), _jsx(Dropdown, { value: form.departmentId ?? null, options: departmentOptions, onChange: (e) => updateField('departmentId', e.value), placeholder: "Select Department", disabled: !form.clientId || availableDepartments.length === 0, className: classNames({
                                        'p-invalid': errors.departmentId,
                                    }), optionLabel: "label", optionValue: "value" }), form.clientId && availableDepartments.length === 0 && (_jsx("small", { className: "text-muted", children: "No departments available for selected client" })), errors.departmentId && _jsx("small", { className: "p-error", children: errors.departmentId })] }), _jsxs("div", { className: "field col-12", children: [_jsxs("label", { children: ["Job Profile Description ", _jsx("span", { className: "p-error", children: "*" })] }), _jsx(InputTextarea, { value: form.jobProfileDescription || '', onChange: e => updateField('jobProfileDescription', e.target.value), rows: 3, maxLength: 500, className: classNames({ 'p-invalid': errors.jobProfileDescription }), placeholder: "Minimum 10 characters, maximum 500 characters" }), _jsxs("small", { className: "text-muted", children: [form.jobProfileDescription?.length ?? 0, "/500 characters"] }), errors.jobProfileDescription && _jsx("small", { className: "p-error", children: errors.jobProfileDescription })] }), _jsxs("div", { className: "field col-6", children: [_jsxs("label", { children: ["Job Role ", _jsx("span", { className: "p-error", children: "*" })] }), _jsx(InputText, { value: form.jobRole || '', onChange: e => updateField('jobRole', e.target.value), maxLength: 100, className: classNames({ 'p-invalid': errors.jobRole }), placeholder: "e.g., Backend Engineer" }), _jsxs("small", { className: "text-muted", children: [form.jobRole?.length ?? 0, "/100 characters"] }), errors.jobRole && _jsx("small", { className: "p-error", children: errors.jobRole })] }), _jsxs("div", { className: "field col-6", children: [_jsxs("label", { children: ["Tech Specification ", _jsx("span", { className: "p-error", children: "*" })] }), _jsx(InputText, { value: form.techSpecification || '', onChange: e => updateField('techSpecification', e.target.value), className: classNames({ 'p-invalid': errors.techSpecification }), placeholder: "e.g., Java, React, Spring Boot" }), errors.techSpecification && _jsx("small", { className: "p-error", children: errors.techSpecification })] }), _jsxs("div", { className: "field col-4", children: [_jsxs("label", { children: ["Positions ", _jsx("span", { className: "p-error", children: "*" })] }), _jsx(InputNumber, { value: form.positions ?? undefined, onValueChange: (e) => updateField('positions', e.value ?? 0), min: 1, className: classNames({ 'p-invalid': errors.positions }) }), errors.positions && _jsx("small", { "data-testid": "error-positions", className: "p-error", children: errors.positions })] }), _jsxs("div", { className: "field col-4", children: [_jsxs("label", { children: ["Estimated Close Date ", _jsx("span", { className: "p-error", children: "*" })] }), _jsx(Calendar, { value: form.estimatedCloseDate ? new Date(form.estimatedCloseDate) : null, onChange: e => {
                                        const val = e.value;
                                        if (val instanceof Date && !isNaN(val.getTime())) {
                                            // Ensure value is set as ISO string
                                            updateField('estimatedCloseDate', val.toISOString());
                                        }
                                        else if (typeof val === 'string' && val) {
                                            updateField('estimatedCloseDate', val);
                                        }
                                        else {
                                            updateField('estimatedCloseDate', '');
                                        }
                                    }, showIcon: true, minDate: tomorrow, className: classNames({ 'p-invalid': errors.estimatedCloseDate }) }), errors.estimatedCloseDate && _jsx("small", { className: "p-error", children: errors.estimatedCloseDate })] }), _jsxs("div", { className: "field col-4", children: [_jsxs("label", { children: ["Location ", _jsx("span", { className: "p-error", children: "*" })] }), _jsx(InputText, { value: form.location || '', onChange: e => updateField('location', e.target.value), className: classNames({ 'p-invalid': errors.location }), placeholder: "e.g., US, IDC, Seattle" }), errors.location && _jsx("small", { className: "p-error", children: errors.location })] }), _jsxs("div", { className: "field col-12", children: [_jsxs("label", { children: ["Status ", _jsx("span", { className: "p-error", children: "*" })] }), _jsx(Dropdown, { value: form.status ?? null, options: statusOptions, onChange: (e) => updateField('status', e.value), placeholder: "Select Status", className: classNames({ 'p-invalid': errors.status }), optionLabel: "label", optionValue: "value" }), errors.status && _jsx("small", { className: "p-error", children: errors.status })] })] }) })] }));
};
export default JobProfileAddEdit;
