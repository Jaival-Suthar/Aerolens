import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { classNames } from 'primereact/utils';
import { Toast } from 'primereact/toast';
import { FaCheck, FaPlus, FaTrash } from 'react-icons/fa';
import { patchMember, getMemberById } from '../services/memberService';
import { useAuth } from '../../../shared/auth/AuthContext';
import type { Member, MemberPatchPayload, MemberFormData } from '../types/memberTypes';
import DialogButton from "../../../shared/DialogAddEditButton";
import PhoneInputField from "../../../shared/components/PhoneInput";
import { isLikelyE164 } from "../../../shared/utils/phoneE164";

interface Skill {
  skillName: string;
  proficiencyLevel: string;
  yearsOfExperience: number;
}

interface FormErrors {
  memberName?: string;
  memberContact?: string;
  email?: string;
  designation?: string;
  location?: string;
  organisation?: string;
  interviewerCapacity?: string;
  skills?: string;
  client?: string;
}

interface Props {
  visible: boolean;
  onHide: () => void;
  selectedMember: Member | null;
  onSuccess: () => void;
  formData: MemberFormData;
}

const proficiencyLevels = [
  { label: 'Beginner', value: 'Beginner' },
  { label: 'Intermediate', value: 'Intermediate' },
  { label: 'Advanced', value: 'Advanced' },
  { label: 'Expert', value: 'Expert' },
];

