import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { FileUpload } from "primereact/fileupload";
import { FaCheck, FaTimes } from "react-icons/fa";
import { Toast } from "primereact/toast";
import DialogButton from "../../../shared/DialogAddEditButton";
import PhoneInputField from "../../../shared/components/PhoneInput";
import { isLikelyE164 } from "../../../shared/utils/phoneE164";
import { extractPdfText } from "../../JobProfileNew/util/pdfParser.util";
import {
  createCandidate,
  updateCandidate,
  uploadResume,
  getCandidateById,
} from "../services/useResume";
import { ResumeAddEditProps, AddEditCandidate, CandidateCreateData, AddEditCandidateApiPayload } from "../types/resumeTypes";
import { useAuth } from "../../../shared/auth/AuthContext";
import { useProfileStore } from "../../../shared/store/profile";

interface DropdownFieldProps {
  id: string;
  label: string;
  value: any;
  options: { label: string; value: any }[];
  onChange: (e: { value: any }) => void;
  onBlur: () => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  colSize?: string;
  required?: boolean;
  itemTemplate?: (option: any) => React.ReactNode;
  showClear?: boolean;
}

// ---------- HELPERS ----------
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/.*$/i;

const INITIAL_FORM: AddEditCandidate = {
  candidateName: "",
  contactNumber: undefined,
  email: undefined,
  recruiterId: null,
  recruiterName: null,
  vendorId: null,
  referredBy: undefined,
  jobProfileRequirementId: null as any,
  expectedLocation: { city: '', country: '' },
  currentLocation: null,
  // currentCTC: undefined,
  // expectedCTC: undefined,
  noticePeriod: 0,
  experienceYears: 0,
  linkedinProfileUrl: undefined,
  resumeFile: null,
  notes: undefined,
  workMode: null,
  workModeId: null,
  // NEW FIELDS
  currentCTCAmount: null,
  currentCTCCurrencyId: null,
  currentCTCTypeId: null,
  expectedCTCAmount: null,
  expectedCTCCurrencyId: null,
  expectedCTCTypeId: null,
};

// ---------- VALIDATION ----------
const validateField = (field: keyof AddEditCandidate, value: any, formData?: AddEditCandidate) => {
  switch (field) {
    case "candidateName":
      return value.trim() ? "" : "Candidate name is required.";
    case "recruiterName":
      return value ? "" : "Recruiter is required.";
      case "workModeId":
        return value ? "" : "Mode of Work is required.";
    case "contactNumber":
      if (!value) return ""; // OPTIONAL
      if (!isLikelyE164(value))
        return "Enter a valid international number with country code (e.g. +91…, +1…).";
      return "";
    case "email":
      if (!value) return ""; // OPTIONAL
      if (!emailRegex.test(value)) return "Enter a valid email.";
      return "";
    case "jobProfileRequirementId":
      return value ? "" : "Job profile is required.";
    case "expectedLocation":
      if (!value || !value.country) return "Country is required.";
      if (!value.city) return "City is required.";
      return "";
    case "currentLocation":
      if (!value || !value.country) return "";
      if (!value.city) return "City is required when country is selected.";
    return "";
    // case "currentCTC":
    //   if (value === undefined || value === null) return "";
    //   return value > 0 ? "" : "Current CTC must be greater than 0.";
    // case "expectedCTC":
    //   if (value === undefined || value === null) return "";
    //   return value > 0 ? "" : "Expected CTC must be greater than 0.";
    case "currentCTCAmount":
      if (value === undefined || value === null) return "";
      return value > 0 ? "" : "Current CTC must be greater than 0.";
    case "currentCTCCurrencyId":
      if (!formData?.currentCTCAmount) return "";
      return value ? "" : "Select currency for Current CTC.";
    case "currentCTCTypeId":
      if (!formData?.currentCTCAmount) return "";
      return value ? "" : "Select CTC type for Current CTC.";
    case "expectedCTCAmount":
      if (value === undefined || value === null) return "";
      return value > 0 ? "" : "Expected CTC must be greater than 0.";
    case "expectedCTCCurrencyId":
      if (!formData?.expectedCTCAmount) return "";
      return value ? "" : "Select currency for Expected CTC.";
    case "expectedCTCTypeId":
      if (!formData?.expectedCTCAmount) return "";
      return value ? "" : "Select CTC type for Expected CTC.";
    case "noticePeriod":
      return value >= 0 ? "" : "Notice period is required.";
    case "experienceYears":
      return value >= 0 ? "" : "Experience is required.";
    case "linkedinProfileUrl":
      if (!value || value.trim() === "") return "";
      if (!linkedinRegex.test(value)) return "Enter a valid LinkedIn URL.";
      return "";
    case "resumeFile":
      if (!value) return "";
      const fileName = value.name.toLowerCase();
      if (!fileName.endsWith(".pdf") && !fileName.endsWith(".docx"))
        return "Only PDF and DOCX files are allowed.";
      if (value.size > 5 * 1024 * 1024)
        return "File must be smaller than 5MB.";
      return "";
    default:
      return "";
  }
};

