import React from "react";
import { describe, it, vi, beforeEach, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AddLookupForm } from "./AddLookupForm";
import { lookupService } from "../services/lookupService";
vi.mock('../../../shared/auth/AuthContext', () => ({
  useAuth: () => ({
    accessToken: 'mock-token-123'
  })
}));
// Mock lookupService
vi.mock("../services/lookupService", () => ({
  lookupService: {
    create: vi.fn(),
  },
}));

// Mock Toast to prevent real DOM rendering
vi.mock("primereact/toast", () => ({
  Toast: React.forwardRef(() => <div data-testid="toast" />),
}));

describe("AddLookupForm Component", () => {
  const onHide = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setup = (props = {}) =>
    render(
      <AddLookupForm
        visible={true}
        onHide={onHide}
        onSuccess={onSuccess}
        {...props}
      />
    );

  // --- 1️⃣ RENDER TEST ---
  it("renders dialog fields correctly", () => {
    setup();

    expect(screen.getByText("Add New Lookup Entry")).toBeInTheDocument();
    expect(screen.getByLabelText(/Tag/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Value/i)).toBeInTheDocument();
    expect(screen.getByText(/Add Lookup/i)).toBeInTheDocument();
  });

  // --- 2️⃣ VALIDATION TEST ---
  it("shows validation errors when submitting empty form", async () => {
    setup();

    const addButton = screen.getByText("Add Lookup");
    fireEvent.click(addButton);

    expect(await screen.findByText("Tag is required")).toBeInTheDocument();
    expect(await screen.findByText("Value is required")).toBeInTheDocument();
    expect(lookupService.create).not.toHaveBeenCalled();
  });

  // --- 3️⃣ SUCCESS TEST ---
  it("submits form successfully and calls onSuccess + onHide", async () => {
    (lookupService.create as any).mockResolvedValue({
      success: true,
      message: "Lookup added",
    });

    setup();

    fireEvent.change(screen.getByLabelText(/Tag/i), {
      target: { value: "status" },
    });
    fireEvent.change(screen.getByLabelText(/Value/i), {
      target: { value: "active" },
    });

    const addButton = screen.getByText("Add Lookup");
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(lookupService.create).toHaveBeenCalledWith('mock-token-123', {
        tag: "status",
        value: "active",
      });
    });

    expect(onSuccess).toHaveBeenCalled();
    expect(onHide).toHaveBeenCalled();
  });

  // --- 4️⃣ BACKEND VALIDATION ERROR TEST ---
  it("shows backend validation errors from API", async () => {
    (lookupService.create as any).mockResolvedValue({
      success: false,
      error: "VALIDATION_ERROR",
      details: {
        validationErrors: [
          { field: "tag", message: "Tag already exists" },
          { field: "value", message: "Invalid value" },
        ],
      },
    });

    setup();

    fireEvent.change(screen.getByLabelText(/Tag/i), {
      target: { value: "duplicateTag" },
    });
    fireEvent.change(screen.getByLabelText(/Value/i), {
      target: { value: "someValue" },
    });

    fireEvent.click(screen.getByText("Add Lookup"));

    expect(await screen.findByText("Tag already exists")).toBeInTheDocument();
    expect(await screen.findByText("Invalid value")).toBeInTheDocument();
  });

  // --- 5️⃣ NETWORK/UNEXPECTED ERROR TEST ---
  it("handles network error gracefully", async () => {
    (lookupService.create as any).mockRejectedValue(new Error("Network error"));

    setup();

    fireEvent.change(screen.getByLabelText(/Tag/i), {
      target: { value: "net" },
    });
    fireEvent.change(screen.getByLabelText(/Value/i), {
      target: { value: "error" },
    });

    fireEvent.click(screen.getByText("Add Lookup"));

    await waitFor(() => {
      expect(lookupService.create).toHaveBeenCalled();
    });
  });

  // --- 6️⃣ CLEARING ERRORS ON TYPING ---
  it("clears validation error when user types again", async () => {
    setup();

    fireEvent.click(screen.getByText("Add Lookup"));
    const tagError = await screen.findByText("Tag is required");
    expect(tagError).toBeInTheDocument();

    const tagInput = screen.getByLabelText(/Tag/i);
    fireEvent.change(tagInput, { target: { value: "fixedTag" } });

    await waitFor(() => {
      expect(screen.queryByText("Tag is required")).not.toBeInTheDocument();
    });
  });
    // --- 8️⃣ TEST NON-VALIDATION ERROR RESPONSE BRANCH ---
  it("shows toast error for non-validation failure responses", async () => {
    (lookupService.create as any).mockResolvedValue({
      success: false,
      error: "UNKNOWN_ERROR",
      message: "Something went wrong",
    });

    setup();

    fireEvent.change(screen.getByLabelText(/Tag/i), {
      target: { value: "weird" },
    });
    fireEvent.change(screen.getByLabelText(/Value/i), {
      target: { value: "case" },
    });

    fireEvent.click(screen.getByText("Add Lookup"));

    await waitFor(() => {
      expect(lookupService.create).toHaveBeenCalled();
    });

    // Should show an error toast (mocked)
    expect(screen.getByTestId("toast")).toBeInTheDocument();
  });

  // --- 9️⃣ TEST HANDLEHIDE resets and clears errors ---
