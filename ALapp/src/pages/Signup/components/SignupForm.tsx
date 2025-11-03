import 'primereact/resources/themes/saga-blue/theme.css'; // theme
import 'primereact/resources/primereact.min.css';         // core css
import 'primeicons/primeicons.css';                       // icons
import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { SignupFormData, SignupResponse } from "../types/signuptypes";
import { registerUser } from "../services/useSignup";
import { useNavigate } from "react-router-dom";

export default function SignupForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<SignupFormData>({
    fullName: "",
    contactNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    designation: "",
    isRecruiter: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  const designations = [
    { label: "Software Engineer", value: "software engineer" },
    { label: "Admin", value: "admin" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDropdownChange = (e: { value: string }) => {
    setFormData((prev) => ({ ...prev, designation: e.value || "" }));
    setErrors((prev) => ({ ...prev, designation: "" }));
  };

  const validateFields = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName) newErrors.fullName = "Please enter your full name";
    if (!formData.contactNumber)
      newErrors.contactNumber = "Please enter your contact number";
    if (!formData.email) newErrors.email = "Please enter your email address";
    if (!formData.designation)
      newErrors.designation = "Please select a designation";
    if (!formData.password) newErrors.password = "Please enter a password";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    if (
      formData.password &&
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    )
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignupClick = async () => {
    setGeneralError("");
    if (!validateFields()) return;

    const submitData = {
      ...formData,
      isRecruiter: false,
      isAdmin: formData.designation === "admin",
    };

    try {
      setLoading(true);
      const response: SignupResponse = await registerUser(submitData);
      if (response && response.success) {
        alert("User created successfully! Redirecting to login page.");
        navigate("/login");
      } else {
        setGeneralError(response?.message || "Signup failed.");
      }
    } catch (err: any) {
      setGeneralError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-100 p-6">
      <div className="card bg-white p-10 rounded-2xl shadow-2xl w-full max-w-lg">
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-2">
          Create Your Account
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Join to Get Acess to our Management system and start your journey today 🚀
        </p>

        {/* General error */}
        {generalError && (
          <div className="text-center mb-4 text-red-600 font-medium bg-red-50 border border-red-200 rounded-md py-2">
            {generalError}
          </div>
        )}

        <div className="flex flex-column gap-4">
          {/* Full Name */}
          <div className="p-inputgroup">
            <span className="p-inputgroup-addon">
              <i className="pi pi-user"></i>
            </span>
            <InputText
              placeholder="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`w-full ${errors.fullName ? "p-invalid" : ""}`}
            />
          </div>
          {errors.fullName && (
  <p className="!text-red-600 text-sm -mt-2">{errors.fullName}</p>
)}


          {/* Contact Number */}
          <div className="p-inputgroup">
            <span className="p-inputgroup-addon">
              <i className="pi pi-phone"></i>
            </span>
            <InputText
              placeholder="Contact Number"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              className={`w-full ${errors.contactNumber ? "p-invalid" : ""}`}
            />
          </div>
          {errors.contactNumber && (
            <p className="text-red-600 text-sm -mt-2">{errors.contactNumber}</p>
          )}

          {/* Email */}
          <div className="p-inputgroup">
            <span className="p-inputgroup-addon">
              <i className="pi pi-envelope"></i>
            </span>
            <InputText
              placeholder="Email Address"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full ${errors.email ? "p-invalid" : ""}`}
            />
          </div>
          {errors.email && (
            <p className="text-red-600 text-sm -mt-2">{errors.email}</p>
          )}

          {/* Designation */}
          <div className="p-inputgroup">
            <span className="p-inputgroup-addon">
              <i className="pi pi-briefcase"></i>
            </span>
            <Dropdown
              value={formData.designation}
              options={designations}
              onChange={handleDropdownChange}
              placeholder="Select Designation"
              className={`w-full ${errors.designation ? "p-invalid" : ""}`}
            />
          </div>
          {errors.designation && (
            <p className="text-red-600 text-sm -mt-2">{errors.designation}</p>
          )}

          {/* Password */}
          <div className="p-inputgroup">
            <span className="p-inputgroup-addon">
              <i className="pi pi-lock"></i>
            </span>
            <Password
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              toggleMask
              inputClassName={`w-full ${errors.password ? "p-invalid" : ""}`}
            />
          </div>
          {errors.password && (
            <p className="text-red-600 text-sm -mt-2">{errors.password}</p>
          )}

          {/* Confirm Password */}
          <div className="p-inputgroup">
            <span className="p-inputgroup-addon">
              <i className="pi pi-lock"></i>
            </span>
            <Password
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              feedback={false}
              toggleMask
              inputClassName={`w-full ${errors.confirmPassword ? "p-invalid" : ""}`}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-red-600 text-sm -mt-2">
              {errors.confirmPassword}
            </p>
          )}
 
          {/* Submit Button */}
          <Button
            type="submit"
            label={loading ? "Creating Account..." : "Sign Up"}
            icon={loading ? "pi pi-spin pi-spinner" : "pi pi-user-plus"}
            className="p-button-primary w-full mt-3 py-2"
            onClick={handleSignupClick}
            disabled={loading}
          />

          {/* Login Link */}
          <p className="text-center text-gray-600 text-sm mt-6">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:underline font-medium">
              Log In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}