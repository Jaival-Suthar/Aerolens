// src/pages/Resume/components/ResumeTable.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ResumeTable from "../components/resumeTable";
import { getCandidates } from "../services/useResume";

// ✅ Mock service
vi.mock("../services/useResume", () => ({
  getCandidates: vi.fn(),
}));

// ✅ Mock ResumeAddEdit component
vi.mock("../components/resumeAddEdit", () => ({
  default: ({ visible, onHide, onSuccess }: any) =>
    visible ? (
      <div data-testid="resume-add-edit">
        <button onClick={onSuccess}>AddEdit Success</button>
        <button onClick={onHide}>Close AddEdit</button>
      </div>
    ) : null,
}));

// ✅ Mock ResumeDelete component
vi.mock("../components/resumeDelete", () => ({
  default: ({ visible, onHide, onSuccess }: any) =>
    visible ? (
      <div data-testid="resume-delete">
        <button onClick={onSuccess}>Delete Success</button>
        <button onClick={onHide}>Close Delete</button>
      </div>
    ) : null,
}));

// ✅ Mock shared buttons
vi.mock("../../../shared/AddButton", () => ({
  default: ({ onClick }: any) => <button onClick={onClick}>Add</button>,
}));
vi.mock("../../../shared/EditButton", () => ({
  default: ({ onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      Edit
    </button>
  ),
}));
vi.mock("../../../shared/DeleteButton", () => ({
  default: ({ onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      Delete
    </button>
  ),
}));

describe("ResumeTable Component", () => {
  const mockResumes = [
    { candidateId: 1, candidateName: "John Doe", resumeFilename: "resume.pdf" },
    { candidateId: 2, candidateName: "Jane Smith", resumeFilename: "" },
  ];

  const mockGetCandidates = getCandidates as unknown as vi.Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCandidates.mockResolvedValue(mockResumes);
  });

  it("renders table and loads resumes", async () => {
    render(<ResumeTable />);

    expect(await screen.findByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("opens AddEdit dialog when Add button is clicked and refreshes data after success", async () => {
    render(<ResumeTable />);

    await screen.findByText("John Doe"); // ensure data loaded

    fireEvent.click(screen.getByText("Add"));
    expect(screen.getByTestId("resume-add-edit")).toBeInTheDocument();

    fireEvent.click(screen.getByText("AddEdit Success"));
    await waitFor(() => expect(mockGetCandidates).toHaveBeenCalledTimes(2)); // initial + refresh
  });

  it("opens AddEdit dialog when Edit button is clicked after selecting a resume", async () => {
    render(<ResumeTable />);

    fireEvent.click(await screen.findByText("John Doe")); // select row
    fireEvent.click(screen.getByText("Edit"));

    expect(screen.getByTestId("resume-add-edit")).toBeInTheDocument();
  });

  it("disables Edit/Delete if no resume is selected", async () => {
    render(<ResumeTable />);
    await screen.findByText("John Doe"); // wait for load

    expect(screen.getByText("Edit")).toBeDisabled();
    expect(screen.getByText("Delete")).toBeDisabled();
  });

  it("opens Delete dialog and refreshes data after success", async () => {
    render(<ResumeTable />);

    fireEvent.click(await screen.findByText("John Doe"));
    fireEvent.click(screen.getByText("Delete"));

    expect(screen.getByTestId("resume-delete")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Delete Success"));
    await waitFor(() => expect(mockGetCandidates).toHaveBeenCalledTimes(2)); // initial + after delete
  });

  it("renders fallback text if resume file not available", async () => {
    render(<ResumeTable />);

    expect(await screen.findByText("No Resume")).toBeInTheDocument();
  });
});
