import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ResumeTable from "./resumeTable";
import * as useResumeService from "../services/useResume";
import type { CandidateCreateData } from "../types/resumeTypes";
import { vi } from "vitest";
import { cleanup } from "@testing-library/react";

vi.mock("../../../shared/auth/AuthContext", () => ({
  useAuth: () => ({ accessToken: "mock-token-123" }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
// Mocks for PrimeReact components
vi.mock("primereact/datatable", () => ({
  DataTable: ({ value, children, ref, ...props }: any) => {
    if (ref) {
      ref.current = {
        nodeType: 1,
        tagName: "TABLE",
        exportCSV: vi.fn(),
        // Mock a valid DOM element for JSDOM
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      };
    }
    return (
      <table data-testid="datatable" {...props}>
        <tbody>
          {(value || []).map((candidate: any) => (
            <tr key={candidate.candidateId} data-testid="datatable-row">
              <td>{candidate.candidateName}</td>
              <td>
                {candidate.resumeFilename ? (
                  <>
                    <button aria-label="Download Resume" data-testid={`download-btn-${candidate.candidateId}`}>
                      Download
                    </button>
                    <button aria-label="Preview Resume" data-testid={`preview-btn-${candidate.candidateId}`}>
                      Preview
                    </button>
                  </>
                ) : (
                  <span>No Resume</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
}));


vi.mock("primereact/column", () => ({
  Column: vi.fn(() => null),
}));
vi.mock("primereact/button", () => ({
  Button: vi.fn(({ onClick, icon, disabled, ...props }) => (
    <button
      disabled={disabled}
      onClick={onClick}
      data-testid="primereact-button"
      {...props}
    >
      {icon && <span>{icon}</span>}
    </button>
  )),
}));

// Mocks for shared components
vi.mock("../components/resumeAddEdit", () => ({
  __esModule: true,
  default: ({ visible, onHide }: any) =>
    visible ? <div data-testid="resume-addedit-dialog">AddEdit Dialog<button onClick={onHide}>Close</button></div> : null,
}));
vi.mock("./resumeDelete", () => ({
  __esModule: true,
  default: ({ visible, onHide }: any) =>
    visible ? <div data-testid="resume-delete-dialog">Delete Dialog<button onClick={onHide}>Close</button></div> : null,
}));
vi.mock("../../../shared/ExportExcelButton", () => ({
  __esModule: true,
  default: ({ dtRef }: any) => {
    if (dtRef?.current) {
      dtRef.current.exportCSV = dtRef.current.exportCSV || vi.fn();
    }
    return <button data-testid="export-excel-button">Export Excel</button>;
  },
}));
vi.mock("../../../shared/AddButton", () => ({
  __esModule: true,
  default: ({ onClick }: any) => <button data-testid="add-button" onClick={onClick}>Add</button>,
}));
vi.mock("../../../shared/EditButton", () => ({
  __esModule: true,
  default: ({ onClick, disabled }: any) => (
    <button data-testid="edit-button" onClick={onClick} disabled={disabled}>Edit</button>
  ),
}));
vi.mock("../../../shared/DeleteButton", () => ({
  __esModule: true,
  default: ({ onClick, disabled }: any) => (
    <button data-testid="delete-button" onClick={onClick} disabled={disabled}>Delete</button>
  ),
}));

vi.mock("../../../shared/services/globalToastService", () => ({
  showGlobalToast: vi.fn(),
}));

const MOCK_CREATE_DATA: CandidateCreateData = {
  recruiters: [],
  vendors: [],
  locations: [],
  jobProfiles: [],
  currencies: [],
  compensationTypes: [],
  workModes: [],
};

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("ResumeTable Component", () => {
  const mockCandidates = [
    {
      candidateId: 1,
      candidateName: "John Doe",
      contactNumber: "1234567890",
      email: "john@example.com",
      recruiterId: 1,
      recruiterName: "Recruiter A",
      jobProfileRequirementId: 1,
      jobRole: "Developer",
      dateOfEntry: "2024-06-01T10:00:00.000Z",
      expectedLocation: { city: "Mumbai", country: "India" },
      workMode: "Remote",
      noticePeriod: 30,
      experienceYears: 5,
      statusName: "Active",
      linkedinProfileUrl: "https://linkedin.com/in/johndoe",
      resumeFilename: "john_resume.pdf",
    },
    {
      candidateId: 2,
      candidateName: "Jane Smith",
      contactNumber: "0987654321",
      email: "jane@example.com",
      recruiterId: 2,
      recruiterName: "Recruiter B",
      jobProfileRequirementId: 1,
      jobRole: "Designer",
      dateOfEntry: "2024-06-02T10:00:00.000Z",
      expectedLocation: { city: "Delhi", country: "India" },
      workMode: "Hybrid",
      noticePeriod: 60,
      experienceYears: 3,
      statusName: "Pending",
      linkedinProfileUrl: "",
      resumeFilename: "",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useResumeService, "fetchCandidateCreateData").mockResolvedValue(MOCK_CREATE_DATA);
    vi.spyOn(useResumeService, "getCandidates").mockResolvedValue({ candidates: mockCandidates });
  });

  it("loads and displays resumes", async () => {
    renderWithRouter(<ResumeTable />);

    await waitFor(() => {
      expect(useResumeService.getCandidates).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText("Candidate Resume Management")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText("John Doe").length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText("Jane Smith").length).toBeGreaterThan(0);
  });

  it("handles error when loading resumes", async () => {
    vi.mocked(useResumeService.getCandidates).mockRejectedValueOnce(new Error("Failed to load"));

    renderWithRouter(<ResumeTable />);

    await waitFor(() => {
      expect(useResumeService.getCandidates).toHaveBeenCalledTimes(1);
    });

    // No resumes shown, but table still rendered
    expect(screen.getByText("Candidate Resume Management")).toBeInTheDocument();
  });

  it("opens Add dialog when Add button clicked", async () => {
    vi.mocked(useResumeService.getCandidates).mockResolvedValueOnce({ candidates: [] });

    renderWithRouter(<ResumeTable />);
    await waitFor(() => screen.getByTestId("add-button"));

    await userEvent.click(screen.getByTestId("add-button"));

    await waitFor(() => {
      expect(screen.getByTestId("resume-addedit-dialog")).toBeInTheDocument();
    });
  });

  it("disables Edit when no row is selected", async () => {
    renderWithRouter(<ResumeTable />);
    await waitFor(() => {
      expect(screen.getAllByText("John Doe").length).toBeGreaterThan(0);
    });

    expect(screen.getByTestId("edit-button")).toBeDisabled();
  });

  it("disables Delete when no row is selected", async () => {
    renderWithRouter(<ResumeTable />);
    await waitFor(() => {
      expect(screen.getAllByText("John Doe").length).toBeGreaterThan(0);
    });

    expect(screen.getByTestId("delete-button")).toBeDisabled();
  });

//   it("calls download resume when clicking Download button", async () => {
//   vi.spyOn(useResumeService, "getCandidates").mockResolvedValue([mockCandidates[0]]);

//   render(<ResumeTable />);
//   await waitFor(() => screen.getByText("John Doe"));

//   const downloadButton = screen.getByTestId("download-btn-1");
//   expect(downloadButton).toBeInTheDocument();

//   const createElementSpy = vi.spyOn(document, "createElement");
//   const appendChildSpy = vi.spyOn(document.body, "appendChild");
//   const removeChildSpy = vi.spyOn(document.body, "removeChild");
//   const clickMock = vi.fn();

//   createElementSpy.mockImplementation(() => ({
//     href: "",
//     download: "",
//     click: clickMock,
//     style: {},
//   } as any));

//   await userEvent.click(downloadButton);

//   await waitFor(() => {
//     expect(createElementSpy).toHaveBeenCalledWith("a");
//     expect(appendChildSpy).toHaveBeenCalled();
//     expect(clickMock).toHaveBeenCalled();
//     expect(removeChildSpy).toHaveBeenCalled();
//   });

//   createElementSpy.mockRestore();
//   appendChildSpy.mockRestore();
//   removeChildSpy.mockRestore();
// });

  // it("opens preview window when clicking Preview button", async () => {
  //   vi.spyOn(useResumeService, "getCandidates").mockResolvedValue([mockCandidates[0]]);

  //   render(<ResumeTable />);
  //   await waitFor(() => screen.getByText("John Doe"));

  //   const windowOpenSpy = vi.spyOn(window, "open").mockImplementation(() => null);

  //   const previewButton = screen.getByRole("button", { name: /Preview Resume/i }) || screen.getAllByRole("button")[1];
  //   expect(previewButton).toBeInTheDocument();

  //   userEvent.click(previewButton);

  //   expect(windowOpenSpy).toHaveBeenCalled();

  //   windowOpenSpy.mockRestore();
  // });

//   it("renders ExportExcelButton with dt ref", async () => {
//   vi.spyOn(useResumeService, "getCandidates").mockResolvedValue([]);
  
//   // Mock document.body.appendChild to prevent JSDOM errors
//   const appendChildSpy = vi.spyOn(document.body, "appendChild").mockImplementation((node) => node);
  
//   render(<ResumeTable />);
  
//   await waitFor(() => {
//     expect(screen.getByTestId("export-excel-button")).toBeInTheDocument();
//   });

//   appendChildSpy.mockRestore();
// });

});