// ---------- COMPONENT ----------
const ResumeAddEdit: React.FC<ResumeAddEditProps> = ({
  visible,
  onHide,
  selectedResume,
  onSuccess,
  createData,
  loadingOptions,
  existingCandidates
}) => {
  const { accessToken } = useAuth();
  const { member } = useProfileStore();
  const isEditMode = Boolean(selectedResume);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  const [formData, setFormData] = useState<AddEditCandidate>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [submitted, setSubmitted] = useState(false);
  const [resumePasteText, setResumePasteText] = useState("");
  const [clearExistingResume, setClearExistingResume] = useState(false);
  const toast = useRef<Toast>(null);
  const previousCurrentCountryRef = useRef<string | null>(null);
  const previousExpectedCountryRef = useRef<string | null>(null);
  
  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    setSubmitted(false);
    setResumePasteText("");
    setClearExistingResume(false);
  };
  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible]);

  useEffect(() => {
    if (!existingCandidates?.length || isEditMode) {
      setDuplicateError(null);
      return;
    }
  
    const normalizedName = formData.candidateName?.toLowerCase().trim();
    const normalizedEmail = formData.email?.toLowerCase().trim();
    const normalizedPhone = formData.contactNumber?.trim();
  
    const errors: string[] = [];
  
    for (const c of existingCandidates) {
      const nameMatch =
        normalizedName &&
        c.candidateName?.toLowerCase().trim() === normalizedName;
  
      const emailMatch =
        normalizedEmail &&
        c.email?.toLowerCase().trim() === normalizedEmail;
  
      const phoneMatch =
        normalizedPhone &&
        c.contactNumber?.trim() === normalizedPhone;
  
      if (nameMatch && !errors.includes("Candidate name already exists.")) {
        errors.push("Candidate name already exists.");
      }

      if (phoneMatch && !errors.includes("Phone number already exists.")) {
        errors.push("Phone number already exists.");
      }
  
      if (emailMatch && !errors.includes("Email already exists.")) {
        errors.push("Email already exists.");
      }
  
    }
  
    if (errors.length > 0) {
      setDuplicateError(errors.join(" "));
    } else {
      setDuplicateError(null);
    }
  }, [
    formData.candidateName,
    formData.email,
    formData.contactNumber,
    existingCandidates,
    isEditMode,
  ]);

  const recruiterOptions = useMemo(() => {
    if (!createData?.recruiters) return [];
    return createData.recruiters.map(r => ({ 
      label: r.recruiterName, 
      value: r.recruiterId 
    }));
  }, [createData?.recruiters]);
  const jobProfileOptions = useMemo(() => {
  if (!createData?.jobProfiles) return [];

  return createData.jobProfiles.map(jp => ({
    label: `${jp.jobRole} | ${jp.clientName} | ${jp.departmentName} | ${jp.city}, ${jp.country} | ${jp.experienceText ?? "-"}`,
    value: jp.jobProfileRequirementId,
  }));
}, [createData?.jobProfiles]);

  const vendorOptions = useMemo(() => {
  if (!createData?.vendors) return [];

  return createData.vendors.map(v => ({
    label: v.vendorName,
    value: v.vendorId
  }));
}, [createData?.vendors]);


  // Group locations by country
  const locationsByCountry = useMemo(() => {
    if (!createData?.locations) return {};
    
    const grouped: Record<string, typeof createData.locations> = {};
    createData.locations.forEach(loc => {
      if (!grouped[loc.country]) {
        grouped[loc.country] = [];
      }
      grouped[loc.country].push(loc);
    });
    return grouped;
  }, [createData?.locations]);

  const countryOptions = useMemo(() => {
    return Object.keys(locationsByCountry).map(country => ({
      label: country,
      value: country
    }));
  }, [locationsByCountry]);

  const cityOptions = useMemo(() => {
    const country = formData.expectedLocation?.country;
    if (!country || !locationsByCountry[country]) return [];
    
    return locationsByCountry[country].map(loc => ({
      label: loc.city,
      value: loc.locationId
    }));
  }, [formData.expectedLocation?.country, locationsByCountry]);

  const currentCityOptions = useMemo(() => {
  const country = formData.currentLocation?.country;
  if (!country || !locationsByCountry[country]) return [];

  return locationsByCountry[country].map(loc => ({
    label: loc.city,
    value: loc.locationId,
  }));
}, [formData.currentLocation?.country, locationsByCountry]);

const currencyOptions = useMemo(() => {
  if (!createData?.currencies) return [];
  return createData.currencies.map(c => ({
    label: c.currencyName,
    value: c.currencyId,
  }));
}, [createData?.currencies]);

const ctcTypeOptions = useMemo(() => {
  if (!createData?.compensationTypes) return [];
  return createData.compensationTypes.map((t) => ({
    label: t.compensationTypeName,
    value: t.compensationTypeId,
  }));
}, [createData?.compensationTypes]);
 
const workModeOptions = useMemo(() => {
  if (!createData?.workModes) return [];

  return createData.workModes.map((w) => ({
    label: w.workMode,
    value: w.workModeId,
  }));
}, [createData?.workModes]);

