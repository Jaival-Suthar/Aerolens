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
import { patchMember } from '../services/memberService';
import { useAuth } from '../../../shared/auth/AuthContext';
import type { Member, Location, ClientOption, MemberPatchPayload } from '../types/memberTypes';
import DialogButton from "../../../shared/DialogAddEditButton";


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
  clients: ClientOption[];
  locations: Location[];
  designations: string[];
  skillOptions: string[];
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
  clients,
  locations,
  designations,
  skillOptions,
}) => {
  const { accessToken } = useAuth();
  const [form, setForm] = useState<Partial<MemberPatchPayload>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [formSkills, setFormSkills] = useState<Skill[]>([]);
  const toast = useRef<Toast>(null);

  // Load member data when dialog opens
  useEffect(() => {
    if (visible && selectedMember) {
      // Find clientId from clientName
      const selectedClient = clients.find(c => c.clientName === selectedMember.clientName);
      
      setForm({
        memberName: selectedMember.memberName,
        memberContact: selectedMember.memberContact,
        email: selectedMember.email,
        designation: selectedMember.designation,
        clientId: selectedClient?.clientId,
        organisation: selectedMember.organisation || '',
        isRecruiter: selectedMember.isRecruiter,
        isInterviewer: selectedMember.isInterviewer,
        interviewerCapacity: selectedMember.interviewerCapacity || 0,
        location: {
          city: selectedMember.location?.city || '',
          country: selectedMember.location?.country || '',
        },
      });

      // Map skills
      setFormSkills(
        selectedMember.skills?.length > 0
          ? selectedMember.skills.map(skill => ({
              skillName: skill.skillName,
              proficiencyLevel: skill.proficiencyLevel,
              yearsOfExperience: skill.yearsOfExperience,
            }))
          : []
      );
      setErrors({});
    }
  }, [visible, selectedMember, clients]);

  // Get unique countries
  const availableCountries = useMemo(() => {
    const countries = locations.map(loc => loc.country);
    return Array.from(new Set(countries)).sort();
  }, [locations]);

  // Get cities for selected country
  const availableCities = useMemo(() => {
    if (!form.location?.country) return [];
    const cities = locations
      .filter(loc => loc.country === form.location?.country)
      .map(loc => loc.city);
    return Array.from(new Set(cities)).sort();
  }, [form.location?.country, locations]);

  // Prepare dropdown options
  const clientOptions = useMemo(
    () => clients.map(client => ({
      label: client.clientName,
      value: client.clientId,
    })),
    [clients]
  );

  const designationOptions = useMemo(
    () => designations.map(d => ({ label: d, value: d })),
    [designations]
  );

  const skillNameOptions = useMemo(
    () => skillOptions.map(s => ({ label: s, value: s })),
    [skillOptions]
  );

  // Update form field
  const updateField = <K extends keyof MemberPatchPayload>(
    field: K,
    value: MemberPatchPayload[K]
  ) => {
    setForm(prev => {
      const newForm = { ...prev, [field]: value };

      // Reset city if country changes
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

    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
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
    } else if (!/^\+?[\d\s-]{10,}$/.test(form.memberContact)) {
      newErrors.memberContact = 'Invalid contact number';
      isValid = false;
    }

    if (!form.email?.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email format';
      isValid = false;
    }

    if (!form.designation) {
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
        life: 3000,
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
      designation: form.designation!,
      clientId: form.clientId,
      organisation: form.organisation?.trim() || '',
      isRecruiter: form.isRecruiter || false,
      isInterviewer: form.isInterviewer || false,
      interviewerCapacity: form.interviewerCapacity || 0,
      location: {
        city: form.location!.city,
        country: form.location!.country,
      },
      skills: formSkills.filter(
        skill => skill.skillName && skill.proficiencyLevel
      ),
    };

    setSubmitting(true);
    try {
      const response = await patchMember(accessToken, selectedMember.memberId, payload);
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: response.message || 'Member updated successfully',
        life: 3000,
      });
      onSuccess();
      onHide();
    } catch (error: any) {
    toast.current?.show({
      severity: 'error',
      summary: 'Validation Error',
      detail: error.message || 'Please fix highlighted fields',
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
              <InputText
                value={form.memberContact || ''}
                onChange={e => updateField('memberContact', e.target.value)}
                className={classNames({ 'p-invalid': errors.memberContact })}
                placeholder="+91 9999999999"
                style={{ width: '100%' }}
              />
              {errors.memberContact && <small style={{ color: 'red' }}>{errors.memberContact}</small>}
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
                value={form.designation}
                options={designationOptions}
                onChange={e => updateField('designation', e.value)}
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
                  checked={form.isRecruiter || false}
                  onChange={e => updateField('isRecruiter', e.checked || false)}
                />
                <label htmlFor="isRecruiter">Is Recruiter</label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Checkbox
                  inputId="isInterviewer"
                  checked={form.isInterviewer || false}
                  onChange={e => updateField('isInterviewer', e.checked || false)}
                />
                <label htmlFor="isInterviewer">Can Take Interviews</label>
              </div>
            </div>

            {/* Interviewer Capacity */}
            {form.isInterviewer && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Interviews Per Day (Capacity)
                </label>
                <InputNumber
                  value={form.interviewerCapacity || 0}
                  onValueChange={e => updateField('interviewerCapacity', e.value || 0)}
                  min={1}
                  max={10}
                  className={classNames({ 'p-invalid': errors.interviewerCapacity })}
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
                <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
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