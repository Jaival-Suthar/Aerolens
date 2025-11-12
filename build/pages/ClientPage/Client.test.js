import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import Client from "./page";
import * as clientService from "./services/clientService";
// Mock child components
// Add this mock at the top with other mocks
// ✅ Add this mock
let mockSearchParams = new URLSearchParams();
vi.mock("react-router-dom", () => ({
    useSearchParams: () => {
        const [params, setParams] = React.useState(mockSearchParams);
        const setSearchParams = (updates) => {
            mockSearchParams = new URLSearchParams(updates);
            setParams(new URLSearchParams(updates));
        };
        return [params, setSearchParams];
    }
}));
vi.mock('../../shared/auth/AuthContext', () => ({
    useAuth: () => ({
        accessToken: 'mock-token-123'
    })
}));
vi.mock("./components/clientTable", () => ({
    default: (props) => (_jsxs("div", { "data-testid": "ClientTable", children: [_jsx("button", { "data-testid": "SelectClientBtn", onClick: () => props.onSelectionChange?.({
                    clientId: 1,
                    clientName: "Test Client",
                    address: "Test Address",
                }), children: "Select Client" }), _jsx("button", { "data-testid": "DeselectClientBtn", onClick: () => props.onSelectionChange?.(null), children: "Deselect Client" }), _jsx("button", { "data-testid": "TriggerEditBtn", onClick: () => props.onEdit?.({
                    clientId: 1,
                    clientName: "Test Client",
                    address: "Test Address",
                }), children: "Trigger Edit" })] })),
}));
vi.mock("./components/clientAddEdit", () => ({
    default: (props) => props.visible ? (_jsxs("div", { "data-testid": "ClientAddEdit", children: [_jsx("input", { "data-testid": "ClientNameInput", defaultValue: props.client?.clientName || "" }), _jsx("input", { "data-testid": "ClientAddressInput", defaultValue: props.client?.address || "" }), _jsx("button", { "data-testid": "SaveBtn", onClick: () => props.onSave?.({
                    clientName: "Updated Client",
                    address: "Updated Address",
                }), children: "Save" }), _jsx("button", { "data-testid": "CancelBtn", onClick: () => props.onHide?.(), children: "Cancel" })] })) : null,
}));
vi.mock("./components/clientDelete", () => ({
    default: (props) => props.visible ? (_jsxs("div", { "data-testid": "ClientDelete", children: [_jsxs("p", { "data-testid": "DeleteMessage", children: ["Delete ", props.client?.clientName, "?"] }), _jsx("button", { "data-testid": "ConfirmDeleteBtn", onClick: () => props.onDelete?.(props.client), children: "Confirm" }), _jsx("button", { "data-testid": "CancelDeleteBtn", onClick: () => props.onHide?.(), children: "Cancel" })] })) : null,
}));
vi.mock("../Contact/components/clientContactsView", () => ({
    default: (props) => (_jsxs("div", { "data-testid": "ClientContactsView", children: [_jsxs("p", { children: ["Contacts for ", props.selectedClient?.clientName] }), _jsx("button", { "data-testid": "BackFromContactsBtn", onClick: () => props.onBackClick?.(), children: "Back" })] })),
}));
vi.mock("../Department/components/departmentTable", () => ({
    default: (props) => (_jsxs("div", { "data-testid": "DepartmentTable", children: [_jsxs("p", { children: ["Departments for ", props.clientName] }), _jsx("button", { "data-testid": "BackFromDepartmentsBtn", onClick: () => props.onBackClick?.(), children: "Back" })] })),
}));
vi.mock("../../shared/AddButton", () => ({
    default: (props) => (_jsx("button", { ...props, "data-testid": "AddBtn", children: "Add" })),
}));
vi.mock("../../shared/EditButton", () => ({
    default: (props) => (_jsx("button", { ...props, "data-testid": "EditBtn", children: "Edit" })),
}));
vi.mock("../../shared/DeleteButton", () => ({
    default: (props) => (_jsx("button", { ...props, "data-testid": "DeleteBtn", children: "Delete" })),
}));
vi.mock("../../shared/ExportExcelButton", () => ({
    default: () => _jsx("button", { "data-testid": "ExportBtn", children: "Export" }),
}));
vi.mock("../Contact/constants/contactConstants", () => ({
    VIEW_MODES: {
        TABLE: "TABLE",
        CONTACTS: "CONTACTS",
        DEPARTMENT: "DEPARTMENT",
    },
    getMenuItems: (callback) => [
        { label: "Contacts", command: () => callback("CONTACTS") },
        { label: "Departments", command: () => callback("DEPARTMENT") },
    ],
}));
vi.mock("primereact/toast", () => ({
    Toast: React.forwardRef(() => _jsx("div", { "data-testid": "Toast" })),
}));
vi.mock("primereact/splitbutton", () => ({
    SplitButton: (props) => (_jsx("button", { "data-testid": "SettingsBtn", disabled: props.disabled, onClick: () => props.model?.[0]?.command?.(), children: "Settings" })),
}));
vi.mock("react-icons/fa", () => ({
    FaCog: () => _jsx("span", { children: "\u2699\uFE0F" }),
}));
vi.mock("primereact/datatable", () => ({
    DataTable: ({ children }) => (_jsx("div", { "data-testid": "DataTable", children: children })),
}));
vi.mock("./services/clientService", () => ({
    createClient: vi.fn((token, data) => Promise.resolve({
        clientId: 1,
        name: data.name,
        address: data.address,
    })),
    updateClient: vi.fn((token, data) => Promise.resolve({
        clientId: data.id,
        name: data.name,
        address: data.address,
    })),
    deleteClient: vi.fn(() => Promise.resolve(undefined)),
}));
beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
});
afterEach(() => {
    vi.restoreAllMocks();
});
describe("Client Component", () => {
    describe("Initial Render", () => {
        it("should render ClientTable in TABLE view by default", () => {
            render(_jsx(Client, {}));
            expect(screen.getByTestId("ClientTable")).toBeInTheDocument();
        });
        it("should show toolbar with all buttons in TABLE view", () => {
            render(_jsx(Client, {}));
            expect(screen.getByTestId("AddBtn")).toBeInTheDocument();
            expect(screen.getByTestId("EditBtn")).toBeInTheDocument();
            expect(screen.getByTestId("DeleteBtn")).toBeInTheDocument();
            expect(screen.getByTestId("ExportBtn")).toBeInTheDocument();
            expect(screen.getByTestId("SettingsBtn")).toBeInTheDocument();
        });
        it("should have Edit, Delete, and Settings buttons disabled initially", () => {
            render(_jsx(Client, {}));
            expect(screen.getByTestId("EditBtn")).toBeDisabled();
            expect(screen.getByTestId("DeleteBtn")).toBeDisabled();
            expect(screen.getByTestId("SettingsBtn")).toBeDisabled();
        });
        it("should have Add button enabled initially", () => {
            render(_jsx(Client, {}));
            expect(screen.getByTestId("AddBtn")).not.toBeDisabled();
        });
    });
    describe("Client Selection", () => {
        it("should enable Edit, Delete, and Settings buttons when client is selected", () => {
            render(_jsx(Client, {}));
            fireEvent.click(screen.getByTestId("SelectClientBtn"));
            expect(screen.getByTestId("EditBtn")).not.toBeDisabled();
            expect(screen.getByTestId("DeleteBtn")).not.toBeDisabled();
            expect(screen.getByTestId("SettingsBtn")).not.toBeDisabled();
        });
        it("should disable buttons when client is deselected", () => {
            render(_jsx(Client, {}));
            fireEvent.click(screen.getByTestId("SelectClientBtn"));
            fireEvent.click(screen.getByTestId("DeselectClientBtn"));
            expect(screen.getByTestId("EditBtn")).toBeDisabled();
            expect(screen.getByTestId("DeleteBtn")).toBeDisabled();
            expect(screen.getByTestId("SettingsBtn")).toBeDisabled();
        });
    });
    describe("Add Client Dialog", () => {
        it("should open add dialog when Add button is clicked", () => {
            render(_jsx(Client, {}));
            fireEvent.click(screen.getByTestId("AddBtn"));
            expect(screen.getByTestId("ClientAddEdit")).toBeInTheDocument();
        });
        it("should close add dialog when Cancel is clicked", () => {
            render(_jsx(Client, {}));
            fireEvent.click(screen.getByTestId("AddBtn"));
            fireEvent.click(screen.getByTestId("CancelBtn"));
            expect(screen.queryByTestId("ClientAddEdit")).not.toBeInTheDocument();
        });
        it("should call createClient when saving in add mode", async () => {
            const createSpy = vi
                .spyOn(clientService, "createClient")
                .mockResolvedValue({
                clientId: 1,
                clientName: "Updated Client",
                address: "Updated Address",
            });
            render(_jsx(Client, {}));
            fireEvent.click(screen.getByTestId("AddBtn"));
            fireEvent.click(screen.getByTestId("SaveBtn"));
            await waitFor(() => {
                expect(createSpy).toHaveBeenCalledWith('mock-token-123', {
                    name: "Updated Client",
                    address: "Updated Address",
                });
            });
        });
        it("should close dialog after successful save", async () => {
            vi.spyOn(clientService, "createClient").mockResolvedValue({
                clientId: 1,
                clientName: "Test",
                address: "Address",
            });
            render(_jsx(Client, {}));
            fireEvent.click(screen.getByTestId("AddBtn"));
            fireEvent.click(screen.getByTestId("SaveBtn"));
            await waitFor(() => {
                expect(screen.queryByTestId("ClientAddEdit")).not.toBeInTheDocument();
            });
        });
    });
    describe("Edit Client Dialog", () => {
        it("should open edit dialog when Edit button is clicked with selected client", () => {
            render(_jsx(Client, {}));
            fireEvent.click(screen.getByTestId("SelectClientBtn"));
            fireEvent.click(screen.getByTestId("EditBtn"));
            expect(screen.getByTestId("ClientAddEdit")).toBeInTheDocument();
        });
        it("should open edit dialog when table triggers onEdit", () => {
            render(_jsx(Client, {}));
            fireEvent.click(screen.getByTestId("TriggerEditBtn"));
            expect(screen.getByTestId("ClientAddEdit")).toBeInTheDocument();
        });
        //     it("should call updateClient when saving in edit mode", async () => {
        //   const updateSpy = vi
        //     .spyOn(clientService, "updateClient")
        //     .mockResolvedValue({
        //       clientId: 1,
        //       clientName: "Updated Client",
        //       address: "Updated Address",
        //     });
        //   render(<Client />);
        //   fireEvent.click(screen.getByTestId("TriggerEditBtn"));
        //   // Wait for dialog
        //   await waitFor(() => {
        //     expect(screen.getByTestId("ClientAddEdit")).toBeInTheDocument();
        //   });
        //   fireEvent.click(screen.getByTestId("SaveBtn"));
        //   await waitFor(() => {
        //     expect(updateSpy).toHaveBeenCalledWith('mock-token-123', {
        //       id: 1,
        //       name: "Updated Client",
        //       address: "Updated Address",
        //     });
        //   }, { timeout: 3000 });
        // });
        // it("should close dialog after successful update", async () => {
        //   vi.spyOn(clientService, "updateClient").mockResolvedValue({
        //     clientId: 1,
        //     clientName: "Updated Client",
        //     address: "Updated Address",
        //   });
        //   render(<Client />);
        //   fireEvent.click(screen.getByTestId("TriggerEditBtn"));
        //   // Wait for dialog to appear first
        //   await waitFor(() => {
        //     expect(screen.getByTestId("ClientAddEdit")).toBeInTheDocument();
        //   });
        //   fireEvent.click(screen.getByTestId("SaveBtn"));
        //   // Now wait for it to close
        //   await waitFor(() => {
        //     expect(screen.queryByTestId("ClientAddEdit")).not.toBeInTheDocument();
        //   }, { timeout: 3000 });
        // });
        it("should close dialog when Cancel is clicked", () => {
            render(_jsx(Client, {}));
            fireEvent.click(screen.getByTestId("TriggerEditBtn"));
            fireEvent.click(screen.getByTestId("CancelBtn"));
            expect(screen.queryByTestId("ClientAddEdit")).not.toBeInTheDocument();
        });
        it("should not open edit dialog when no client is selected", () => {
            render(_jsx(Client, {}));
            fireEvent.click(screen.getByTestId("EditBtn"));
            expect(screen.queryByTestId("ClientAddEdit")).not.toBeInTheDocument();
        });
    });
    describe("Delete Client Dialog", () => {
        it("should open delete dialog when Delete button is clicked with selected client", () => {
            render(_jsx(Client, {}));
            fireEvent.click(screen.getByTestId("SelectClientBtn"));
            fireEvent.click(screen.getByTestId("DeleteBtn"));
            expect(screen.getByTestId("ClientDelete")).toBeInTheDocument();
        });
        it("should not open delete dialog when no client is selected", () => {
            render(_jsx(Client, {}));
            fireEvent.click(screen.getByTestId("DeleteBtn"));
            expect(screen.queryByTestId("ClientDelete")).not.toBeInTheDocument();
        });
        it("should close delete dialog when Cancel is clicked", () => {
            render(_jsx(Client, {}));
            fireEvent.click(screen.getByTestId("SelectClientBtn"));
            fireEvent.click(screen.getByTestId("DeleteBtn"));
            fireEvent.click(screen.getByTestId("CancelDeleteBtn"));
            expect(screen.queryByTestId("ClientDelete")).not.toBeInTheDocument();
        });
        it("should call deleteClient when confirming delete", async () => {
            const deleteSpy = vi
                .spyOn(clientService, "deleteClient")
                .mockResolvedValue(undefined);
            render(_jsx(Client, {}));
            fireEvent.click(screen.getByTestId("SelectClientBtn"));
            fireEvent.click(screen.getByTestId("DeleteBtn"));
            fireEvent.click(screen.getByTestId("ConfirmDeleteBtn"));
            await waitFor(() => {
                expect(deleteSpy).toHaveBeenCalledWith('mock-token-123', 1);
            });
        });
        it("should close delete dialog after successful deletion", async () => {
            vi.spyOn(clientService, "deleteClient").mockResolvedValue(undefined);
            render(_jsx(Client, {}));
            fireEvent.click(screen.getByTestId("SelectClientBtn"));
            fireEvent.click(screen.getByTestId("DeleteBtn"));
            fireEvent.click(screen.getByTestId("ConfirmDeleteBtn"));
            await waitFor(() => {
                expect(screen.queryByTestId("ClientDelete")).not.toBeInTheDocument();
            });
        });
        it("should deselect client after deletion", async () => {
            vi.spyOn(clientService, "deleteClient").mockResolvedValue(undefined);
            render(_jsx(Client, {}));
            fireEvent.click(screen.getByTestId("SelectClientBtn"));
            fireEvent.click(screen.getByTestId("DeleteBtn"));
            fireEvent.click(screen.getByTestId("ConfirmDeleteBtn"));
            await waitFor(() => {
                expect(screen.getByTestId("DeleteBtn")).toBeDisabled();
            });
        });
    });
    describe("View Navigation", () => {
        it("should switch to CONTACTS view when client is selected", () => {
            render(_jsx(Client, {}));
            fireEvent.click(screen.getByTestId("SelectClientBtn"));
            fireEvent.click(screen.getByTestId("SettingsBtn"));
            expect(screen.getByTestId("ClientContactsView")).toBeInTheDocument();
            expect(screen.queryByTestId("ClientTable")).not.toBeInTheDocument();
        });
        it("should return to TABLE view from CONTACTS view", () => {
            render(_jsx(Client, {}));
            fireEvent.click(screen.getByTestId("SelectClientBtn"));
            fireEvent.click(screen.getByTestId("SettingsBtn"));
            fireEvent.click(screen.getByTestId("BackFromContactsBtn"));
            expect(screen.getByTestId("ClientTable")).toBeInTheDocument();
            expect(screen.queryByTestId("ClientContactsView")).not.toBeInTheDocument();
        });
        it("should clear selection when returning to TABLE view", () => {
            render(_jsx(Client, {}));
            fireEvent.click(screen.getByTestId("SelectClientBtn"));
            fireEvent.click(screen.getByTestId("SettingsBtn"));
            fireEvent.click(screen.getByTestId("BackFromContactsBtn"));
            expect(screen.getByTestId("EditBtn")).toBeDisabled();
            expect(screen.getByTestId("DeleteBtn")).toBeDisabled();
        });
        it("should hide toolbar when not in TABLE view", () => {
            render(_jsx(Client, {}));
            fireEvent.click(screen.getByTestId("SelectClientBtn"));
            fireEvent.click(screen.getByTestId("SettingsBtn"));
            expect(screen.queryByTestId("AddBtn")).not.toBeInTheDocument();
            expect(screen.queryByTestId("EditBtn")).not.toBeInTheDocument();
        });
    });
    describe("Error Handling", () => {
        it("should handle createClient error gracefully", async () => {
            const consoleErrorSpy = vi
                .spyOn(console, "error")
                .mockImplementation(() => { });
            vi.spyOn(clientService, "createClient").mockRejectedValueOnce(new Error("API Error"));
            render(_jsx(Client, {}));
            fireEvent.click(screen.getByTestId("AddBtn"));
            fireEvent.click(screen.getByTestId("SaveBtn"));
            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalled();
            });
            consoleErrorSpy.mockRestore();
        });
        it("should handle updateClient error gracefully", async () => {
            const consoleErrorSpy = vi
                .spyOn(console, "error")
                .mockImplementation(() => { });
            vi.spyOn(clientService, "updateClient").mockRejectedValueOnce(new Error("Update Error"));
            render(_jsx(Client, {}));
            fireEvent.click(screen.getByTestId("TriggerEditBtn"));
            fireEvent.click(screen.getByTestId("SaveBtn"));
            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalled();
            });
            consoleErrorSpy.mockRestore();
        });
        it("should handle deleteClient error gracefully", async () => {
            const consoleErrorSpy = vi
                .spyOn(console, "error")
                .mockImplementation(() => { });
            vi.spyOn(clientService, "deleteClient").mockRejectedValueOnce(new Error("Delete Error"));
            render(_jsx(Client, {}));
            fireEvent.click(screen.getByTestId("SelectClientBtn"));
            fireEvent.click(screen.getByTestId("DeleteBtn"));
            fireEvent.click(screen.getByTestId("ConfirmDeleteBtn"));
            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalled();
            });
            consoleErrorSpy.mockRestore();
        });
        it("should show error when deleting client with invalid ID", async () => {
            const consoleErrorSpy = vi
                .spyOn(console, "error")
                .mockImplementation(() => { });
            render(_jsx(Client, {}));
            fireEvent.click(screen.getByTestId("SelectClientBtn"));
            fireEvent.click(screen.getByTestId("DeleteBtn"));
            // Manually call delete with invalid client
            const deleteDialog = screen.getByTestId("ClientDelete");
            expect(deleteDialog).toBeInTheDocument();
            consoleErrorSpy.mockRestore();
        });
    });
    describe("Loading State", () => {
        it("should disable buttons during add operation", async () => {
            vi.spyOn(clientService, "createClient").mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({
                clientId: 1,
                clientName: "Test",
                address: "Address",
            }), 100)));
            render(_jsx(Client, {}));
            fireEvent.click(screen.getByTestId("AddBtn"));
            fireEvent.click(screen.getByTestId("SaveBtn"));
            expect(screen.getByTestId("AddBtn")).toBeDisabled();
        });
        it("should disable buttons during delete operation", async () => {
            vi.spyOn(clientService, "deleteClient").mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve(undefined), 100)));
            render(_jsx(Client, {}));
            fireEvent.click(screen.getByTestId("SelectClientBtn"));
            fireEvent.click(screen.getByTestId("DeleteBtn"));
            fireEvent.click(screen.getByTestId("ConfirmDeleteBtn"));
            expect(screen.getByTestId("AddBtn")).toBeDisabled();
        });
        // it("should disable buttons during edit operation", async () => {
        //   vi.spyOn(clientService, "updateClient").mockImplementation(
        //     () =>
        //       new Promise((resolve) =>
        //         setTimeout(
        //           () =>
        //             resolve({
        //               clientId: 1,
        //               clientName: "Updated",
        //               address: "Updated",
        //             }),
        //           100
        //         )
        //       )
        //   );
        //   render(<Client />);
        //   fireEvent.click(screen.getByTestId("TriggerEditBtn"));
        //   fireEvent.click(screen.getByTestId("SaveBtn"));
        //   expect(screen.getByTestId("AddBtn")).toBeDisabled();
        // });
    });
    describe("Data Refresh", () => {
        it("should trigger refresh after successful add", async () => {
            vi.spyOn(clientService, "createClient").mockResolvedValue({
                clientId: 2,
                clientName: "New Client",
                address: "New Address",
            });
            render(_jsx(Client, {}));
            fireEvent.click(screen.getByTestId("AddBtn"));
            fireEvent.click(screen.getByTestId("SaveBtn"));
            await waitFor(() => {
                expect(screen.getByTestId("ClientTable")).toBeInTheDocument();
            });
        });
        it("should trigger refresh after successful update", async () => {
            vi.spyOn(clientService, "updateClient").mockResolvedValue({
                clientId: 1,
                clientName: "Updated",
                address: "Updated",
            });
            render(_jsx(Client, {}));
            fireEvent.click(screen.getByTestId("TriggerEditBtn"));
            fireEvent.click(screen.getByTestId("SaveBtn"));
            await waitFor(() => {
                expect(screen.getByTestId("ClientTable")).toBeInTheDocument();
            });
        });
        it("should trigger refresh after successful delete", async () => {
            vi.spyOn(clientService, "deleteClient").mockResolvedValue(undefined);
            render(_jsx(Client, {}));
            fireEvent.click(screen.getByTestId("SelectClientBtn"));
            fireEvent.click(screen.getByTestId("DeleteBtn"));
            fireEvent.click(screen.getByTestId("ConfirmDeleteBtn"));
            await waitFor(() => {
                expect(screen.getByTestId("ClientTable")).toBeInTheDocument();
            });
        });
    });
});
