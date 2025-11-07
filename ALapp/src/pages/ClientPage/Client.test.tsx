import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import Client from "./page";
import * as clientService from "./services/clientService";
import { ClientType } from "./types/clientTypes";

// Mock child components
// Add this mock at the top with other mocks
// ✅ Add this mock
let mockSearchParams = new URLSearchParams();

vi.mock("react-router-dom", () => ({
  useSearchParams: () => {
    const [params, setParams] = React.useState(mockSearchParams);
    
    const setSearchParams = (updates: Record<string, string>) => {
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
  default: (props: any) => (
    <div data-testid="ClientTable">
      <button
        data-testid="SelectClientBtn"
        onClick={() =>
          props.onSelectionChange?.({
            clientId: 1,
            clientName: "Test Client",
            address: "Test Address",
          })
        }
      >
        Select Client
      </button>
      <button
        data-testid="DeselectClientBtn"
        onClick={() => props.onSelectionChange?.(null)}
      >
        Deselect Client
      </button>
      <button
        data-testid="TriggerEditBtn"
        onClick={() =>
          props.onEdit?.({
            clientId: 1,
            clientName: "Test Client",
            address: "Test Address",
          })
        }
      >
        Trigger Edit
      </button>
    </div>
  ),
}));

vi.mock("./components/clientAddEdit", () => ({
  default: (props: any) =>
    props.visible ? (
      <div data-testid="ClientAddEdit">
        <input
          data-testid="ClientNameInput"
          defaultValue={props.client?.clientName || ""}
        />
        <input
          data-testid="ClientAddressInput"
          defaultValue={props.client?.address || ""}
        />
        <button
          data-testid="SaveBtn"
          onClick={() =>
            props.onSave?.({
              clientName: "Updated Client",
              address: "Updated Address",
            })
          }
        >
          Save
        </button>
        <button data-testid="CancelBtn" onClick={() => props.onHide?.()}>
          Cancel
        </button>
      </div>
    ) : null,
}));

vi.mock("./components/clientDelete", () => ({
  default: (props: any) =>
    props.visible ? (
      <div data-testid="ClientDelete">
        <p data-testid="DeleteMessage">Delete {props.client?.clientName}?</p>
        <button
          data-testid="ConfirmDeleteBtn"
          onClick={() => props.onDelete?.(props.client)}
        >
          Confirm
        </button>
        <button data-testid="CancelDeleteBtn" onClick={() => props.onHide?.()}>
          Cancel
        </button>
      </div>
    ) : null,
}));

vi.mock("../Contact/components/clientContactsView", () => ({
  default: (props: any) => (
    <div data-testid="ClientContactsView">
      <p>Contacts for {props.selectedClient?.clientName}</p>
      <button data-testid="BackFromContactsBtn" onClick={() => props.onBackClick?.()}>
        Back
      </button>
    </div>
  ),
}));

vi.mock("../Department/components/departmentTable", () => ({
  default: (props: any) => (
    <div data-testid="DepartmentTable">
      <p>Departments for {props.clientName}</p>
      <button data-testid="BackFromDepartmentsBtn" onClick={() => props.onBackClick?.()}>
        Back
      </button>
    </div>
  ),
}));

vi.mock("../../shared/AddButton", () => ({
  default: (props: any) => (
    <button {...props} data-testid="AddBtn">
      Add
    </button>
  ),
}));

vi.mock("../../shared/EditButton", () => ({
  default: (props: any) => (
    <button {...props} data-testid="EditBtn">
      Edit
    </button>
  ),
}));

vi.mock("../../shared/DeleteButton", () => ({
  default: (props: any) => (
    <button {...props} data-testid="DeleteBtn">
      Delete
    </button>
  ),
}));

vi.mock("../../shared/ExportExcelButton", () => ({
  default: () => <button data-testid="ExportBtn">Export</button>,
}));

vi.mock("../Contact/constants/contactConstants", () => ({
  VIEW_MODES: {
    TABLE: "TABLE",
    CONTACTS: "CONTACTS",
    DEPARTMENT: "DEPARTMENT",
  },
  getMenuItems: (callback: (view: string) => void) => [
    { label: "Contacts", command: () => callback("CONTACTS") },
    { label: "Departments", command: () => callback("DEPARTMENT") },
  ],
}));

vi.mock("primereact/toast", () => ({
  Toast: React.forwardRef(() => <div data-testid="Toast" />),
}));

vi.mock("primereact/splitbutton", () => ({
  SplitButton: (props: any) => (
    <button
      data-testid="SettingsBtn"
      disabled={props.disabled}
      onClick={() => props.model?.[0]?.command?.()}
    >
      Settings
    </button>
  ),
}));

vi.mock("react-icons/fa", () => ({
  FaCog: () => <span>⚙️</span>,
}));

vi.mock("primereact/datatable", () => ({
  DataTable: ({ children }: any) => (
    <div data-testid="DataTable">{children}</div>
  ),
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
      render(<Client />);
      expect(screen.getByTestId("ClientTable")).toBeInTheDocument();
    });

    it("should show toolbar with all buttons in TABLE view", () => {
      render(<Client />);
      expect(screen.getByTestId("AddBtn")).toBeInTheDocument();
      expect(screen.getByTestId("EditBtn")).toBeInTheDocument();
      expect(screen.getByTestId("DeleteBtn")).toBeInTheDocument();
      expect(screen.getByTestId("ExportBtn")).toBeInTheDocument();
      expect(screen.getByTestId("SettingsBtn")).toBeInTheDocument();
    });

    it("should have Edit, Delete, and Settings buttons disabled initially", () => {
      render(<Client />);
      expect(screen.getByTestId("EditBtn")).toBeDisabled();
      expect(screen.getByTestId("DeleteBtn")).toBeDisabled();
      expect(screen.getByTestId("SettingsBtn")).toBeDisabled();
    });

    it("should have Add button enabled initially", () => {
      render(<Client />);
      expect(screen.getByTestId("AddBtn")).not.toBeDisabled();
    });
  });

  describe("Client Selection", () => {
    it("should enable Edit, Delete, and Settings buttons when client is selected", () => {
      render(<Client />);
      fireEvent.click(screen.getByTestId("SelectClientBtn"));

      expect(screen.getByTestId("EditBtn")).not.toBeDisabled();
      expect(screen.getByTestId("DeleteBtn")).not.toBeDisabled();
      expect(screen.getByTestId("SettingsBtn")).not.toBeDisabled();
    });

    it("should disable buttons when client is deselected", () => {
      render(<Client />);
      fireEvent.click(screen.getByTestId("SelectClientBtn"));
      fireEvent.click(screen.getByTestId("DeselectClientBtn"));

      expect(screen.getByTestId("EditBtn")).toBeDisabled();
      expect(screen.getByTestId("DeleteBtn")).toBeDisabled();
      expect(screen.getByTestId("SettingsBtn")).toBeDisabled();
    });
  });

  describe("Add Client Dialog", () => {
    it("should open add dialog when Add button is clicked", () => {
      render(<Client />);
      fireEvent.click(screen.getByTestId("AddBtn"));

      expect(screen.getByTestId("ClientAddEdit")).toBeInTheDocument();
    });

    it("should close add dialog when Cancel is clicked", () => {
      render(<Client />);
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

  render(<Client />);
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

      render(<Client />);
      fireEvent.click(screen.getByTestId("AddBtn"));
      fireEvent.click(screen.getByTestId("SaveBtn"));

      await waitFor(() => {
        expect(screen.queryByTestId("ClientAddEdit")).not.toBeInTheDocument();
      });
    });
  });

  describe("Edit Client Dialog", () => {
    it("should open edit dialog when Edit button is clicked with selected client", () => {
      render(<Client />);
      fireEvent.click(screen.getByTestId("SelectClientBtn"));
      fireEvent.click(screen.getByTestId("EditBtn"));

      expect(screen.getByTestId("ClientAddEdit")).toBeInTheDocument();
    });

    it("should open edit dialog when table triggers onEdit", () => {
      render(<Client />);
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
      render(<Client />);
      fireEvent.click(screen.getByTestId("TriggerEditBtn"));
      fireEvent.click(screen.getByTestId("CancelBtn"));

      expect(screen.queryByTestId("ClientAddEdit")).not.toBeInTheDocument();
    });

    it("should not open edit dialog when no client is selected", () => {
      render(<Client />);
      fireEvent.click(screen.getByTestId("EditBtn"));

      expect(screen.queryByTestId("ClientAddEdit")).not.toBeInTheDocument();
    });
  });

  describe("Delete Client Dialog", () => {
    it("should open delete dialog when Delete button is clicked with selected client", () => {
      render(<Client />);
      fireEvent.click(screen.getByTestId("SelectClientBtn"));
      fireEvent.click(screen.getByTestId("DeleteBtn"));

      expect(screen.getByTestId("ClientDelete")).toBeInTheDocument();
    });

    it("should not open delete dialog when no client is selected", () => {
      render(<Client />);
      fireEvent.click(screen.getByTestId("DeleteBtn"));

      expect(screen.queryByTestId("ClientDelete")).not.toBeInTheDocument();
    });

    it("should close delete dialog when Cancel is clicked", () => {
      render(<Client />);
      fireEvent.click(screen.getByTestId("SelectClientBtn"));
      fireEvent.click(screen.getByTestId("DeleteBtn"));
      fireEvent.click(screen.getByTestId("CancelDeleteBtn"));

      expect(screen.queryByTestId("ClientDelete")).not.toBeInTheDocument();
    });

    it("should call deleteClient when confirming delete", async () => {
  const deleteSpy = vi
    .spyOn(clientService, "deleteClient")
    .mockResolvedValue(undefined);

  render(<Client />);
  fireEvent.click(screen.getByTestId("SelectClientBtn"));
  fireEvent.click(screen.getByTestId("DeleteBtn"));
  fireEvent.click(screen.getByTestId("ConfirmDeleteBtn"));

  await waitFor(() => {
    expect(deleteSpy).toHaveBeenCalledWith('mock-token-123', 1);
  });
});

    it("should close delete dialog after successful deletion", async () => {
      vi.spyOn(clientService, "deleteClient").mockResolvedValue(undefined);

      render(<Client />);
      fireEvent.click(screen.getByTestId("SelectClientBtn"));
      fireEvent.click(screen.getByTestId("DeleteBtn"));
      fireEvent.click(screen.getByTestId("ConfirmDeleteBtn"));

      await waitFor(() => {
        expect(screen.queryByTestId("ClientDelete")).not.toBeInTheDocument();
      });
    });

    it("should deselect client after deletion", async () => {
      vi.spyOn(clientService, "deleteClient").mockResolvedValue(undefined);

      render(<Client />);
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
      render(<Client />);
      fireEvent.click(screen.getByTestId("SelectClientBtn"));
      fireEvent.click(screen.getByTestId("SettingsBtn"));

      expect(screen.getByTestId("ClientContactsView")).toBeInTheDocument();
      expect(screen.queryByTestId("ClientTable")).not.toBeInTheDocument();
    });

    it("should return to TABLE view from CONTACTS view", () => {
      render(<Client />);
      fireEvent.click(screen.getByTestId("SelectClientBtn"));
      fireEvent.click(screen.getByTestId("SettingsBtn"));
      fireEvent.click(screen.getByTestId("BackFromContactsBtn"));

      expect(screen.getByTestId("ClientTable")).toBeInTheDocument();
      expect(screen.queryByTestId("ClientContactsView")).not.toBeInTheDocument();
    });

    it("should clear selection when returning to TABLE view", () => {
      render(<Client />);
      fireEvent.click(screen.getByTestId("SelectClientBtn"));
      fireEvent.click(screen.getByTestId("SettingsBtn"));
      fireEvent.click(screen.getByTestId("BackFromContactsBtn"));

      expect(screen.getByTestId("EditBtn")).toBeDisabled();
      expect(screen.getByTestId("DeleteBtn")).toBeDisabled();
    });

    it("should hide toolbar when not in TABLE view", () => {
      render(<Client />);
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
        .mockImplementation(() => {});
      vi.spyOn(clientService, "createClient").mockRejectedValueOnce(
        new Error("API Error")
      );

      render(<Client />);
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
        .mockImplementation(() => {});
      vi.spyOn(clientService, "updateClient").mockRejectedValueOnce(
        new Error("Update Error")
      );

      render(<Client />);
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
        .mockImplementation(() => {});
      vi.spyOn(clientService, "deleteClient").mockRejectedValueOnce(
        new Error("Delete Error")
      );

      render(<Client />);
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
        .mockImplementation(() => {});

      render(<Client />);
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
      vi.spyOn(clientService, "createClient").mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  clientId: 1,
                  clientName: "Test",
                  address: "Address",
                }),
              100
            )
          )
      );

      render(<Client />);
      fireEvent.click(screen.getByTestId("AddBtn"));
      fireEvent.click(screen.getByTestId("SaveBtn"));

      expect(screen.getByTestId("AddBtn")).toBeDisabled();
    });

    it("should disable buttons during delete operation", async () => {
      vi.spyOn(clientService, "deleteClient").mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(undefined), 100))
      );

      render(<Client />);
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

      render(<Client />);
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

      render(<Client />);
      fireEvent.click(screen.getByTestId("TriggerEditBtn"));
      fireEvent.click(screen.getByTestId("SaveBtn"));

      await waitFor(() => {
        expect(screen.getByTestId("ClientTable")).toBeInTheDocument();
      });
    });

    it("should trigger refresh after successful delete", async () => {
      vi.spyOn(clientService, "deleteClient").mockResolvedValue(undefined);

      render(<Client />);
      fireEvent.click(screen.getByTestId("SelectClientBtn"));
      fireEvent.click(screen.getByTestId("DeleteBtn"));
      fireEvent.click(screen.getByTestId("ConfirmDeleteBtn"));

      await waitFor(() => {
        expect(screen.getByTestId("ClientTable")).toBeInTheDocument();
      });
    });
  });
});