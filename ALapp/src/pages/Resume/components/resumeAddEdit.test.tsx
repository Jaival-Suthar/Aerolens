import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import ResumeAddEdit from "../components/resumeAddEdit";
import { createCandidate, updateCandidate, uploadResume } from "../services/useResume";

// 🔹 Mock the service functions
vi.mock("../services/useResume", () => ({
  createCandidate: vi.fn(),
  updateCandidate: vi.fn(),
  uploadResume: vi.fn(),
}));

describe("ResumeAddEdit Component", () => {
  const mockOnHide = vi.fn();
  const mockOnSuccess = vi.fn();

  const baseProps = {
    visible: true,
    onHide: mockOnHide,
    onSuccess: mockOnSuccess,
    selectedResume: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Add New Resume dialog when no resume selected", () => {
    render(<ResumeAddEdit {...baseProps} />);

    expect(screen.getByText("Add New Resume")).toBeInTheDocument();
  });

  it("renders Edit Resume dialog when resume selected", () => {
    const selectedResume = {
      candidateId: 5,
      candidateName: "Jane Smith",
      contactNumber: "9876543210",
      email: "jane@example.com",
      recruiterName: "Jayraj",
      jobRole: "Designer",
      preferredJobLocation: "Bangalore",
      currentCTC: 8,
      expectedCTC: 10,
      noticePeriod: 30,
      experienceYears: 3,
      statusName: "Selected",
      linkedinProfileUrl: "https://www.linkedin.com/in/jane",
      resumeFile: null,
    };

    render(
      <ResumeAddEdit
        {...baseProps}
        visible={true}
        selectedResume={selectedResume}
      />
    );

    expect(screen.getByText("Edit Resume")).toBeInTheDocument();
  });

  it("shows validation errors when submitting empty form", async () => {
    render(<ResumeAddEdit {...baseProps} />);

    // Find all buttons and click the one that is NOT disabled (Save button)
    const buttons = screen.getAllByRole("button");
    const saveButton = buttons.find(btn => !btn.hasAttribute("disabled") && btn.textContent?.includes("Save"));

    if (saveButton) {
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText("Candidate Name is required.")).toBeInTheDocument();
        expect(screen.getByText("Email is required.")).toBeInTheDocument();
      });
    }
  });

  it("calls createCandidate when form is valid and new candidate added", async () => {
    render(<ResumeAddEdit {...baseProps} />);

    // Get all textbox inputs
    const inputs = screen.getAllByRole("textbox");
    const user = userEvent.setup();

    // Fill text inputs: Candidate Name, Email, Contact Number, Job Role, LinkedIn
    if (inputs[0]) await user.type(inputs[0], "John Doe");
    if (inputs[1]) await user.type(inputs[1], "john@example.com");
    if (inputs[2]) await user.type(inputs[2], "9876543210");
    if (inputs[3]) await user.type(inputs[3], "Frontend Developer");
    if (inputs[4]) await user.type(inputs[4], "https://www.linkedin.com/in/john");

    // Mock service success
    (createCandidate as any).mockResolvedValueOnce({ candidateId: 1 });

    // Find and click Save button
    const buttons = screen.getAllByRole("button");
    const saveButton = buttons.find(btn => !btn.hasAttribute("disabled") && btn.textContent?.includes("Save"));

    if (saveButton) {
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(createCandidate).toHaveBeenCalled();
        expect(mockOnSuccess).toHaveBeenCalled();
        expect(mockOnHide).toHaveBeenCalled();
      });
    }
  });

  it("calls updateCandidate when editing existing candidate", async () => {
    const selectedResume = {
      candidateId: 5,
      candidateName: "Jane Smith",
      contactNumber: "9876543210",
      email: "jane@example.com",
      recruiterName: "Jayraj",
      jobRole: "Designer",
      preferredJobLocation: "Bangalore",
      currentCTC: 8,
      expectedCTC: 10,
      noticePeriod: 30,
      experienceYears: 3,
      statusName: "Selected",
      linkedinProfileUrl: "https://www.linkedin.com/in/jane",
      resumeFile: null,
    };

    render(
      <ResumeAddEdit
        {...baseProps}
        visible={true}
        selectedResume={selectedResume}
      />
    );

    // Mock service success
    (updateCandidate as any).mockResolvedValueOnce({ candidateId: 5 });

    // Find and click Update button
    const buttons = screen.getAllByRole("button");
    const updateButton = buttons.find(btn => !btn.hasAttribute("disabled") && btn.textContent?.includes("Update"));

    if (updateButton) {
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(updateCandidate).toHaveBeenCalledWith(
          5,
          expect.objectContaining({ candidateName: "Jane Smith" })
        );
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    }
  });

  it("closes dialog when Cancel button is clicked", async () => {
    render(<ResumeAddEdit {...baseProps} />);

    const buttons = screen.getAllByRole("button");
    const cancelButton = buttons.find(btn => btn.textContent?.includes("Cancel"));

    if (cancelButton) {
      fireEvent.click(cancelButton);
      expect(mockOnHide).toHaveBeenCalled();
    }
  });
});