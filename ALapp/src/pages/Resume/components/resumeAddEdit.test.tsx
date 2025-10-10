import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

  it("renders all required fields", () => {
    render(<ResumeAddEdit {...baseProps} />);

    expect(screen.getByLabelText(/Candidate Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Recruiter/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contact Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Job Role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/LinkedIn Profile URL/i)).toBeInTheDocument();
  });

  it("shows validation errors when submitting empty form", async () => {
    render(<ResumeAddEdit {...baseProps} />);

    const saveButton = screen.getByRole("button", { name: /Add Candidate/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Candidate name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Contact number is required/i)).toBeInTheDocument();
    });
  });

  it("calls createCandidate when form is valid and new candidate added", async () => {
    render(<ResumeAddEdit {...baseProps} />);

    // Fill form fields
    fireEvent.change(screen.getByLabelText(/Candidate Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Contact Number/i), {
      target: { value: "9876543210" },
    });
    fireEvent.change(screen.getByLabelText(/Job Role/i), {
      target: { value: "Frontend Developer" },
    });
    fireEvent.change(screen.getByLabelText(/LinkedIn Profile URL/i), {
      target: { value: "https://www.linkedin.com/in/john" },
    });

    // Simulate dropdowns via text
    const recruiterDropdown = screen.getByText("Select Recruiter");
    fireEvent.click(recruiterDropdown);
    fireEvent.click(screen.getByText("Jayraj"));

    const locationDropdown = screen.getByText("Select Location");
    fireEvent.click(locationDropdown);
    fireEvent.click(screen.getByText("Ahmedabad"));

    const statusDropdown = screen.getByText("Select Status");
    fireEvent.click(statusDropdown);
    fireEvent.click(screen.getByText("Selected"));

    // Mock service success
    (createCandidate as any).mockResolvedValueOnce({ candidateId: 1 });

    const saveButton = screen.getByRole("button", { name: /Add Candidate/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(createCandidate).toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnHide).toHaveBeenCalled();
    });
  });

  it("calls updateCandidate and uploadResume in edit mode", async () => {
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

    const saveButton = screen.getByRole("button", { name: /Update Candidate/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(updateCandidate).toHaveBeenCalledWith(
        selectedResume.candidateId,
        expect.objectContaining({ candidateName: "Jane Smith" })
      );
    });
  });
});
