import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import ResumeDelete from "../components/resumeDelete";
// ---- Hoisted mocks (must be declared before vi.mock calls) ----
const mockDeleteCandidate = vi.hoisted(() => vi.fn());
// ---- Mock AuthContext ----
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
// ---- Mock deleteCandidate ----
vi.mock("../services/useResume", () => ({
    deleteCandidate: mockDeleteCandidate,
}));
// ---- Mock Toast ----
vi.mock("primereact/toast", () => ({
    Toast: React.forwardRef((_props, ref) => {
        React.useImperativeHandle(ref, () => ({
            show: vi.fn(),
        }));
        return _jsx("div", { "data-testid": "toast" });
    }),
}));
// ---- Mock Dialog + Button ----
vi.mock("primereact/dialog", () => ({
    Dialog: ({ visible, header, footer, children }) => visible ? (_jsxs("div", { "data-testid": "dialog", children: [_jsx("h3", { children: header }), children, footer] })) : null,
}));
vi.mock("../../../shared/DialogDeleteButton", () => ({
    default: ({ onCancel, onDelete }) => (_jsxs("div", { "data-testid": "dialog-buttons", children: [_jsx("button", { onClick: onCancel, children: "Cancel" }), _jsx("button", { onClick: onDelete, children: "Delete" })] })),
}));
describe("ResumeDelete Component", () => {
    const mockOnHide = vi.fn();
    const mockOnSuccess = vi.fn();
    const mockOnClearSelection = vi.fn();
    const candidate = {
        candidateId: 1,
        candidateName: "John Doe",
        contactNumber: "1234567890",
        email: "john@example.com",
        recruiterName: "Alice",
        jobRole: "Frontend Developer",
        preferredJobLocation: "Remote",
        currentCTC: 600000,
        expectedCTC: 800000,
        noticePeriod: 30,
        experienceYears: 3,
        statusName: "Active",
        linkedinProfileUrl: "https://linkedin.com/in/john",
    };
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it("renders dialog with candidate info when visible", () => {
        render(_jsx(ResumeDelete, { visible: true, onHide: mockOnHide, selectedResume: candidate, onSuccess: mockOnSuccess, onClearSelection: mockOnClearSelection }));
        expect(screen.getByTestId("dialog")).toBeInTheDocument();
        expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    });
    it("does not render dialog when visible=false", () => {
        render(_jsx(ResumeDelete, { visible: false, onHide: mockOnHide, selectedResume: candidate, onSuccess: mockOnSuccess, onClearSelection: mockOnClearSelection }));
        expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
    });
    it("calls deleteCandidate and callbacks on success", async () => {
        mockDeleteCandidate.mockResolvedValueOnce({});
        render(_jsx(ResumeDelete, { visible: true, onHide: mockOnHide, selectedResume: candidate, onSuccess: mockOnSuccess, onClearSelection: mockOnClearSelection }));
        await userEvent.click(screen.getByText("Delete"));
        await waitFor(() => {
            expect(mockDeleteCandidate).toHaveBeenCalledWith("mock-token-123", 1);
            expect(mockOnClearSelection).toHaveBeenCalled();
            expect(mockOnSuccess).toHaveBeenCalled();
            expect(mockOnHide).toHaveBeenCalled();
        });
    });
    it("handles error correctly when deleteCandidate rejects", async () => {
        const error = new Error("Failed to delete");
        mockDeleteCandidate.mockRejectedValueOnce(error);
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => { });
        render(_jsx(ResumeDelete, { visible: true, onHide: mockOnHide, selectedResume: candidate, onSuccess: mockOnSuccess, onClearSelection: mockOnClearSelection }));
        await userEvent.click(screen.getByText("Delete"));
        await waitFor(() => {
            expect(mockDeleteCandidate).toHaveBeenCalledWith("mock-token-123", 1);
            expect(consoleErrorSpy).toHaveBeenCalledWith("Error deleting candidate:", error);
        });
        consoleErrorSpy.mockRestore();
    });
    it("handles API error with response data message", async () => {
        const error = {
            response: {
                data: {
                    message: "Candidate not found in database",
                },
            },
        };
        mockDeleteCandidate.mockRejectedValueOnce(error);
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => { });
        render(_jsx(ResumeDelete, { visible: true, onHide: mockOnHide, selectedResume: candidate, onSuccess: mockOnSuccess, onClearSelection: mockOnClearSelection }));
        await userEvent.click(screen.getByText("Delete"));
        await waitFor(() => {
            expect(mockDeleteCandidate).toHaveBeenCalledWith("mock-token-123", 1);
            expect(consoleErrorSpy).toHaveBeenCalledWith("Error deleting candidate:", error);
        });
        consoleErrorSpy.mockRestore();
    });
    it("calls onHide when cancel is clicked", async () => {
        render(_jsx(ResumeDelete, { visible: true, onHide: mockOnHide, selectedResume: candidate, onSuccess: mockOnSuccess, onClearSelection: mockOnClearSelection }));
        await userEvent.click(screen.getByText("Cancel"));
        expect(mockOnHide).toHaveBeenCalled();
    });
    it("does nothing when delete clicked but selectedResume is null", async () => {
        render(_jsx(ResumeDelete, { visible: true, onHide: mockOnHide, selectedResume: null, onSuccess: mockOnSuccess, onClearSelection: mockOnClearSelection }));
        await userEvent.click(screen.getByText("Delete"));
        expect(mockDeleteCandidate).not.toHaveBeenCalled();
    });
    it("does nothing when delete clicked but candidateId is missing", async () => {
        const candidateWithoutId = { ...candidate, candidateId: undefined };
        render(_jsx(ResumeDelete, { visible: true, onHide: mockOnHide, selectedResume: candidateWithoutId, onSuccess: mockOnSuccess, onClearSelection: mockOnClearSelection }));
        await userEvent.click(screen.getByText("Delete"));
        expect(mockDeleteCandidate).not.toHaveBeenCalled();
    });
});