useEffect(() => {
  if (!createData?.currencies || !createData?.compensationTypes) return;

  const currentCountry = formData.currentLocation?.country?.trim().toLowerCase() || null;
  const expectedCountry = formData.expectedLocation?.country?.trim().toLowerCase() || null;

  const currentCountryChanged = previousCurrentCountryRef.current !== currentCountry;
  const expectedCountryChanged = previousExpectedCountryRef.current !== expectedCountry;

  if (!currentCountryChanged && !expectedCountryChanged) return;

  const inrCurrencyId = createData.currencies.find(c => c.currencyName === "INR")?.currencyId;
  const usdCurrencyId = createData.currencies.find(c => c.currencyName === "USD")?.currencyId;
  const annualTypeId = createData.compensationTypes.find(t => t.compensationTypeName === "Annual")?.compensationTypeId;
  const hourlyTypeId = createData.compensationTypes.find(t => t.compensationTypeName === "Hourly")?.compensationTypeId;

  setFormData((prev) => {
    const updates: Partial<AddEditCandidate> = {};

    if (currentCountryChanged && prev.currentCTCAmount != null) {
      if (currentCountry === "india") {
        if (inrCurrencyId != null && prev.currentCTCCurrencyId !== inrCurrencyId) {
          updates.currentCTCCurrencyId = inrCurrencyId;
        }
        if (annualTypeId != null && prev.currentCTCTypeId !== annualTypeId) {
          updates.currentCTCTypeId = annualTypeId;
        }
      } else if (currentCountry === "united states" || currentCountry === "us" || currentCountry === "usa") {
        if (usdCurrencyId != null && prev.currentCTCCurrencyId !== usdCurrencyId) {
          updates.currentCTCCurrencyId = usdCurrencyId;
        }
        if (hourlyTypeId != null && prev.currentCTCTypeId !== hourlyTypeId) {
          updates.currentCTCTypeId = hourlyTypeId;
        }
      }
    }

    if (expectedCountryChanged && prev.expectedCTCAmount != null) {
      if (expectedCountry === "india") {
        if (inrCurrencyId != null && prev.expectedCTCCurrencyId !== inrCurrencyId) {
          updates.expectedCTCCurrencyId = inrCurrencyId;
        }
        if (annualTypeId != null && prev.expectedCTCTypeId !== annualTypeId) {
          updates.expectedCTCTypeId = annualTypeId;
        }
      } else if (expectedCountry === "united states" || expectedCountry === "us" || expectedCountry === "usa") {
        if (usdCurrencyId != null && prev.expectedCTCCurrencyId !== usdCurrencyId) {
          updates.expectedCTCCurrencyId = usdCurrencyId;
        }
        if (hourlyTypeId != null && prev.expectedCTCTypeId !== hourlyTypeId) {
          updates.expectedCTCTypeId = hourlyTypeId;
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return prev;
    }

    return {
      ...prev,
      ...updates
    };
  });

  previousCurrentCountryRef.current = currentCountry;
  previousExpectedCountryRef.current = expectedCountry;
}, [
  formData.currentLocation?.country,
  formData.expectedLocation?.country,
  createData?.currencies,
  createData?.compensationTypes
]);



  // Initialize / Reset form
  useEffect(() => {
  const loadCandidateForEdit = async () => {
    if (!isEditMode || !selectedResume || !accessToken) return;

    try {
      const freshCandidate = await getCandidateById(
        accessToken,
        selectedResume.candidateId
      );

      setFormData({
        candidateName: freshCandidate.candidateName,
        contactNumber: freshCandidate.contactNumber ?? undefined,
        email: freshCandidate.email ?? undefined,
        recruiterId: freshCandidate.recruiterId,
        recruiterName: freshCandidate.recruiterName,
        vendorId: freshCandidate.vendorId ?? null,
        referredBy: freshCandidate.referredBy ?? undefined,
        jobProfileRequirementId: freshCandidate.jobProfileRequirementId,
        expectedLocation: freshCandidate.expectedLocation,
        currentLocation: freshCandidate.currentLocation ?? null,
        //   currentCTC: freshCandidate.currentCTC ?? undefined,
        // expectedCTC: freshCandidate.expectedCTC ?? undefined,
        currentCTCAmount: freshCandidate.currentCTCAmount ?? null,
        currentCTCCurrencyId: freshCandidate.currentCTCCurrencyId ?? null,
        currentCTCTypeId: freshCandidate.currentCTCTypeId ?? null,
        expectedCTCAmount: freshCandidate.expectedCTCAmount ?? null,
        expectedCTCCurrencyId: freshCandidate.expectedCTCCurrencyId ?? null,
        expectedCTCTypeId: freshCandidate.expectedCTCTypeId ?? null,
        noticePeriod: freshCandidate.noticePeriod,
        experienceYears: freshCandidate.experienceYears,
        linkedinProfileUrl: freshCandidate.linkedinProfileUrl ?? undefined,
        resumeFile: null, // never prefill file
        notes: freshCandidate.notes ?? undefined,
        workMode: freshCandidate.workMode ?? null,
        workModeId: freshCandidate.workModeId ?? null,
      });
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load candidate details",
      });
    }
  };

  if (visible) {
    if (isEditMode) {
      loadCandidateForEdit();
    } else {
      setFormData(INITIAL_FORM);
    }
    setErrors({});
    setSubmitted(false);
  }
}, [visible, isEditMode, selectedResume, accessToken]);

  useEffect(() => {
  if (!visible) return;

  // NEVER run this in edit mode
  if (isEditMode) return;

  if (!member) return;
  if (!createData?.recruiters?.length) return;
  if (formData.recruiterId) return;

  const recruiter = createData.recruiters.find(
    r => r.recruiterId === member.memberId
  );

  if (recruiter) {
    setFormData(prev => ({
      ...prev,
      recruiterId: recruiter.recruiterId,
      recruiterName: recruiter.recruiterName
    }));
  }
}, [visible, isEditMode, member, createData?.recruiters, formData.recruiterId]);


  const handleChange = useCallback(
  (field: keyof AddEditCandidate, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  },
  [errors]
);

