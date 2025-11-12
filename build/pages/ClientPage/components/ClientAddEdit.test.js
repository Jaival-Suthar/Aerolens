import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ClientAddEdit.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ClientAddEdit from "../components/clientAddEdit";
// Mock PrimeReact Dialog
vi.mock("primereact/dialog", () => ({
    Dialog: ({ children, footer, visible, header, onHide }) => visible ? (_jsxs("div", { "data-testid": "dialog", children: [_jsx("div", { "data-testid": "dialog-header", children: header }), _jsx("div", { "data-testid": "dialog-content", children: children }), _jsx("div", { "data-testid": "dialog-footer", children: footer }), _jsx("button", { onClick: onHide, "data-testid": "dialog-close", children: "Close" })] })) : null,
}));
// Mock PrimeReact InputText
vi.mock("primereact/inputtext", () => ({
    InputText: ({ id, value, onChange, className, autoFocus }) => (_jsx("input", { id: id, "data-testid": id, value: value, onChange: onChange, className: className, autoFocus: autoFocus })),
}));
// Mock DialogButton
vi.mock("../../../shared/DialogAddEditButton", () => ({
    default: ({ label, onClick, severity }) => (_jsx("button", { onClick: onClick, "data-testid": `button-${label.toLowerCase().replace(/\s+/g, "-")}`, "data-severity": severity, children: label })),
}));
// Mock react-icons
vi.mock("react-icons/fa", () => ({
    FaCheck: () => _jsx("span", { "data-testid": "check-icon" }),
}));
describe("ClientAddEdit", () => {
    const mockOnHide = vi.fn();
    const mockOnSave = vi.fn();
    const mockClient = {
        clientId: 1,
        clientName: "SpaceX",
        address: "Mars Base",
    };
    beforeEach(() => {
        vi.clearAllMocks();
    });
    describe("Add Mode", () => {
        it("renders dialog with 'Add New Client' header in add mode", () => {
            render(_jsx(ClientAddEdit, { visible: true, onHide: mockOnHide, onSave: mockOnSave, mode: "add", client: null }));
            expect(screen.getByTestId("dialog-header")).toHaveTextContent("Add New Client");
        });
        it("renders empty form fields in add mode", () => {
            render(_jsx(ClientAddEdit, { visible: true, onHide: mockOnHide, onSave: mockOnSave, mode: "add", client: null }));
            const clientNameInput = screen.getByTestId("clientName");
            const addressInput = screen.getByTestId("address");
            expect(clientNameInput.value).toBe("");
            expect(addressInput.value).toBe("");
        });
        it("shows 'Add Client' button in add mode", () => {
            render(_jsx(ClientAddEdit, { visible: true, onHide: mockOnHide, onSave: mockOnSave, mode: "add", client: null }));
            expect(screen.getByTestId("button-add-client")).toBeInTheDocument();
        });
        it("calls onSave with ClientAddType when form is valid in add mode", async () => {
            render(_jsx(ClientAddEdit, { visible: true, onHide: mockOnHide, onSave: mockOnSave, mode: "add", client: null }));
            const clientNameInput = screen.getByTestId("clientName");
            const addressInput = screen.getByTestId("address");
            const submitButton = screen.getByTestId("button-add-client");
            await userEvent.type(clientNameInput, "Tesla");
            await userEvent.type(addressInput, "Gigafactory");
            fireEvent.click(submitButton);
            expect(mockOnSave).toHaveBeenCalledTimes(1);
            expect(mockOnSave).toHaveBeenCalledWith({
                clientName: "Tesla",
                address: "Gigafactory",
            });
        });
        it("trims whitespace from inputs before saving in add mode", async () => {
            render(_jsx(ClientAddEdit, { visible: true, onHide: mockOnHide, onSave: mockOnSave, mode: "add", client: null }));
            const clientNameInput = screen.getByTestId("clientName");
            const addressInput = screen.getByTestId("address");
            const submitButton = screen.getByTestId("button-add-client");
            await userEvent.type(clientNameInput, "  Tesla  ");
            await userEvent.type(addressInput, "  Gigafactory  ");
            fireEvent.click(submitButton);
            expect(mockOnSave).toHaveBeenCalledWith({
                clientName: "Tesla",
                address: "Gigafactory",
            });
        });
    });
    describe("Edit Mode", () => {
        it("renders dialog with 'Edit Client' header in edit mode", () => {
            render(_jsx(ClientAddEdit, { visible: true, onHide: mockOnHide, onSave: mockOnSave, mode: "edit", client: mockClient }));
            expect(screen.getByTestId("dialog-header")).toHaveTextContent("Edit Client");
        });
        it("populates form fields with client data in edit mode", () => {
            render(_jsx(ClientAddEdit, { visible: true, onHide: mockOnHide, onSave: mockOnSave, mode: "edit", client: mockClient }));
            const clientNameInput = screen.getByTestId("clientName");
            const addressInput = screen.getByTestId("address");
            expect(clientNameInput.value).toBe("SpaceX");
            expect(addressInput.value).toBe("Mars Base");
        });
        it("shows 'Update Client' button in edit mode", () => {
            render(_jsx(ClientAddEdit, { visible: true, onHide: mockOnHide, onSave: mockOnSave, mode: "edit", client: mockClient }));
            expect(screen.getByTestId("button-update-client")).toBeInTheDocument();
        });
        it("calls onSave with ClientType including clientId in edit mode", async () => {
            render(_jsx(ClientAddEdit, { visible: true, onHide: mockOnHide, onSave: mockOnSave, mode: "edit", client: mockClient }));
            const clientNameInput = screen.getByTestId("clientName");
            const addressInput = screen.getByTestId("address");
            const submitButton = screen.getByTestId("button-update-client");
            await userEvent.clear(clientNameInput);
            await userEvent.type(clientNameInput, "SpaceX Updated");
            await userEvent.clear(addressInput);
            await userEvent.type(addressInput, "Moon Base");
            fireEvent.click(submitButton);
            expect(mockOnSave).toHaveBeenCalledTimes(1);
            expect(mockOnSave).toHaveBeenCalledWith({
                clientId: 1,
                clientName: "SpaceX Updated",
                address: "Moon Base",
            });
        });
        it("does not call onSave if clientId is missing in edit mode", async () => {
            const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => { });
            const clientWithoutId = { clientName: "Test", address: "Test Address" };
            render(_jsx(ClientAddEdit, { visible: true, onHide: mockOnHide, onSave: mockOnSave, mode: "edit", client: clientWithoutId }));
            const submitButton = screen.getByTestId("button-update-client");
            fireEvent.click(submitButton);
            expect(consoleErrorSpy).toHaveBeenCalledWith("Missing clientId in edit mode");
            expect(mockOnSave).not.toHaveBeenCalled();
            consoleErrorSpy.mockRestore();
        });
    });
    describe("Validation", () => {
        it("shows error when client name is empty", async () => {
            render(_jsx(ClientAddEdit, { visible: true, onHide: mockOnHide, onSave: mockOnSave, mode: "add", client: null }));
            const submitButton = screen.getByTestId("button-add-client");
            fireEvent.click(submitButton);
            await waitFor(() => {
                expect(screen.getByText("Client Name is required")).toBeInTheDocument();
            });
            expect(mockOnSave).not.toHaveBeenCalled();
        });
        it("shows error when address is empty", async () => {
            render(_jsx(ClientAddEdit, { visible: true, onHide: mockOnHide, onSave: mockOnSave, mode: "add", client: null }));
            const submitButton = screen.getByTestId("button-add-client");
            fireEvent.click(submitButton);
            await waitFor(() => {
                expect(screen.getByText("Address is required")).toBeInTheDocument();
            });
            expect(mockOnSave).not.toHaveBeenCalled();
        });
        it("shows both errors when both fields are empty", async () => {
            render(_jsx(ClientAddEdit, { visible: true, onHide: mockOnHide, onSave: mockOnSave, mode: "add", client: null }));
            const submitButton = screen.getByTestId("button-add-client");
            fireEvent.click(submitButton);
            await waitFor(() => {
                expect(screen.getByText("Client Name is required")).toBeInTheDocument();
                expect(screen.getByText("Address is required")).toBeInTheDocument();
            });
            expect(mockOnSave).not.toHaveBeenCalled();
        });
        it("clears error when user starts typing in client name field", async () => {
            render(_jsx(ClientAddEdit, { visible: true, onHide: mockOnHide, onSave: mockOnSave, mode: "add", client: null }));
            const submitButton = screen.getByTestId("button-add-client");
            const clientNameInput = screen.getByTestId("clientName");
            fireEvent.click(submitButton);
            await waitFor(() => {
                expect(screen.getByText("Client Name is required")).toBeInTheDocument();
            });
            await userEvent.type(clientNameInput, "T");
            await waitFor(() => {
                expect(screen.queryByText("Client Name is required")).not.toBeInTheDocument();
            });
        });
        it("clears error when user starts typing in address field", async () => {
            render(_jsx(ClientAddEdit, { visible: true, onHide: mockOnHide, onSave: mockOnSave, mode: "add", client: null }));
            const submitButton = screen.getByTestId("button-add-client");
            const addressInput = screen.getByTestId("address");
            fireEvent.click(submitButton);
            await waitFor(() => {
                expect(screen.getByText("Address is required")).toBeInTheDocument();
            });
            await userEvent.type(addressInput, "A");
            await waitFor(() => {
                expect(screen.queryByText("Address is required")).not.toBeInTheDocument();
            });
        });
        it("does not submit when only whitespace is entered", async () => {
            render(_jsx(ClientAddEdit, { visible: true, onHide: mockOnHide, onSave: mockOnSave, mode: "add", client: null }));
            const clientNameInput = screen.getByTestId("clientName");
            const addressInput = screen.getByTestId("address");
            const submitButton = screen.getByTestId("button-add-client");
            await userEvent.type(clientNameInput, "   ");
            await userEvent.type(addressInput, "   ");
            fireEvent.click(submitButton);
            await waitFor(() => {
                expect(screen.getByText("Client Name is required")).toBeInTheDocument();
                expect(screen.getByText("Address is required")).toBeInTheDocument();
            });
            expect(mockOnSave).not.toHaveBeenCalled();
        });
    });
    describe("Dialog Visibility and Reset", () => {
        it("does not render when visible is false", () => {
            render(_jsx(ClientAddEdit, { visible: false, onHide: mockOnHide, onSave: mockOnSave, mode: "add", client: null }));
            expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
        });
        it("resets form when dialog closes", async () => {
            const { rerender } = render(_jsx(ClientAddEdit, { visible: true, onHide: mockOnHide, onSave: mockOnSave, mode: "add", client: null }));
            const clientNameInput = screen.getByTestId("clientName");
            const addressInput = screen.getByTestId("address");
            await userEvent.type(clientNameInput, "Tesla");
            await userEvent.type(addressInput, "Factory");
            const cancelButton = screen.getByTestId("button-cancel");
            fireEvent.click(cancelButton);
            expect(mockOnHide).toHaveBeenCalled();
            rerender(_jsx(ClientAddEdit, { visible: true, onHide: mockOnHide, onSave: mockOnSave, mode: "add", client: null }));
            const newClientNameInput = screen.getByTestId("clientName");
            const newAddressInput = screen.getByTestId("address");
            expect(newClientNameInput.value).toBe("");
            expect(newAddressInput.value).toBe("");
        });
        it("clears errors when dialog reopens", async () => {
            const { rerender } = render(_jsx(ClientAddEdit, { visible: true, onHide: mockOnHide, onSave: mockOnSave, mode: "add", client: null }));
            const submitButton = screen.getByTestId("button-add-client");
            fireEvent.click(submitButton);
            await waitFor(() => {
                expect(screen.getByText("Client Name is required")).toBeInTheDocument();
            });
            rerender(_jsx(ClientAddEdit, { visible: false, onHide: mockOnHide, onSave: mockOnSave, mode: "add", client: null }));
            rerender(_jsx(ClientAddEdit, { visible: true, onHide: mockOnHide, onSave: mockOnSave, mode: "add", client: null }));
            expect(screen.queryByText("Client Name is required")).not.toBeInTheDocument();
            expect(screen.queryByText("Address is required")).not.toBeInTheDocument();
        });
    });
    describe("Cancel Functionality", () => {
        it("calls onHide when cancel button is clicked", () => {
            render(_jsx(ClientAddEdit, { visible: true, onHide: mockOnHide, onSave: mockOnSave, mode: "add", client: null }));
            const cancelButton = screen.getByTestId("button-cancel");
            fireEvent.click(cancelButton);
            expect(mockOnHide).toHaveBeenCalledTimes(1);
            expect(mockOnSave).not.toHaveBeenCalled();
        });
        it("calls onHide when dialog close button is clicked", () => {
            render(_jsx(ClientAddEdit, { visible: true, onHide: mockOnHide, onSave: mockOnSave, mode: "add", client: null }));
            const closeButton = screen.getByTestId("dialog-close");
            fireEvent.click(closeButton);
            expect(mockOnHide).toHaveBeenCalled();
        });
    });
    describe("Form Fields", () => {
        it("renders required field indicators", () => {
            render(_jsx(ClientAddEdit, { visible: true, onHide: mockOnHide, onSave: mockOnSave, mode: "add", client: null }));
            const requiredIndicators = screen.getAllByText("*");
            expect(requiredIndicators).toHaveLength(2);
        });
        it("sets autofocus on client name field", () => {
            render(_jsx(ClientAddEdit, { visible: true, onHide: mockOnHide, onSave: mockOnSave, mode: "add", client: null }));
            const clientNameInput = screen.getByTestId("clientName");
            //   expect(clientNameInput).toHaveAttribute("autoFocus");
            expect(document.activeElement).toBe(clientNameInput);
        });
        it("applies p-invalid class when field has error", async () => {
            render(_jsx(ClientAddEdit, { visible: true, onHide: mockOnHide, onSave: mockOnSave, mode: "add", client: null }));
            const submitButton = screen.getByTestId("button-add-client");
            fireEvent.click(submitButton);
            await waitFor(() => {
                const clientNameInput = screen.getByTestId("clientName");
                expect(clientNameInput).toHaveClass("p-invalid");
            });
        });
    });
    describe("Mode Defaults", () => {
        it("defaults to add mode when mode prop is not provided", () => {
            render(_jsx(ClientAddEdit, { visible: true, onHide: mockOnHide, onSave: mockOnSave, client: null }));
            expect(screen.getByTestId("dialog-header")).toHaveTextContent("Add New Client");
            expect(screen.getByTestId("button-add-client")).toBeInTheDocument();
        });
    });
});
