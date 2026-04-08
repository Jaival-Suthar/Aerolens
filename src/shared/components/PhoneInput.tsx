import React from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export type PhoneInputFieldProps = {
  /** E.164 value including leading + */
  value: string;
  onChange: (e164: string) => void;
  disabled?: boolean;
  /** Shown under the field (API validation) */
  error?: string | null;
  id?: string;
  className?: string;
};

/**
 * All countries; default flag/dial India. User can change country and dial code.
 * Emits full E.164 on change (e.g. +919876543210).
 */
const PhoneInputField: React.FC<PhoneInputFieldProps> = ({
  value,
  onChange,
  disabled = false,
  error,
  id,
  className = "",
}) => {
  const digits = value.startsWith("+") ? value.slice(1) : value.replace(/\D/g, "");

  return (
    <div className={className} style={{ width: "100%" }}>
      <PhoneInput
        inputProps={{
          id,
          name: "phone",
          required: false,
          "aria-invalid": error ? true : undefined,
          "aria-describedby": error ? `${id ?? "phone"}-error` : undefined,
        }}
        country="in"
        value={digits}
        disabled={disabled}
        onChange={(val) => {
          const next = val && String(val).replace(/\D/g, "") ? `+${val}` : "";
          onChange(next);
        }}
        containerClass="phone-input-container w-full"
        inputClass={error ? "p-invalid w-full" : "w-full"}
        inputStyle={{ width: "100%" }}
        enableSearch
        countryCodeEditable
      />
      {error ? (
        <small id={`${id ?? "phone"}-error`} className="p-error block mt-1">
          {error}
        </small>
      ) : null}
    </div>
  );
};

export default PhoneInputField;