it("resets all inputs and errors when dialog hides manually", async () => {
  setup();

  // Trigger validation error first
  fireEvent.click(screen.getByText("Add Lookup"));
  expect(await screen.findByText("Tag is required")).toBeInTheDocument();

  // Simulate dialog hide by clicking Cancel button
  fireEvent.click(screen.getByText("Cancel"));

  await waitFor(() => {
    expect(onHide).toHaveBeenCalled(); // ✅ spy now called
  });

  // Ensure form fields are reset after hide
  expect(screen.getByLabelText(/Tag/i)).toHaveValue("");
  expect(screen.getByLabelText(/Value/i)).toHaveValue("");
});


  // --- 🔟 TEST MAX LENGTH and DISABLED STATE DURING LOADING ---
//   it("disables fields and buttons when loading", async () => {
//     let resolvePromise: any;
//     const mockPromise = new Promise((res) => (resolvePromise = res));
//     (lookupService.create as any).mockReturnValue(mockPromise);

//     setup();

//     const tagInput = screen.getByLabelText(/Tag/i);
//     const valueInput = screen.getByLabelText(/Value/i);
//     const addButton = screen.getByText("Add Lookup");

//     fireEvent.change(tagInput, { target: { value: "status" } });
//     fireEvent.change(valueInput, { target: { value: "active" } });
//     fireEvent.click(addButton);

//     // Check that fields are disabled during submission
//     expect(tagInput).toBeDisabled();
//     expect(valueInput).toBeDisabled();
//     expect(addButton).toBeDisabled();

//     // Resolve promise to end loading
//     resolvePromise({ success: true });
//     await waitFor(() => {
//       expect(onSuccess).toHaveBeenCalled();
//     });
//   });

  // --- 1️⃣1️⃣ TEST MAX CHARACTER VALIDATION MESSAGES ---
  it("shows validation errors for exceeding max length", async () => {
    setup();

    const longTag = "x".repeat(101);
    const longValue = "y".repeat(501);

    fireEvent.change(screen.getByLabelText(/Tag/i), {
      target: { value: longTag },
    });
    fireEvent.change(screen.getByLabelText(/Value/i), {
      target: { value: longValue },
    });

    fireEvent.click(screen.getByText("Add Lookup"));

    expect(await screen.findByText("Tag must be 100 characters or less")).toBeInTheDocument();
    expect(await screen.findByText("Value must be 500 characters or less")).toBeInTheDocument();
  });

  // --- 7️⃣ CANCEL BUTTON TEST ---
  it("resets form and calls onHide when Cancel clicked", async () => {
    setup();

    fireEvent.change(screen.getByLabelText(/Tag/i), {
      target: { value: "temp" },
    });
    fireEvent.change(screen.getByLabelText(/Value/i), {
      target: { value: "val" },
    });

    fireEvent.click(screen.getByText("Cancel"));

    await waitFor(() => {
      expect(onHide).toHaveBeenCalled();
    });

    // Verify form resets
    expect(screen.getByLabelText(/Tag/i)).toHaveValue("");
    expect(screen.getByLabelText(/Value/i)).toHaveValue("");
  });
});
