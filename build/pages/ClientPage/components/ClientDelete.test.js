import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ClientDelete.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ClientDelete from "../components/clientDelete";
// Mock PrimeReact Dialog
vi.mock("primereact/dialog", () => ({
    Dialog: ({ children, footer, visible, header }) => visible ? (_jsxs("div", { "data-testid": "dialog", children: [_jsx("div", { "data-testid": "dialog-header", children: header }), _jsx("div", { "data-testid": "dialog-content", children: children }), _jsx("div", { "data-testid": "dialog-footer", children: footer })] })) : null,
}));
// Mock DialogDeleteButton
vi.mock("../../../shared/DialogDeleteButton", () => ({
    default: ({ onCancel, onDelete }) => (_jsxs("div", { "data-testid": "dialog-delete-button", children: [_jsx("button", { onClick: onCancel, "data-testid": "cancel-button", children: "Cancel" }), _jsx("button", { onClick: onDelete, "data-testid": "delete-button", children: "Delete" })] })),
}));
describe("ClientDelete", () => {
    const mockClient = {
        clientId: 1,
        clientName: "SpaceX",
        address: "Mars Base",
    };
    const mockOnHide = vi.fn();
    const mockOnDelete = vi.fn();
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it("renders dialog when visible is true", () => {
        render(_jsx(ClientDelete, { visible: true, onHide: mockOnHide, onDelete: mockOnDelete, client: mockClient }));
        expect(screen.getByTestId("dialog")).toBeInTheDocument();
        expect(screen.getByTestId("dialog-header")).toHaveTextContent("Confirm Delete");
    });
    it("does not render dialog when visible is false", () => {
        render(_jsx(ClientDelete, { visible: false, onHide: mockOnHide, onDelete: mockOnDelete, client: mockClient }));
        expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
    });
    it("displays client name in confirmation message", () => {
        render(_jsx(ClientDelete, { visible: true, onHide: mockOnHide, onDelete: mockOnDelete, client: mockClient }));
        expect(screen.getByText(/Are you sure you want to delete client/)).toBeInTheDocument();
        expect(screen.getByText("SpaceX")).toBeInTheDocument();
    });
    it("displays fallback text when client name is not available", () => {
        render(_jsx(ClientDelete, { visible: true, onHide: mockOnHide, onDelete: mockOnDelete, client: null }));
        expect(screen.getByText(/Are you sure you want to delete client/)).toBeInTheDocument();
        expect(screen.getByText("this client")).toBeInTheDocument();
    });
    it("calls onHide when cancel button is clicked", () => {
        render(_jsx(ClientDelete, { visible: true, onHide: mockOnHide, onDelete: mockOnDelete, client: mockClient }));
        const cancelButton = screen.getByTestId("cancel-button");
        fireEvent.click(cancelButton);
        expect(mockOnHide).toHaveBeenCalledTimes(1);
        expect(mockOnDelete).not.toHaveBeenCalled();
    });
    it("calls onDelete with client and onHide when delete button is clicked", () => {
        render(_jsx(ClientDelete, { visible: true, onHide: mockOnHide, onDelete: mockOnDelete, client: mockClient }));
        const deleteButton = screen.getByTestId("delete-button");
        fireEvent.click(deleteButton);
        expect(mockOnDelete).toHaveBeenCalledTimes(1);
        expect(mockOnDelete).toHaveBeenCalledWith(mockClient);
        expect(mockOnHide).toHaveBeenCalledTimes(1);
    });
    it("calls onDelete with null when client is null", () => {
        render(_jsx(ClientDelete, { visible: true, onHide: mockOnHide, onDelete: mockOnDelete, client: null }));
        const deleteButton = screen.getByTestId("delete-button");
        fireEvent.click(deleteButton);
        expect(mockOnDelete).toHaveBeenCalledTimes(1);
        expect(mockOnDelete).toHaveBeenCalledWith(null);
        expect(mockOnHide).toHaveBeenCalledTimes(1);
    });
    it("renders DialogDeleteButton component", () => {
        render(_jsx(ClientDelete, { visible: true, onHide: mockOnHide, onDelete: mockOnDelete, client: mockClient }));
        expect(screen.getByTestId("dialog-delete-button")).toBeInTheDocument();
    });
    it("handles delete action for client with undefined name", () => {
        const clientWithoutName = {
            clientId: 2,
            clientName: "",
            address: "Test Address",
        };
        render(_jsx(ClientDelete, { visible: true, onHide: mockOnHide, onDelete: mockOnDelete, client: clientWithoutName }));
        expect(screen.getByText("this client")).toBeInTheDocument();
    });
    it("maintains proper dialog structure with header, content, and footer", () => {
        render(_jsx(ClientDelete, { visible: true, onHide: mockOnHide, onDelete: mockOnDelete, client: mockClient }));
        expect(screen.getByTestId("dialog-header")).toBeInTheDocument();
        expect(screen.getByTestId("dialog-content")).toBeInTheDocument();
        expect(screen.getByTestId("dialog-footer")).toBeInTheDocument();
    });
    it("calls onDelete before onHide in correct order", () => {
        const callOrder = [];
        const trackingOnDelete = vi.fn(() => {
            callOrder.push("delete");
        });
        const trackingOnHide = vi.fn(() => {
            callOrder.push("hide");
        });
        render(_jsx(ClientDelete, { visible: true, onHide: trackingOnHide, onDelete: trackingOnDelete, client: mockClient }));
        const deleteButton = screen.getByTestId("delete-button");
        fireEvent.click(deleteButton);
        expect(callOrder).toEqual(["delete", "hide"]);
    });
});
