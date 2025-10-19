import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import ResumeAddEdit from "../components/resumeAddEdit";
import {
  createCandidate,
  updateCandidate,
  uploadResume,
} from "../services/useResume";

// ---------- MOCKS ----------
vi.mock("primereact/dialog", () => ({
  Dialog: ({ visible, header, children, footer }: any) =>
    visible ? (
      <div data-testid="dialog">
        <h2>{header}</h2>
        {children}
        <div data-testid="dialog-footer">{footer}</div>
      </div>
    ) : null,
}));

vi.mock("primereact/inputtext", () => ({
  InputText: (props: any) => (
    <input
      id={props.id}
      value={props.value}
      onChange={props.onChange}
      onBlur={props.onBlur}
      className={props.className}
      placeholder={props.placeholder}
      data-testid={props.id}
    />
  ),
}));

vi.mock("primereact/dropdown", () => ({
  Dropdown: (props: any) => (
    <select
      id={props.id}
      value={props.value}
      onChange={(e) => props.onChange({ value: e.target.value })}
      onBlur={props.onBlur}
      className={props.className}
      data-testid={props.id}
    >
      <option value="">Select</option>
      {props.options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
}));

vi.mock("primereact/inputnumber", () => ({
  InputNumber: (props: any) => (
    <input
      id={props.id}
      type="number"
      value={props.value}
      onChange={(e) =>
        props.onValueChange({ value: Number(e.target.value) })
      }
      onBlur={props.onBlur}
      className={props.className}
      data-testid={props.id}
    />
  ),
}));

vi.mock("primereact/fileupload", () => ({
  FileUpload: (props: any) => (
    <input
      data-testid="file-upload"
      type="file"
      onChange={(e) =>
        props.onSelect({ files: Array.from(e.target.files ?? []) })
      }
      className={props.className}
    />
  ),
}));

vi.mock("../../../shared/DialogAddEditButton", () => ({
  __esModule: true,
  default: ({ label, onClick, severity }: any) => (
    <button onClick={onClick} className={severity}>
      {label}
    </button>
  ),
}));

vi.mock("../services/useResume", () => ({
  createCandidate: vi.fn(),
  updateCandidate: vi.fn(),
  uploadResume: vi.fn(),
}));

vi.mock("react-icons/fa", () => ({
  FaCheck: () => <span data-testid="icon-check">✓</span>,
}));

// ---------- HELPERS ----------
const renderComponent = (props = {}) => {
  const defaultProps = {
    visible: true,
    onHide: vi.fn(),
    onSuccess: vi.fn(),
    selectedResume: null,
  };
  return render(<ResumeAddEdit {...defaultProps} {...props} />);
};

// ---------- TESTS ----------
describe("ResumeAddEdit Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders add dialog with empty fields", () => {
    renderComponent();
    expect(screen.getByText("Add New Resume")).toBeInTheDocument();
    expect(screen.getByText("Candidate Name *")).toBeInTheDocument();
  });

  it("renders edit dialog when selectedResume is provided", () => {
    const selectedResume = {
      candidateId: 1,
      candidateName: "John Doe",
      contactNumber: "9876543210",
      email: "john@example.com",
      recruiterName: "Jayraj",
      jobRole: "Frontend Dev",
      preferredJobLocation: "Ahmedabad",
      currentCTC: 5,
      expectedCTC: 8,
      noticePeriod: 30,
      experienceYears: 3,
      statusName: "Interview Pending",
      linkedinProfileUrl: "https://linkedin.com/in/johndoe",
      resumeFile: null,
    };

    renderComponent({ selectedResume });
    expect(screen.getByText("Edit Resume")).toBeInTheDocument();
    expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
  });

  it("validates required fields before submitting", async () => {
    renderComponent();

    const addButton = screen.getByText("Add Candidate");
    await userEvent.click(addButton);

    // Assert that validation errors appear
    await waitFor(() => {
      expect(screen.getAllByText(/required/i).length).toBeGreaterThan(2); 
    });
  });

  it("calls createCandidate when adding a new candidate", async () => {
    (createCandidate as any).mockResolvedValueOnce({});

    renderComponent();

    // Use text content to find labels, then get following input
    const candidateNameInput = screen.getByText("Candidate Name *").parentElement?.querySelector("input");
    const contactNumberInput = screen.getByText("Contact Number *").parentElement?.querySelector("input");
    const emailInput = screen.getByText("Email *").parentElement?.querySelector("input");
    const recruiterSelect = screen.getByText("Recruiter *").parentElement?.querySelector("select");
    const jobRoleInput = screen.getByText("Job Role *").parentElement?.querySelector("input");
    const locationSelect = screen.getByText("Preferred Location *").parentElement?.querySelector("select");
    const currentCTCInput = screen.getByText("Current CTC *").parentElement?.querySelector("input");
    const expectedCTCInput = screen.getByText("Expected CTC *").parentElement?.querySelector("input");
    const noticePeriodInput = screen.getByText("Notice Period (Days) *").parentElement?.querySelector("input");
    const experienceInput = screen.getByText("Experience (Years) *").parentElement?.querySelector("input");
    const statusSelect = screen.getByText("Status *").parentElement?.querySelector("select");
    const linkedinInput = screen.getByText("LinkedIn URL *").parentElement?.querySelector("input");

    if (!candidateNameInput || !contactNumberInput || !emailInput || !recruiterSelect || 
        !jobRoleInput || !locationSelect || !currentCTCInput || !expectedCTCInput || 
        !noticePeriodInput || !experienceInput || !statusSelect || !linkedinInput) {
      throw new Error("Could not find form inputs");
    }

    await userEvent.type(candidateNameInput, "Alice");
    await userEvent.type(contactNumberInput, "9876543210");
    await userEvent.type(emailInput, "alice@example.com");
    await userEvent.selectOptions(recruiterSelect, "Jayraj");
    await userEvent.type(jobRoleInput, "Frontend Dev");
    await userEvent.selectOptions(locationSelect, "Ahmedabad");
    await userEvent.type(currentCTCInput, "5");
    await userEvent.type(expectedCTCInput, "8");
    await userEvent.type(noticePeriodInput, "30");
    await userEvent.type(experienceInput, "3");
    await userEvent.selectOptions(statusSelect, "Selected");
    await userEvent.type(linkedinInput, "https://www.linkedin.com/in/alice");

    await userEvent.click(screen.getByText("Add Candidate"));

    await waitFor(() => {
      expect(createCandidate).toHaveBeenCalledTimes(1);
      const expectedPayload = {
        candidateName: "Alice",
        contactNumber: "9876543210",
        email: "alice@example.com",
        recruiterName: "Jayraj",
        jobRole: "Frontend Dev",
        preferredJobLocation: "Ahmedabad",
        currentCTC: 5,
        expectedCTC: 8,
        noticePeriod: 30,
        experienceYears: 3,
        statusName: "Selected",
        linkedinProfileUrl: "https://www.linkedin.com/in/alice",
        resumeFile: null,
      };
      expect(createCandidate).toHaveBeenCalledWith(expectedPayload); 
    });
  });

  it("calls updateCandidate and uploadResume in edit mode", async () => {
    const selectedResume = {
      candidateId: 10,
      candidateName: "Bob",
      contactNumber: "9876543210",
      email: "bob@example.com",
      recruiterName: "Khushi",
      jobRole: "Backend Dev",
      preferredJobLocation: "Bangalore",
      currentCTC: 10,
      expectedCTC: 15,
      noticePeriod: 45,
      experienceYears: 5,
      statusName: "Selected",
      linkedinProfileUrl: "https://linkedin.com/in/bob",
      resumeFile: null,
    };

    (updateCandidate as any).mockResolvedValueOnce({});
    (uploadResume as any).mockResolvedValueOnce({});

    renderComponent({ selectedResume });

    expect(screen.getByText("Edit Resume")).toBeInTheDocument();
    
    const file = new File(["dummy"], "resume.pdf", { type: "application/pdf" });
    const input = screen.getByTestId("file-upload");
    await userEvent.upload(input, file);
    
    expect(screen.getByText("File selected: resume.pdf")).toBeInTheDocument(); 

    await userEvent.click(screen.getByText("Update Candidate"));

    await waitFor(() => {
      expect(updateCandidate).toHaveBeenCalledTimes(1);
      expect(updateCandidate).toHaveBeenCalledWith(10, expect.any(Object));
      expect(uploadResume).toHaveBeenCalledTimes(1);
      expect(uploadResume).toHaveBeenCalledWith(10, file);
    });
  });

  it("displays validation error for invalid LinkedIn URL", async () => {
    renderComponent();

    const linkedinInput = screen.getByText("LinkedIn URL *").parentElement?.querySelector("input");
    
    if (!linkedinInput) {
      throw new Error("Could not find LinkedIn input");
    }

    await userEvent.type(linkedinInput, "invalid-url");
    fireEvent.blur(linkedinInput);

    await waitFor(() => {
      expect(screen.getByText("Enter a valid LinkedIn URL.")).toBeInTheDocument();
    });
  });

  it("calls onHide when cancel button is clicked", async () => {
    const onHide = vi.fn();
    renderComponent({ onHide });

    await userEvent.click(screen.getByText("Cancel"));
    expect(onHide).toHaveBeenCalledTimes(1);
  });
});