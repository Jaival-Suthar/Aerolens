import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import ResumeAddEdit from "../components/resumeAddEdit";

const mockCreateCandidate = vi.hoisted(() => vi.fn());
const mockUpdateCandidate = vi.hoisted(() => vi.fn());
const mockUploadResume = vi.hoisted(() => vi.fn());
const mockGetCandidateById = vi.hoisted(() => vi.fn());

vi.mock("../../../shared/auth/AuthContext", () => ({
  useAuth: () => ({
    accessToken: "mock-token-123",
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
    logoutAll: vi.fn(),
    refreshAccessToken: vi.fn(),
  }),
}));

vi.mock("../../../shared/store/profile", () => ({
  useProfileStore: () => ({ member: null }),
}));

vi.mock("primereact/toast", () => ({
  Toast: React.forwardRef((_props, ref) => {
    React.useImperativeHandle(ref, () => ({ show: vi.fn() }));
    return <div data-testid="toast" />;
  }),
}));
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
  createCandidate: mockCreateCandidate,
  updateCandidate: mockUpdateCandidate,
  uploadResume: mockUploadResume,
  getCandidateById: mockGetCandidateById,
}));

vi.mock("react-icons/fa", () => {
  const Stub = (props: { children?: React.ReactNode }) => (
    <span data-testid="fa-icon">{props.children}</span>
  );
  return new Proxy(
    { __esModule: true } as Record<string, unknown>,
    {
      get(_, prop: string | symbol) {
        if (prop === "__esModule") return true;
        return Stub;
      },
    }
  );
});

const MOCK_CREATE_DATA = {
  recruiters: [
    { recruiterId: 1, recruiterName: "Jayraj" },
    { recruiterId: 2, recruiterName: "Khushi" },
  ],
  vendors: [],
  locations: [
    { city: "Ahmedabad", country: "India" },
    { city: "Bangalore", country: "India" },
  ],
  jobProfiles: [
    {
      jobProfileRequirementId: 1,
      jobRole: "Frontend Dev",
      clientName: "Acme",
      departmentName: "Eng",
      city: "Ahmedabad",
      country: "India",
      experienceText: "3",
    },
  ],
  currencies: [
    { currencyId: 1, currencyName: "INR" },
    { currencyId: 2, currencyName: "USD" },
  ],
  compensationTypes: [
    { compensationTypeId: 1, compensationTypeName: "Annual" },
    { compensationTypeId: 2, compensationTypeName: "Hourly" },
  ],
  workModes: [{ workModeId: 1, workMode: "Remote" }],
} as const;

// ---------- HELPERS ----------
const renderComponent = (props: Record<string, unknown> = {}) => {
  const defaultProps = {
    visible: true,
    onHide: vi.fn(),
    onSuccess: vi.fn(),
    selectedResume: null,
    createData: MOCK_CREATE_DATA,
    loadingOptions: false,
    existingCandidates: [],
  };
  return render(<ResumeAddEdit {...(defaultProps as any)} {...(props as any)} />);
};

// ---------- TESTS ----------
describe("ResumeAddEdit Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCandidateById.mockImplementation(async (_token: string, id: number) => ({
      candidateId: id,
      candidateName: "Bob",
      contactNumber: "9876543210",
      email: "bob@example.com",
      recruiterId: 2,
      recruiterName: "Khushi",
      vendorId: null,
      referredBy: undefined,
      jobProfileRequirementId: 1,
      expectedLocation: { city: "Bangalore", country: "India" },
      currentLocation: null,
      currentCTCAmount: null,
      currentCTCCurrencyId: null,
      currentCTCTypeId: null,
      expectedCTCAmount: null,
      expectedCTCCurrencyId: null,
      expectedCTCTypeId: null,
      noticePeriod: 45,
      experienceYears: 5,
      linkedinProfileUrl: "https://linkedin.com/in/bob",
      notes: undefined,
      workMode: null,
      workModeId: null,
    }));
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

  it(
  "calls createCandidate when adding a new candidate",
  async () => {
    // Arrange
    mockCreateCandidate.mockResolvedValueOnce({});

    renderComponent();

    // Helper to get input safely
    const getInput = (label: string) =>
      screen.getByText(label).parentElement?.querySelector("input") as HTMLInputElement | null;

    const getSelect = (label: string) =>
      screen.getByText(label).parentElement?.querySelector("select") as HTMLSelectElement | null;

    const candidateNameInput = getInput("Candidate Name *");
    const contactNumberInput = getInput("Contact Number *");
    const emailInput = getInput("Email *");
    const recruiterSelect = getSelect("Recruiter *");
    const jobRoleInput = getInput("Job Role *");
    const locationSelect = getSelect("Preferred Location *");
    const currentCTCInput = getInput("Current CTC *");
    const expectedCTCInput = getInput("Expected CTC *");
    const noticePeriodInput = getInput("Notice Period (Days) *");
    const experienceInput = getInput("Experience (Years) *");
    const statusSelect = getSelect("Status *");
    const linkedinInput = getInput("LinkedIn URL *");

    if (
      !candidateNameInput ||
      !contactNumberInput ||
      !emailInput ||
      !recruiterSelect ||
      !jobRoleInput ||
      !locationSelect ||
      !currentCTCInput ||
      !expectedCTCInput ||
      !noticePeriodInput ||
      !experienceInput ||
      !statusSelect ||
      !linkedinInput
    ) {
      throw new Error("Could not find form inputs");
    }

    // Act
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

    // Add a small delay — helps userEvent queue flush before assertion
    await new Promise((r) => setTimeout(r, 10));

    await userEvent.click(screen.getByText("Add Candidate"));

    // Assert
    await waitFor(() => {
      expect(mockCreateCandidate).toHaveBeenCalledTimes(1);
    });

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

    expect(mockCreateCandidate).toHaveBeenCalledWith("mock-token-123", expectedPayload);
  },
  15000 // ⏰ Increase timeout
);


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

    mockUpdateCandidate.mockResolvedValueOnce({});
    mockUploadResume.mockResolvedValueOnce({});

    renderComponent({ selectedResume });

    expect(screen.getByText("Edit Resume")).toBeInTheDocument();
    
    const file = new File(["dummy"], "resume.pdf", { type: "application/pdf" });
    const input = screen.getByTestId("file-upload");
    await userEvent.upload(input, file);
    
    expect(screen.getByText("File selected: resume.pdf")).toBeInTheDocument(); 

    await userEvent.click(screen.getByText("Update Candidate"));

    await waitFor(() => {
      expect(mockUpdateCandidate).toHaveBeenCalledTimes(1);
      expect(mockUpdateCandidate).toHaveBeenCalledWith(
        "mock-token-123",
        10,
        expect.any(Object)
      );
      expect(mockUploadResume).toHaveBeenCalledTimes(1);
      expect(mockUploadResume).toHaveBeenCalledWith("mock-token-123", 10, file);
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