const parseAndAutofill = (text: string) => {
  if (!text.trim()) return;

  const updatedData: Partial<AddEditCandidate> = {};

  // Full Name
  const nameMatch = text.match(/full\s*name[:\-]?\s*(.+)/i);
  if (nameMatch) updatedData.candidateName = nameMatch[1].trim();

  // Contact Number
  const phoneMatch = text.match(/contact\s*number[:\-]?\s*(.+)/i);
  if (phoneMatch) updatedData.contactNumber = phoneMatch[1].trim();

  // Email
  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  if (emailMatch) updatedData.email = emailMatch[0];

  // LinkedIn
  const linkedinMatch = text.match(/https?:\/\/(www\.)?linkedin\.com\/[^\s]+/i);
  if (linkedinMatch) updatedData.linkedinProfileUrl = linkedinMatch[0];

  // Experience
  const expMatch = text.match(/experience[:\-]?\s*(\d+(\.\d+)?)/i);
  if (expMatch) updatedData.experienceYears = parseFloat(expMatch[1]);

  // Current CTC
  const currentCTCMatch = text.match(/current\s*ctc[:\-]?\s*(\d+(\.\d+)?)/i);
  if (currentCTCMatch) {
    updatedData.currentCTCAmount = parseFloat(currentCTCMatch[1]);
  }

  // Expected CTC
  const expectedCTCMatch = text.match(/expected\s*ctc[:\-]?\s*(\d+(\.\d+)?)/i);
  if (expectedCTCMatch) {
    updatedData.expectedCTCAmount = parseFloat(expectedCTCMatch[1]);
  }

  // Notice Period
  const noticeMatch = text.match(/notice\s*period[:\-]?\s*(\d+)/i);
  if (noticeMatch) updatedData.noticePeriod = parseInt(noticeMatch[1]);

  // Current Location
  // const currentLocMatch = text.match(/current\s*location[:\-]?\s*(.+),\s*(.+)/i);
  // if (currentLocMatch) {
  //   updatedData.currentLocation = {
  //     city: currentLocMatch[1].trim(),
  //     country: currentLocMatch[2].trim(),
  //   };
  // }
  // Current Location
  const currentLocMatch = text.match(/current\s*location[:\-]?\s*(.+),\s*(.+)/i);
    if (currentLocMatch && createData?.locations) {
      const city = currentLocMatch[1].trim();
      const country = currentLocMatch[2].trim();

      const matchedLocation = createData.locations.find(
        loc =>
          loc.city.toLowerCase() === city.toLowerCase() &&
          loc.country.toLowerCase() === country.toLowerCase()
      );

      if (matchedLocation) {
        updatedData.currentLocation = {
          city: matchedLocation.city,
          country: matchedLocation.country,
        };
    }
  }

  // Preferred Location
  const preferredLocMatch = text.match(/preferred\s*location[:\-]?\s*(.+),\s*(.+)/i);

  if (preferredLocMatch && createData?.locations) {
    const city = preferredLocMatch[1].trim();
    const country = preferredLocMatch[2].trim();

    const matchedLocation = createData.locations.find(
      loc =>
        loc.city.toLowerCase() === city.toLowerCase() &&
        loc.country.toLowerCase() === country.toLowerCase()
    );

    if (matchedLocation) {
      updatedData.expectedLocation = {
        city: matchedLocation.city,
        country: matchedLocation.country,
      };
    }
  }
    // const preferredLocMatch = text.match(/preferred\s*location[:\-]?\s*(.+),\s*(.+)/i);
    // if (preferredLocMatch) {
    //   updatedData.expectedLocation = {
    //     city: preferredLocMatch[1].trim(),
    //     country: preferredLocMatch[2].trim(),
    //   };
    // }

    setFormData(prev => ({
      ...prev,
      ...updatedData
    }));

    toast.current?.show({
      severity: "success",
      summary: "Auto-filled",
      detail: "Fields detected from pasted text",
      life: 1500,
    });
};

  const handleFileParse = async (file: File) => {
    const isPdf = file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) return;

    try {
      const text = await extractPdfText(file);
      setResumePasteText(text);
      parseAndAutofill(text);
    } catch {
      toast.current?.show({
        severity: "warn",
        summary: "Parse failed",
        detail: "Could not extract text from PDF",
        life: 2500,
      });
    }
  };

  const handleBlur = useCallback(
    (field: keyof AddEditCandidate) => {
      // Optional: validate on blur if needed
    },
    []
  );

  const handleBackendErrors = (error: any) => {
  // Case 1: backend validationErrors array (current backend)
  if (Array.isArray(error?.details?.validationErrors)) {
    const fieldErrors: Record<string, string> = {};

    error.details.validationErrors.forEach((err: any) => {
      if (err.field && err.message) {
        fieldErrors[err.field] = err.message;
      }
    });

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
  }

  // Case 2: single-field backend error (future-proof)
  if (error?.details?.field && error?.message) {
    setErrors({
      [error.details.field]: error.message,
    });
    return;
  }

  // Case 3: already-normalized error object
  if (error?.details?.errors) {
    setErrors(error.details.errors);
    return;
  }

  // Case 4: fallback (non-validation error)
  toast.current?.show({
    severity: "error",
    summary: "Error",
    detail: error?.message || "Something went wrong",
    life: 2000,
  });
};


  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    (Object.keys(formData) as (keyof AddEditCandidate)[]).forEach((key) => {
      const errorMsg = validateField(key, formData[key], formData);
      if (errorMsg) newErrors[key] = errorMsg;
    });

    const hasCurrentAmount = formData.currentCTCAmount !== null && formData.currentCTCAmount !== undefined;
    const hasCurrentCurrency = formData.currentCTCCurrencyId !== null && formData.currentCTCCurrencyId !== undefined;
    const hasCurrentType = formData.currentCTCTypeId !== null && formData.currentCTCTypeId !== undefined;
    const hasAnyCurrent = hasCurrentAmount || hasCurrentCurrency || hasCurrentType;

    if (hasAnyCurrent) {
      if (!hasCurrentAmount) {
        newErrors.currentCTCAmount = "Current CTC Amount is required when currency and type are selected.";
      }
      if (hasCurrentAmount && !hasCurrentCurrency) {
        newErrors.currentCTCCurrencyId = "Currency is required when Current CTC amount is provided.";
      }
      if (hasCurrentAmount && !hasCurrentType) {
        newErrors.currentCTCTypeId = "CTC Type is required when Current CTC amount is provided.";
      }
    }

    const hasExpectedAmount = formData.expectedCTCAmount !== null && formData.expectedCTCAmount !== undefined;
    const hasExpectedCurrency = formData.expectedCTCCurrencyId !== null && formData.expectedCTCCurrencyId !== undefined;
    const hasExpectedType = formData.expectedCTCTypeId !== null && formData.expectedCTCTypeId !== undefined;
    const hasAnyExpected = hasExpectedAmount || hasExpectedCurrency || hasExpectedType;

    if (hasAnyExpected) {
      if (!hasExpectedAmount) {
        newErrors.expectedCTCAmount = "Expected CTC Amount is required when currency and type are selected.";
      }
      if (hasExpectedAmount && !hasExpectedCurrency) {
        newErrors.expectedCTCCurrencyId = "Currency is required when Expected CTC amount is provided.";
      }
      if (hasExpectedAmount && !hasExpectedType) {
        newErrors.expectedCTCTypeId = "CTC Type is required when Expected CTC amount is provided.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

 
  const handleSave = useCallback(async () => {
   
    setSubmitted(true);
    
    if (!validateForm()) {
      return; 
    }

    try {
      if (isEditMode && selectedResume) {
  const payload: AddEditCandidateApiPayload = {
    candidateName: formData.candidateName,
    contactNumber: formData.contactNumber?.trim() || null,
    email: formData.email?.trim() || null,
    recruiterId: formData.recruiterId,
    recruiterName: formData.recruiterName,
    vendorId: formData.vendorId ?? null,
    referredBy: formData.referredBy?.trim() || null,
    jobProfileRequirementId: formData.jobProfileRequirementId,
    expectedLocation: formData.expectedLocation,
    currentLocation: formData.currentLocation ?? null,
    // currentCTC: formData.currentCTC ?? null,
    // expectedCTC: formData.expectedCTC ?? null,
    workMode: formData.workMode ?? null,
    workModeId: formData.workModeId ?? null,
    currentCTCAmount: formData.currentCTCAmount ?? null,
    currentCTCCurrencyId: formData.currentCTCCurrencyId ?? null,
    currentCTCTypeId: formData.currentCTCTypeId ?? null,
    expectedCTCAmount: formData.expectedCTCAmount ?? null,
    expectedCTCCurrencyId: formData.expectedCTCCurrencyId ?? null,
    expectedCTCTypeId: formData.expectedCTCTypeId ?? null,
    noticePeriod: formData.noticePeriod,
    experienceYears: formData.experienceYears,
    linkedinProfileUrl: formData.linkedinProfileUrl?.trim() || null,
    notes: formData.notes?.trim() || null,
  };
  console.log("Payload to create:", payload);
  await updateCandidate(
    accessToken,
    selectedResume.candidateId,
    payload
  );

  if (formData.resumeFile) {
    await uploadResume(
      accessToken,
      selectedResume.candidateId,
      formData.resumeFile
    );
  }

  toast.current?.show({
    severity: "success",
    summary: "Success",
    detail: "Candidate updated successfully!",
    life: 3000,
  });
}
else {
        await createCandidate(accessToken, formData);
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Candidate added successfully!",
          life: 3000,
        });
      }

      onSuccess();
      onHide();
    } catch (err: any) {
      console.error("Error saving candidate:", err);
      handleBackendErrors(err);
    }
  }, [
    formData,
    isEditMode,
    onHide,
    onSuccess,
    selectedResume,
    validateForm,
    accessToken,
  ]);

  const shouldShowError = (field: string): string | undefined =>
    submitted ? errors[field] : undefined;

  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <DialogButton label="Cancel" severity="secondary" onClick={onHide} />
      <DialogButton
        label={isEditMode ? "Update Candidate" : "Add Candidate"}
        severity="success"
        icon={<FaCheck className="mr-2" />}
        onClick={handleSave}
      />
    </div>
  );
  const jobProfileOptionTemplate = (option: any) => {
  if (!option) return null;

  const parts = option.label.split(" | ");

  const role = parts[0] || "";
  const client = parts[1] || "";
  const department = parts[2] || "";
  const location = parts[3] || "";
  const experience = parts[4] || "";

  return (
    <div className="flex flex-column gap-1 py-1">
      {/* Primary Line: Role + Client */}
      <div className="flex align-items-center gap-2">
        <span className="font-semibold text-900">
          {role}
        </span>

        {client && (
          <span className="text-sm text-600">
            @ {client}
          </span>
        )}
      </div>

      {/* Secondary Line: Meta Info */}
      <div className="flex flex-wrap gap-3 text-xs text-500">
        {department && <span>Dept: {department}</span>}
        {location && <span>Loc: {location}</span>}
        {experience && <span>Exp: {experience}</span>}
      </div>
    </div>
  );
};

  const existingResumeName = selectedResume?.resumeOriginalName;
  const existingResumeDate = selectedResume?.resumeUploadDate;

  const existingResumeType =
    existingResumeName?.split(".").pop()?.toUpperCase() || "";

  const formattedExistingResumeDate = existingResumeDate
    ? (() => {
        const [year, month, day] = existingResumeDate.split(" ")[0].split("-");
        return `${Number(day)}/${Number(month)}/${year}`;
      })()
    : "";

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        header={isEditMode ? "Edit Resume" : "Add New Resume"}
        onHide={onHide}
        footer={dialogFooter}
        style={{ width: "1200px", maxHeight: "90vh" }}
        modal
        className="p-fluid"
      >
      <div className="field col-12 mb-4">
          <label className="font-bold">
            Candidate Details for Auto-fill Form (Optional)
          </label>

          <textarea
            value={resumePasteText}
            onChange={(e) => setResumePasteText(e.target.value)}
            onPaste={(e) => {
              const pastedText = e.clipboardData.getData("text");
              setResumePasteText(pastedText);
              parseAndAutofill(pastedText);
            }}
            placeholder="Paste resume text here..."
            style={{
              width: "100%",
              minHeight: "120px",
              padding: "0.75rem",
              borderRadius: "6px",
              border: "1px solid #cbd5e1"
            }}
          />
        </div>
        {duplicateError && (
        <div
        style={{
        backgroundColor: "#fff3cd",
        border: "1px solid #ffeeba",
        padding: "10px",
        marginBottom: "15px",
        borderRadius: "4px",
        color: "#856404",
        fontWeight: 500,
        display: "inline-block",
    }}
  >
    ⚠ {duplicateError}
  </div>
)}
        <div className="formgrid grid">
          {/* Column 1 */}
          <InputField
            id="candidateName"
            label="Candidate Name"
            value={formData.candidateName}
            onChange={(e) => handleChange("candidateName", e.target.value)}
            onBlur={() => handleBlur("candidateName")}
            error={shouldShowError("candidateName")}
            colSize="col-12 md:col-4"
          />

          <div className="field col-12 md:col-4">
            <label htmlFor="contactNumber" className="font-bold">Contact Number</label>
            <PhoneInputField
              id="contactNumber"
              value={formData.contactNumber || ""}
              onChange={(val) => handleChange("contactNumber", val)}
              error={shouldShowError("contactNumber")}
            />
          </div>

          <InputField
            id="email"
            label="Email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            error={shouldShowError("email")}
            colSize="col-12 md:col-4"
            required={false}
          />

          <DropdownField
            id="jobProfileRequirementId"
            label="Job Profile"
            value={formData.jobProfileRequirementId}
            options={jobProfileOptions}
            onChange={(e: { value: number }) =>
              handleChange("jobProfileRequirementId", e.value)
            }
            onBlur={() => handleBlur("jobProfileRequirementId")}
            error={shouldShowError("jobProfileRequirementId")}
            disabled={loadingOptions}
            placeholder="Select Job Profile"
            colSize="col-12 md:col-4"
            itemTemplate={jobProfileOptionTemplate}   // ✅ ADD
          />

          <DropdownField
            id="vendorId"
            label="Vendor"
            value={formData.vendorId}
            options={vendorOptions}
            showClear
            onChange={(e: { value: number }) =>
              handleChange("vendorId", e.value)
            }
            onBlur={() => handleBlur("vendorId")}
            error={shouldShowError("vendorId")}
            disabled={loadingOptions}
            placeholder="Select Vendor"
            colSize="col-12 md:col-4"
            required={false}
          />

          <InputField
            id="referredBy"
            label="Referred By"
            value={formData.referredBy}
            onChange={(e) =>
              handleChange("referredBy", e.target.value)
            }
            onBlur={() => handleBlur("referredBy")}
            error={shouldShowError("referredBy")}
            colSize="col-12 md:col-4"
            required={false}
          />


          <InputNumberField
            id="experienceYears"
            label="Experience (Years)"
            value={formData.experienceYears}
            onChange={(val: number | null) => handleChange("experienceYears", val)}
            onBlur={() => handleBlur("experienceYears")}
            error={shouldShowError("experienceYears")}
            colSize="col-12 md:col-4"
            allowDecimal
          />

          {/* Column 2 */}
          <DropdownField
            id="recruiterId"
            label="Recruiter"
            value={formData.recruiterId}
            options={recruiterOptions}
            onChange={(e: { value: number }) => {
              const recruiter = createData?.recruiters.find(r => r.recruiterId === e.value);
              handleChange("recruiterId", e.value);
              handleChange("recruiterName", recruiter?.recruiterName || null);
            }}
            onBlur={() => handleBlur("recruiterName")}
            error={shouldShowError("recruiterName")}
            disabled={loadingOptions}
            placeholder={loadingOptions ? "Loading..." : "Select Recruiter"}
            colSize="col-12 md:col-4"
          />
          <DropdownField
            id="workModeId"
            label="Mode of Work"
            value={formData.workModeId}
            options={workModeOptions}
            onChange={(e: { value: number }) => {
              const mode = createData?.workModes?.find(
                (m) => m.workModeId === e.value
              );
              handleChange("workModeId", e.value);
              handleChange("workMode", mode?.workMode || null);
            }}
            onBlur={() => handleBlur("workModeId")}
            error={shouldShowError("workModeId")}
            disabled={loadingOptions}
            placeholder="Select Mode of Work"
            colSize="col-12 md:col-4"
          />
          <div className="col-12">
            <div className="font-bold mb-2">
              Current Working Location
            </div>
            <div className="formgrid grid">
              <div className="field col-12 md:col-4">
                {/* <label className="font-bold">Country</label> */}
                <Dropdown
                  value={formData.currentLocation?.country || null}
                  options={countryOptions}
                  showClear
                  onChange={(e) =>
                    handleChange(
                      "currentLocation",
                      e.value ? { country: e.value, city: "" } : null
                    )
                  }
                  placeholder="Select Country"
                  className={shouldShowError("currentLocation") ? "p-invalid" : ""}
                />
              </div>

              <div className="field col-12 md:col-4">
                {/* <label className="font-bold">City</label> */}
                <Dropdown
                  value={
                    formData.currentLocation?.city && createData?.locations
                      ? createData.locations.find(
                          loc =>
                            loc.city === formData.currentLocation?.city &&
                            loc.country === formData.currentLocation?.country
                        )?.locationId
                      : null
                  }
                  options={currentCityOptions}
                  showClear
                  onChange={(e) => {
                    if (!e.value) {
                      handleChange("currentLocation", null);
                      return;
                    }
                    const location = createData?.locations.find(
                      loc => loc.locationId === e.value
                    );
                    if (location) {
                      handleChange("currentLocation", {
                        country: location.country,
                        city: location.city,
                      });
                    }
                  }}
                  disabled={
                    !formData.currentLocation?.country ||
                    currentCityOptions.length === 0
                  }
                  placeholder="Select City"
                  className={shouldShowError("currentLocation") ? "p-invalid" : ""}
                />
                {shouldShowError("currentLocation") && (
                  <small className="p-error">{shouldShowError("currentLocation")}</small>
                )}
              </div>
            </div>
          </div>

          {/* ---------- Expected Working Location ---------- */}
          <div className="col-12">
          <div className="font-bold mb-2">
            Expected Working Location <span className="text-red-500">*</span>
          </div>

          <div className="formgrid grid">
            <div className="field col-12 md:col-4">
              {/* <label className="font-bold">Country</label> */}
              <Dropdown
                value={formData.expectedLocation?.country || null}
                options={countryOptions}
                showClear
                onChange={(e) =>
                  handleChange(
                    "expectedLocation",
                    e.value
                      ? { country: e.value, city: "" }
                      : { country: "", city: "" }
                  )
                }
                placeholder="Select Country"
                disabled={loadingOptions}
                className={shouldShowError("expectedLocation") ? "p-invalid" : ""}
              />
            </div>

            <div className="field col-12 md:col-4">
              {/* <label className="font-bold">City</label> */}
              <Dropdown
                value={
                  formData.expectedLocation?.city && createData?.locations
                    ? createData.locations.find(
                        loc =>
                          loc.city === formData.expectedLocation?.city &&
                          loc.country === formData.expectedLocation?.country
                      )?.locationId
                    : null
                }
                options={cityOptions}
                showClear
                onChange={(e: { value: number }) => {
                  const location = createData?.locations.find(
                    loc => loc.locationId === e.value
                  );
                  if (location) {
                    handleChange("expectedLocation", {
                      country: location.country,
                      city: location.city,
                    });
                  }
                }}
                disabled={
                  !formData.expectedLocation?.country ||
                  cityOptions.length === 0 ||
                  loadingOptions
                }
                placeholder="Select City"
                className={shouldShowError("expectedLocation") ? "p-invalid" : ""}
              />

              {formData.expectedLocation?.country && cityOptions.length === 0 && (
                <small className="text-muted">
                  No cities available for selected country
                </small>
              )}

              {shouldShowError("expectedLocation") && (
                <small className="p-error">
                  {shouldShowError("expectedLocation")}
                </small>
              )}
            </div>
          </div>
        </div>


          <InputNumberField
            id="noticePeriod"
            label="Notice Period (Days)"
            value={formData.noticePeriod}
            onChange={(val: number | null) => handleChange("noticePeriod", val)}
            onBlur={() => handleBlur("noticePeriod")}
            error={shouldShowError("noticePeriod")}
            colSize="col-12 md:col-4"
            allowDecimal={false}
          />
          <div className="col-12">
          <div className="formgrid grid">
          <InputNumberField
          id="currentCTCAmount"
          label="Current CTC Amount"
          value={formData.currentCTCAmount}
          onChange={(val: number | null) => handleChange("currentCTCAmount", val)}
          onBlur={() => handleBlur("currentCTCAmount")}
          error={shouldShowError("currentCTCAmount")}
          colSize="col-12 md:col-4"
          required={false}
          allowDecimal
          />

          <DropdownField
          id="currentCTCCurrencyId"
          label=" Current Currency"
          value={formData.currentCTCCurrencyId}
          options={currencyOptions}
          onChange={(e) => handleChange("currentCTCCurrencyId", e.value)}
          onBlur={() => handleBlur("currentCTCCurrencyId")}
          placeholder="Select Currency"
          error={shouldShowError("currentCTCCurrencyId")}
          showClear
          required={false}
          colSize="col-12 md:col-4"
          />

          <DropdownField
            id="currentCTCTypeId"
            label=" Current CTC Type"
            value={formData.currentCTCTypeId}
            options={ctcTypeOptions}
            onChange={(e) => handleChange("currentCTCTypeId", e.value)}
            onBlur={() => handleBlur("currentCTCTypeId")}
            placeholder="Select CTC Type"
            error={shouldShowError("currentCTCTypeId")}
            showClear
            required={false}
            colSize="col-12 md:col-4"
          />
           {/* Column 3 - Expected CTC */}        
          <InputNumberField
            id="expectedCTCAmount"
            label="Expected CTC Amount"
            value={formData.expectedCTCAmount}
            onChange={(val: number | null) => handleChange("expectedCTCAmount", val)}
            onBlur={() => handleBlur("expectedCTCAmount")}
            error={shouldShowError("expectedCTCAmount")}
            colSize="col-12 md:col-4"
            required={false}
            allowDecimal
          />

          <DropdownField
          id="expectedCTCCurrencyId"
          label=" Expected Currency"
          value={formData.expectedCTCCurrencyId}
          options={currencyOptions}  // same options as current CTC
          onChange={(e) => handleChange("expectedCTCCurrencyId", e.value)}
          onBlur={() => handleBlur("expectedCTCCurrencyId")}
          placeholder="Select Currency"
          error={shouldShowError("expectedCTCCurrencyId")}
          showClear
          required={false}
          colSize="col-12 md:col-4"
          />

        <DropdownField
        id="expectedCTCTypeId"
        label=" Expected CTC Type"
        value={formData.expectedCTCTypeId}
        options={ctcTypeOptions}  // same options as current CTC type
        onChange={(e) => handleChange("expectedCTCTypeId", e.value)}
        onBlur={() => handleBlur("expectedCTCTypeId")}
        placeholder="Select CTC Type"
        error={shouldShowError("expectedCTCTypeId")}
        showClear
        required={false}
        colSize="col-12 md:col-4"
        />
        </div>
        </div>
          <InputField
            id="linkedinProfileUrl"
            label="LinkedIn URL"
            value={formData.linkedinProfileUrl || ""}
            onChange={(e) =>
              handleChange("linkedinProfileUrl", e.target.value || undefined)
            }
            onBlur={() => handleBlur("linkedinProfileUrl")}
            placeholder="https://www.linkedin.com/in/..."
            error={shouldShowError("linkedinProfileUrl")}
            required={false}
            colSize="col-12 md:col-6"
          />
          <InputField
            id="notes"
            label="Notes"
            value={formData.notes || ""}
            onChange={(e) => handleChange("notes", e.target.value)}
            onBlur={() => handleBlur("notes")}
            error={shouldShowError("notes")}
            required={false}
            colSize="col-12"
          />
          {/* Full Width Bottom Section */}
          <div className="field col-12">
            <label className="font-bold">
              Upload Resume (PDF / DOCX)
            </label>

            <div
              onDragOver={(e) => {
                if (formData.resumeFile) return;
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                if (formData.resumeFile) return;
                e.preventDefault();
                e.stopPropagation();

                const file = e.dataTransfer.files?.[0];
                if (file) {
                  handleChange("resumeFile", file);
                  handleFileParse(file);
                }
              }}
              style={{
                border: "2px dashed #cbd5e1",
                borderRadius: "8px",
                padding: "1rem",
                textAlign: "center",
                background: "#f8fafc",
                opacity: formData.resumeFile ? 0.95 : 1
              }}
            >

              {/* CASE A: No file */}
              {!formData.resumeFile && !(isEditMode && existingResumeName && !clearExistingResume) && (
                <>
                  <p style={{ marginBottom: "0.75rem", color: "#475569", fontSize: "0.875rem" }}>
                    Drag & drop resume here or browse files
                  </p>

                  <FileUpload
                    mode="basic"
                    name="resume"
                    accept=".pdf,.docx"
                    maxFileSize={5 * 1024 * 1024}
                    auto={false}
                    customUpload
                    uploadHandler={() => {}}
                    chooseLabel="Browse Files"
                    chooseOptions={{
                      label: "Browse Files",
                      className: "p-button-secondary p-button-sm",
                    }}
                    onSelect={(e) => {
                      const selectedFile = e.files?.[0];
                      if (selectedFile) {
                        handleChange("resumeFile", selectedFile);
                        handleFileParse(selectedFile);
                      }
                    }}
                  />
                </>
              )}

              {/* CASE B: File selected */}
              {(formData.resumeFile || (isEditMode && existingResumeName && !clearExistingResume)) && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1rem",
                    background: "#f0fdf4",
                    border: "1px solid #86efac",
                    borderRadius: "6px",
                    padding: "0.75rem 1rem"
                  }}
                >
                  <div style={{ textAlign: "left" }}>
                    <strong style={{ color: "#0f172a" }}>
                      {formData.resumeFile?.name || existingResumeName}
                    </strong>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      {formData.resumeFile
                        ? `${(formData.resumeFile.size / 1024 / 1024).toFixed(2)} MB`
                        : `${existingResumeType} file`}
                    </div>
                    {!formData.resumeFile && existingResumeDate && (
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        Uploaded on: {formattedExistingResumeDate}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      handleChange("resumeFile", null);
                      setClearExistingResume(true);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#fee2e2",
                      border: "1px solid #fecaca",
                      borderRadius: "999px",
                      width: "36px",
                      height: "36px",
                      cursor: "pointer"
                    }}
                    title="Remove file"
                  >
                    <FaTimes style={{ color: "#b91c1c", fontSize: "16px" }} />
                  </button>
                </div>
              )}
            </div>

            <small className="text-muted block mt-1">
              Supported formats: PDF, DOCX (max 5MB)
            </small>

            {shouldShowError("resumeFile") && (
              <small className="p-error">{shouldShowError("resumeFile")}</small>
            )}
          </div>
          
        </div>
      </Dialog>
    </>
  );
};

