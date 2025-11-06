// // src/__tests__/SignupForm.test.tsx
// import React from "react";
// import { render, screen, fireEvent, waitFor } from "@testing-library/react";
// import { BrowserRouter } from "react-router-dom";
// import SignupForm from "../components/SignupForm";
// import * as signupService from "../services/useSignup";
// import { describe, it, expect, beforeEach, vi } from "vitest";

// // Mock the registerUser API
// vi.mock("../services/useSignup", () => ({
//   registerUser: vi.fn(),
// }));

// const renderWithRouter = (ui: React.ReactElement) =>
//   render(<BrowserRouter>{ui}</BrowserRouter>);

// describe("SignupForm Component", () => {
//   beforeEach(() => {
//     vi.clearAllMocks();
//   });

//   it("renders headings", () => {
//     renderWithRouter(<SignupForm />);
//     expect(screen.getByText("Create New User")).toBeInTheDocument();
//     expect(screen.getByText("Create New Account")).toBeInTheDocument();
//   });

//   it("renders all input fields", () => {
//     renderWithRouter(<SignupForm />);
//     expect(screen.getByPlaceholderText("Full Name")).toBeInTheDocument();
//     expect(screen.getByPlaceholderText("Contact Number")).toBeInTheDocument();
//     expect(screen.getByPlaceholderText("Email Address")).toBeInTheDocument();
//     expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
//     expect(screen.getByPlaceholderText("Confirm Password")).toBeInTheDocument();
//     expect(screen.getByPlaceholderText("Select Designation")).toBeInTheDocument();
//   });

//   it("shows errors when submitting empty form", async () => {
//     renderWithRouter(<SignupForm />);
//     fireEvent.click(screen.getByRole("button", { name: /Sign Up/i }));

//     await waitFor(() => {
//       expect(screen.getByText("Please enter your full name")).toBeInTheDocument();
//       expect(screen.getByText("Please enter your contact number")).toBeInTheDocument();
//       expect(screen.getByText("Please enter your email address")).toBeInTheDocument();
//       expect(screen.getByText("Please select a designation")).toBeInTheDocument();
//       expect(screen.getByText("Please enter a password")).toBeInTheDocument();
//       expect(screen.getByText("Please confirm your password")).toBeInTheDocument();
//     });
//   });

//   it("shows password mismatch error", async () => {
//     renderWithRouter(<SignupForm />);
//     fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "1234" } });
//     fireEvent.change(screen.getByPlaceholderText("Confirm Password"), { target: { value: "4321" } });
//     fireEvent.click(screen.getByRole("button", { name: /Sign Up/i }));

//     await waitFor(() => {
//       expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
//     });
//   });

//   it("allows entering valid input", async () => {
//     renderWithRouter(<SignupForm />);
//     fireEvent.change(screen.getByPlaceholderText("Full Name"), { target: { value: "John Doe" } });
//     fireEvent.change(screen.getByPlaceholderText("Contact Number"), { target: { value: "1234567890" } });
//     fireEvent.change(screen.getByPlaceholderText("Email Address"), { target: { value: "john@example.com" } });
//     fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "123456" } });
//     fireEvent.change(screen.getByPlaceholderText("Confirm Password"), { target: { value: "123456" } });
//     fireEvent.change(screen.getByPlaceholderText("Select Designation"), { target: { value: "admin" } });

//     expect(screen.getByPlaceholderText("Full Name")).toHaveValue("John Doe");
//     expect(screen.getByPlaceholderText("Contact Number")).toHaveValue("1234567890");
//     expect(screen.getByPlaceholderText("Email Address")).toHaveValue("john@example.com");
//   });

//   it("calls registerUser API on valid submit", async () => {
//     (signupService.registerUser as unknown as vi.Mock).mockResolvedValue({ success: true });
//     renderWithRouter(<SignupForm />);

//     fireEvent.change(screen.getByPlaceholderText("Full Name"), { target: { value: "John Doe" } });
//     fireEvent.change(screen.getByPlaceholderText("Contact Number"), { target: { value: "1234567890" } });
//     fireEvent.change(screen.getByPlaceholderText("Email Address"), { target: { value: "john@example.com" } });
//     fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "123456" } });
//     fireEvent.change(screen.getByPlaceholderText("Confirm Password"), { target: { value: "123456" } });
//     fireEvent.change(screen.getByPlaceholderText("Select Designation"), { target: { value: "admin" } });

//     fireEvent.click(screen.getByRole("button", { name: /Sign Up/i }));

//     await waitFor(() => {
//       expect(signupService.registerUser).toHaveBeenCalledTimes(1);
//       expect(signupService.registerUser).toHaveBeenCalledWith(
//         expect.objectContaining({
//           fullName: "John Doe",
//           contactNumber: "1234567890",
//           email: "john@example.com",
//           password: "123456",
//           confirmPassword: "123456",
//           designation: "admin",
//           isAdmin: true,
//           isRecruiter: false,
//         })
//       );
//     });
//   });

//   it("shows API error on failure", async () => {
//     (signupService.registerUser as unknown as vi.Mock).mockResolvedValue({ success: false, message: "Email exists" });
//     renderWithRouter(<SignupForm />);
//     fireEvent.change(screen.getByPlaceholderText("Full Name"), { target: { value: "John Doe" } });
//     fireEvent.click(screen.getByRole("button", { name: /Sign Up/i }));

//     await waitFor(() => {
//       expect(screen.getByText("Email exists")).toBeInTheDocument();
//     });
//   });

//   it("shows API exception error", async () => {
//     (signupService.registerUser as unknown as vi.Mock).mockRejectedValue(new Error("Network error"));
//     renderWithRouter(<SignupForm />);
//     fireEvent.change(screen.getByPlaceholderText("Full Name"), { target: { value: "John Doe" } });
//     fireEvent.click(screen.getByRole("button", { name: /Sign Up/i }));

//     await waitFor(() => {
//       expect(screen.getByText("Something went wrong. Please try again.")).toBeInTheDocument();
//     });
//   });

//   it("disables submit button while loading", async () => {
//     let resolvePromise: any;
//     (signupService.registerUser as unknown as vi.Mock).mockImplementation(
//       () => new Promise(res => { resolvePromise = res; })
//     );

//     renderWithRouter(<SignupForm />);
//     fireEvent.change(screen.getByPlaceholderText("Full Name"), { target: { value: "John Doe" } });
//     fireEvent.click(screen.getByRole("button", { name: /Sign Up/i }));

//     expect(screen.getByRole("button", { name: /Creating Account.../i })).toBeDisabled();

//     resolvePromise({ success: true });
//   });
// });