const MemberEdit: React.FC<Props> = ({
  visible,
  onHide,
  selectedMember,
  onSuccess,
  formData
}) => {
  const { accessToken } = useAuth();
  const [form, setForm] = useState<Partial<MemberPatchPayload>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [formSkills, setFormSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);

  useEffect(() => {
  if (!visible || !selectedMember) return;

  const fetchMember = async () => {
    try {
      setLoading(true);
      const res = await getMemberById(accessToken, selectedMember.memberId);

      const m = res.data;

      setForm({
        memberName: m.memberName,
        memberContact: m.memberContact,
        email: m.email,
        designationId: m.designationId,
        vendorId: m.vendorId ?? null,
        clientId: m.clientId,
        organisation: m.organisation ?? '',
        isRecruiter: m.isRecruiter,
        isInterviewer: m.isInterviewer,
        interviewerCapacity: m.interviewerCapacity ?? 0,
        location: {
          city: m.location.city,
          country: m.location.country,
        },
      });

      setFormSkills(
        m.skills.map(s => ({
          skillName: s.skillName,
          proficiencyLevel: s.proficiencyLevel,
          yearsOfExperience: s.yearsOfExperience,
        }))
      );
    } catch (e) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load member details',
      });
    } finally {
      setLoading(false);
    }
  };

  fetchMember();
}, [visible, selectedMember?.memberId]);

  // Get unique countries
  const availableCountries = useMemo(() => {
    const countries = formData.locations.map(loc => loc.country);
    return Array.from(new Set(countries)).sort();
  }, [formData.locations]);

  // Get cities for selected country
  const availableCities = useMemo(() => {
    if (!form.location?.country) return [];
    const cities = formData.locations
      .filter(loc => loc.country === form.location?.country)
      .map(loc => loc.city);
    return Array.from(new Set(cities)).sort();
  }, [form.location?.country, formData.locations]);

  // Prepare dropdown options
  const clientOptions = useMemo(
    () =>
      formData.clients.map((client) => ({
        label: client.clientName,
        value: client.clientId,
      })),
    [formData.clients]
  );

  const designationOptions = useMemo(
    () =>
      formData.designations.map((d) => ({
        label: d.value,
        value: d.lookupKey,
      })),
    [formData.designations]
  );

  const skillNameOptions = useMemo(
    () =>
      formData.skills.map((s) => ({
        label: s.skillName,
        value: s.skillName,
      })),
    [formData.skills]
  );

  const vendorOptions = useMemo(
    () =>
      formData.vendors.map((v) => ({
        label: v.vendorName,
        value: v.vendorId,
      })),
    [formData.vendors]
  );

  // Update form field
  const updateField = <K extends keyof MemberPatchPayload>(
    field: K,
    value: MemberPatchPayload[K]
  ) => {
    setForm((prev) => {
      const newForm = { ...prev, [field]: value };

      if (
        field === 'location' &&
        value &&
        typeof value === 'object' &&
        'country' in value
      ) {
        const currentCity = prev.location?.city;

        if (currentCity && value.country) {
          const isCityValid = formData.locations
            .filter((loc) => loc.country === value.country)
            .some((loc) => loc.city === currentCity);

          if (!isCityValid) {
            newForm.location = { ...value, city: '' };
          }
        }
      }

      return newForm;
    });

    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Add new skill
  const handleAddSkill = () => {
    setFormSkills(prev => [
      ...prev,
      { skillName: '', proficiencyLevel: '', yearsOfExperience: 0 },
    ]);
  };

  // Remove skill
  const handleRemoveSkill = (index: number) => {
    setFormSkills(prev => prev.filter((_, i) => i !== index));
  };

  // Update skill field
  const updateSkill = (index: number, field: keyof Skill, value: any) => {
    setFormSkills(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!form.memberName?.trim()) {
      newErrors.memberName = 'Member name is required';
      isValid = false;
    }

    if (!form.memberContact?.trim()) {
      newErrors.memberContact = 'Contact number is required';
      isValid = false;
    } else if (!isLikelyE164(form.memberContact.trim())) {
      newErrors.memberContact =
        'Enter a valid international number with country code (e.g. +91…, +44…).';
      isValid = false;
    }

    if (!form.email?.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email format';
      isValid = false;
    }

    if (!form.designationId) {
      newErrors.designation = 'Designation is required';
      isValid = false;
    }

    if (!form.location?.country || !form.location?.city) {
      newErrors.location = 'Country and City are required';
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) {
      toast.current?.show({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please correct the highlighted fields',
        life: 2000,
      });
    }

    return isValid;
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!validateForm() || !selectedMember) return;

    const payload: MemberPatchPayload = {
      memberName: form.memberName!.trim(),
      memberContact: form.memberContact!.trim(),
      email: form.email!.trim(),
      designationId: form.designationId!,
      isRecruiter: Boolean(form.isRecruiter), // ← Explicit conversion
      isInterviewer: Boolean(form.isInterviewer),
      interviewerCapacity: form.isInterviewer ? form.interviewerCapacity : null,
      vendorId: Boolean(form.isRecruiter) ? (form.vendorId ?? null) : null,
      clientId: form.clientId ?? null,
      organisation: form.organisation?.trim(),
      location: form.location!,
      skills: formSkills.filter(s => s.skillName && s.proficiencyLevel),
    };
  
    setSubmitting(true);
    try {
      const response = await patchMember(accessToken, selectedMember.memberId, payload);
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: response.message || 'Member updated successfully',
        life: 2000,
      });
      onSuccess();
      onHide();
    } catch (error: unknown) {
      const err = error as Error & {
        validationErrors?: Array<{ field: string; message: string }>;
      };
      const ve = err.validationErrors;
      if (Array.isArray(ve)) {
        const next: FormErrors = { ...errors };
        for (const row of ve) {
          if (row.field === 'memberContact') next.memberContact = row.message;
          if (row.field === 'email') next.email = row.message;
          if (row.field === 'memberName') next.memberName = row.message;
        }
        setErrors(next);
      }
      toast.current?.show({
        severity: 'error',
        summary: 'Validation Error',
        detail: err.message || 'Please fix highlighted fields',
        life: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const footer = (
  <div className="flex justify-content-end gap-2">
    <DialogButton
      label="Cancel"
      severity="secondary"
      onClick={onHide}
      disabled={submitting}
    />

    <DialogButton
      label="Update Member"
      severity="success"
      icon={<FaCheck style={{ fontSize: 16, marginRight: 8 }} />}
      onClick={handleSubmit}
      loading={submitting}
      disabled={submitting}
    />
  </div>
);


  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header="Edit Member"
        visible={visible}
        onHide={onHide}
        footer={footer}
        style={{ width: '90vw', maxWidth: '1200px' }}
        modal
        dismissableMask
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Member Name */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Member Name *
              </label>
              <InputText
                value={form.memberName || ''}
                onChange={e => updateField('memberName', e.target.value)}
                className={classNames({ 'p-invalid': errors.memberName })}
                placeholder="Enter full name"
                style={{ width: '100%' }}
              />
              {errors.memberName && <small style={{ color: 'red' }}>{errors.memberName}</small>}
            </div>

            {/* Contact Number */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Contact Number *
              </label>
              <PhoneInputField
                id="member-contact-e164"
                value={form.memberContact || ''}
                onChange={(v) => updateField('memberContact', v)}
                disabled={submitting || loading}
                error={errors.memberContact}
              />
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Email *
              </label>
              <InputText
                value={form.email || ''}
                onChange={e => updateField('email', e.target.value)}
                className={classNames({ 'p-invalid': errors.email })}
                placeholder="email@example.com"
                style={{ width: '100%' }}
              />
              {errors.email && <small style={{ color: 'red' }}>{errors.email}</small>}
            </div>

            {/* Designation */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Designation *
              </label>
              <Dropdown
                value={form.designationId}
                options={designationOptions}
                onChange={e => updateField('designationId', e.value)}
                placeholder="Select Designation"
                className={classNames({ 'p-invalid': errors.designation })}
                style={{ width: '100%' }}
              />
              {errors.designation && <small style={{ color: 'red' }}>{errors.designation}</small>}
            </div>

            {/* Country & City Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Country *
                </label>
                <Dropdown
                  key={`country-${errors.location}`}
                  value={form.location?.country}
                  options={availableCountries.map(c => ({ label: c, value: c }))}
                  onChange={e =>
                    updateField('location', {
                      country: e.value,
                      city: '',
                    })
                  }
                  placeholder="Select Country"
                  className={classNames({ 'p-invalid': errors.location })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  City *
                </label>
                <Dropdown
                  value={form.location?.city}
                  options={availableCities.map(c => ({ label: c, value: c }))}
                  onChange={e =>
                    updateField('location', {
                      country: form.location?.country || '',
                      city: e.value,
                    })
                  }
                  placeholder="Select City"
                  disabled={!form.location?.country || availableCities.length === 0}
                  className={classNames({ 'p-invalid': errors.location })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            {errors.location && <small style={{ color: 'red' }}>{errors.location}</small>}

            {/* Client */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Client Belonging
              </label>
              <Dropdown
                value={form.clientId}
                options={clientOptions}
                onChange={e => updateField('clientId', e.value)}
                placeholder="Select Client"
                className={classNames({ 'p-invalid': errors.client })}
                style={{ width: '100%' }}
                showClear
              />
              {errors.client && <small style={{ color: 'red' }}>{errors.client}</small>}
            </div>

            {/* Organisation */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Organisation
              </label>
              <InputText
                value={form.organisation || ''}
                onChange={e => updateField('organisation', e.target.value)}
                placeholder="Enter organisation name"
                style={{ width: '100%' }}
              />
            </div>

            {/* Checkboxes */}
<div style={{ display: 'flex', gap: '1.5rem' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <Checkbox
      inputId="isRecruiter"
      checked={!!form.isRecruiter}
      onChange={(e) => updateField('isRecruiter', e.checked)}
    />
    <label htmlFor="isRecruiter">Is Recruiter</label>
  </div>

  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <Checkbox
      inputId="isInterviewer"
      checked={!!form.isInterviewer}
      onChange={(e) => updateField('isInterviewer', e.checked)}
    />
    <label htmlFor="isInterviewer">Can Take Interviews</label>
  </div>
</div>


            {/* Vendor (conditional) */}
            {form.isRecruiter && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Vendor
                </label>
                <Dropdown
                  value={form.vendorId}
                  options={vendorOptions}
                  onChange={e => updateField('vendorId', e.value)}
                  placeholder="Select Vendor"
                  showClear
                  style={{ width: '100%' }}
                />
              </div>
            )}

            {/* Interviewer Capacity (conditional) */}
            {form.isInterviewer && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Interviews Per Day (Capacity)
                </label>
                <InputNumber
                  value={form.interviewerCapacity ?? null}
                  onValueChange={(e) =>
                    setForm(prev => ({
                      ...prev,
                      interviewerCapacity: e.value ?? null,
                    }))
                  }
                  min={1}
                  max={10}
                  style={{ width: '100%' }}
                />
                {errors.interviewerCapacity && (
                  <small style={{ color: 'red' }}>{errors.interviewerCapacity}</small>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Skills */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <label style={{ fontWeight: '600', fontSize: '1.1rem' }}>Skills</label>
              <Button
                icon={<FaPlus />}
                label="Add Skill"
                severity="info"
                size="small"
                onClick={handleAddSkill}
                type="button"
              />
            </div>

            <div style={{ 
              maxHeight: '480px', 
              overflowY: 'auto', 
              border: '1px solid #e5e7eb', 
              borderRadius: '6px',
              padding: '1rem',
              backgroundColor: '#f9fafb'
            }}>
              {formSkills.length === 0 && (
                <div style={{ textAlign: 'center', color: '#374151', padding: '2rem' }}>
                  No skills added yet. Click "Add Skill" to begin.
                </div>
              )}

              {formSkills.map((skill, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: 'white',
                    padding: '1rem',
                    borderRadius: '6px',
                    marginBottom: '0.75rem',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <strong style={{ color: '#374151' }}>Skill #{index + 1}</strong>
                    <Button
                      icon={<FaTrash />}
                      severity="danger"
                      outlined
                      size="small"
                      onClick={() => handleRemoveSkill(index)}
                      type="button"
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                        Skill Name
                      </label>
                      <Dropdown
                        value={skill.skillName}
                        options={skillNameOptions}
                        onChange={e => updateSkill(index, 'skillName', e.value)}
                        placeholder="Select Skill"
                        className={classNames({ 'p-invalid': errors.skills && !skill.skillName })}
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                          Proficiency
                        </label>
                        <Dropdown
                          value={skill.proficiencyLevel}
                          options={proficiencyLevels}
                          onChange={e => updateSkill(index, 'proficiencyLevel', e.value)}
                          placeholder="Level"
                          className={classNames({
                            'p-invalid': errors.skills && !skill.proficiencyLevel,
                          })}
                          style={{ width: '100%' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                          Years of Experience
                        </label>
                        <InputNumber
                          value={skill.yearsOfExperience}
                          onValueChange={e => updateSkill(index, 'yearsOfExperience', e.value || 0)}
                          min={0}
                          max={50}
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {errors.skills && (
              <small style={{ color: 'red', marginTop: '0.5rem', display: 'block' }}>
                {errors.skills}
              </small>
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default MemberEdit;