// ---------- REUSABLE FIELD COMPONENTS ----------
interface InputFieldProps {
  id: string;
  label: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  colSize?: string;
}

const InputField = ({ id, label, value, onChange, onBlur, placeholder, error, required = true, colSize = "col-12 md:col-6" }: InputFieldProps) => (
  <div className={`field ${colSize}`}>
    <label htmlFor={id} className="font-bold">
      {label} {required && "*"}
    </label>
    <InputText 
      id={id}
      value={value ?? ""}
      onChange={onChange} 
      onBlur={onBlur} 
      placeholder={placeholder} 
      className={error ? "p-invalid" : ""} 
    />
    {error && <small className="p-error">{error}</small>}
  </div>
);

const DropdownField = ({ 
  id, 
  label, 
  value, 
  options, 
  onChange, 
  onBlur, 
  placeholder, 
  error,
  disabled = false,
  required = true,
  colSize = "col-12 md:col-6",
  itemTemplate,
  showClear = false
}: DropdownFieldProps) => (
  <div className={`field ${colSize}`}>
    <label htmlFor={id} className="font-bold">{label} {required && "*"}</label>
    <Dropdown 
      id={id}
      value={value} 
      options={options} 
      onChange={onChange} 
      onBlur={onBlur} 
      placeholder={placeholder}
      disabled={disabled}
      itemTemplate={itemTemplate}
      showClear={showClear}
      className={error ? "p-invalid" : ""} 
    />
    {error && <small className="p-error">{error}</small>}
  </div>
);

interface InputNumberFieldProps {
  id: string;
  label: string;
  value?: number | null;
  onChange: (val: number | null) => void;
  onBlur: () => void;
  prefix?: string;
  error?: string;
  colSize?: string;
  required?: boolean;
  allowDecimal?: boolean;
}

const InputNumberField = ({ id, label, value, onChange, onBlur, prefix, error, required=true, colSize = "col-12 md:col-6", allowDecimal = true, }: InputNumberFieldProps) => (
  <div className={`field ${colSize}`}>
    <label htmlFor={id} className="font-bold">{label} {required && "*"}</label>
    <InputNumber
      id={id}
      value={value ?? null}
      onValueChange={(e) => onChange(e.value ?? null)}
      onBlur={onBlur}
      mode="decimal"
      minFractionDigits={allowDecimal ? 1 : 0}
      maxFractionDigits={allowDecimal ? 2 : 0}
      useGrouping={false}
      prefix={prefix}
      className={error ? "p-invalid" : ""}
    />
    {error && <small className="p-error">{error}</small>}
  </div>
);

export default ResumeAddEdit;
