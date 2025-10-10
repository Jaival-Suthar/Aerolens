// src/pages/Resume/components/ResumeDelete.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ResumeDelete from "../components/resumeDelete"; // Fixed path/casing
import { deleteCandidate } from "../services/useResume";

// Mock the deleteCandidate function
vi.mock("../services/useResume", () => ({
  deleteCandidate: vi.fn(),
}));

const mockOnHide = vi.fn();
const mockOnSuccess = vi.fn();
const mockOnClearSelection = vi.fn();

const selectedResume = {
  candidateId: 1,
  candidateName: "John Doe",
};

describe("ResumeDelete Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the dialog with candidate name", () => {
    render(
      <ResumeDelete
        visible={true}
        onHide={mockOnHide}
        selectedResume={selectedResume}
        onSuccess={mockOnSuccess}
        onClearSelection={mockOnClearSelection}
      />
    );

    expect(screen.getByText(/Are you sure you want to delete candidate/i)).toBeInTheDocument();
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/This action cannot be undone/i)).toBeInTheDocument();
  });

  it("calls onHide when cancel is clicked", () => {
    render(
      <ResumeDelete
        visible={true}
        onHide={mockOnHide}
        selectedResume={selectedResume}
        onSuccess={mockOnSuccess}
        onClearSelection={mockOnClearSelection}
      />
    );

    const cancelButton = screen.getByText(/Cancel/i);
    fireEvent.click(cancelButton);

    expect(mockOnHide).toHaveBeenCalledTimes(1);
  });

  it("calls deleteCandidate and success handlers when delete is clicked", async () => {
    (deleteCandidate as unknown as vi.Mock).mockResolvedValueOnce({}); // Mock success

    render(
      <ResumeDelete
        visible={true}
        onHide={mockOnHide}
        selectedResume={selectedResume}
        onSuccess={mockOnSuccess}
        onClearSelection={mockOnClearSelection}
      />
    );

    const deleteButton = screen.getByText(/Delete/i);
    fireEvent.click(deleteButton);

    // Wait for async deletion (optional)
    await screen.findByText(/Are you sure/i);

    expect(deleteCandidate).toHaveBeenCalledWith(1);
    expect(mockOnClearSelection).toHaveBeenCalled();
    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockOnHide).toHaveBeenCalled();
  });

  it("renders safely when selectedResume is null", () => {
    render(
      <ResumeDelete
        visible={true}
        onHide={mockOnHide}
        selectedResume={null}
        onSuccess={mockOnSuccess}
        onClearSelection={mockOnClearSelection}
      />
    );

    expect(screen.getByText(/Are you sure you want to delete candidate/i)).toBeInTheDocument();
    expect(screen.getByText(/N\/A/i)).toBeInTheDocument(); // fallback name
  });

  it("does nothing if delete is clicked and selectedResume is null", () => {
    render(
      <ResumeDelete
        visible={true}
        onHide={mockOnHide}
        selectedResume={null}
        onSuccess={mockOnSuccess}
        onClearSelection={mockOnClearSelection}
      />
    );

    const deleteButton = screen.getByText(/Delete/i);
    fireEvent.click(deleteButton);

    expect(deleteCandidate).not.toHaveBeenCalled();
    expect(mockOnClearSelection).not.toHaveBeenCalled();
    expect(mockOnSuccess).not.toHaveBeenCalled();
    expect(mockOnHide).not.toHaveBeenCalled();
  });
});
