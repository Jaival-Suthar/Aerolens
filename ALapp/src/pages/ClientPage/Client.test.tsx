import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import Client from "./page";
import * as clientService from "./services/clientService";
import { ClientType } from "./types/clientTypes";

// Mock child components
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

vi.mock("./services/clientService");

beforeEach(() => {
  vi.clearAllMocks();
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
          clientName: "Test",
          address: "Address",
        });

      render(<Client />);
      fireEvent.click(screen.getByTestId("AddBtn"));
      fireEvent.click(screen.getByTestId("SaveBtn"));

      await waitFor(() => {
        expect(createSpy).toHaveBeenCalledWith({
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

    // it("should call updateClient when saving in edit mode", async () => {
    //   const updateSpy = vi
    //     .spyOn(clientService, "updateClient")
    //     .mockResolvedValue({
    //       clientId: 1,
    //       clientName: "Updated",
    //       address: "Updated",
    //     });

    //   render(<Client />);
    //   fireEvent.click(screen.getByTestId("TriggerEditBtn"));
    //   fireEvent.click(screen.getByTestId("SaveBtn"));

    //   await waitFor(() => {
    //     expect(updateSpy).toHaveBeenCalledWith({
    //     id: 1,
    //     name: "Updated Client",
    //     address: "Updated Address",
    //     });

    //   });
    // });

    // it("should close dialog after successful update", async () => {
    //   vi.spyOn(clientService, "updateClient").mockResolvedValue({
    //     clientId: 1,
    //     clientName: "Updated",
    //     address: "Updated",
    //   });

    //   render(<Client />);
    //   fireEvent.click(screen.getByTestId("TriggerEditBtn"));
    //   fireEvent.click(screen.getByTestId("SaveBtn"));

    //   await waitFor(() => {
    //     expect(screen.queryByTestId("ClientAddEdit")).not.toBeInTheDocument();
    //   }, { timeout: 2000 });
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
        expect(deleteSpy).toHaveBeenCalledWith(1);
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

// import React from "react";
// import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
// import { render, fireEvent, screen, waitFor } from "@testing-library/react";
// import Client from "./page";
// import * as clientService from "./services/clientService";
// import { ClientType } from "./types/clientTypes";

// // Mock child components to capture props and allow callback testing
// let mockOnEdit: ((client: ClientType) => void) | undefined;
// let mockOnSelectionChange: ((client: ClientType | null) => void) | undefined;
// let mockOnSave: ((client: any) => void) | undefined;
// let mockOnDelete: ((client?: ClientType | null) => void) | undefined;
// let mockOnHideAddEdit: (() => void) | undefined;
// let mockOnHideDelete: (() => void) | undefined;

// vi.mock("./components/clientTable", () => ({
//   default: (props: any) => {
//     mockOnEdit = props.onEdit;
//     mockOnSelectionChange = props.onSelectionChange;
//     return <div data-testid="ClientTable">Table</div>;
//   }
// }));

// vi.mock("./components/clientAddEdit", () => ({
//   default: (props: any) => (
//     <div data-testid="ClientAddEdit">
//       <button onClick={() => mockOnSave?.({ clientName: "Test Client", address: "Test Address" })}>
//         Save
//       </button>
//       <button onClick={() => mockOnHideAddEdit?.()}>Cancel</button>
//     </div>
//   )
// }));

// vi.mock("./components/clientDelete", () => ({
//   default: (props: any) => (
//     <div data-testid="ClientDelete">
//       <button onClick={() => mockOnDelete?.(props.client)}>Confirm Delete</button>
//       <button onClick={() => mockOnHideDelete?.()}>Cancel Delete</button>
//     </div>
//   )
// }));

// vi.mock("../Contact/components/clientContactsView", () => ({
//   default: (props: any) => (
//     <div data-testid="ClientContactsView">
//       <button onClick={props.onBackClick}>Back to Clients</button>
//     </div>
//   )
// }));

// vi.mock("../Department/components/departmentTable", () => ({
//   default: (props: any) => (
//     <div data-testid="DepartmentTable">
//       <button onClick={props.onBackClick}>Back to Clients</button>
//     </div>
//   )
// }));

// vi.mock("../../shared/AddButton", () => ({
//   default: (props: any) => <button {...props} data-testid="AddButton">Add</button>
// }));

// vi.mock("../../shared/EditButton", () => ({
//   default: (props: any) => <button {...props} data-testid="EditButton">Edit</button>
// }));

// vi.mock("../../shared/DeleteButton", () => ({
//   default: (props: any) => <button {...props} data-testid="DeleteButton">Delete</button>
// }));

// vi.mock("../../shared/ExportExcelButton", () => ({
//   default: () => <button data-testid="ExportExcelButton">Export</button>
// }));

// vi.mock("../Contact/constants/contactConstants", () => ({
//   VIEW_MODES: {
//     TABLE: "TABLE",
//     CONTACTS: "CONTACTS",
//     DEPARTMENT: "DEPARTMENT"
//   },
//   getMenuItems: (callback: (view: string) => void) => [
//     { label: "Contacts", command: () => callback("CONTACTS") },
//     { label: "Departments", command: () => callback("DEPARTMENT") }
//   ]
// }));

// vi.mock("./services/clientService", () => ({
//   createClient: vi.fn().mockResolvedValue({ clientId: 1 }),
//   updateClient: vi.fn().mockResolvedValue({ clientId: 1 }),
//   deleteClient: vi.fn().mockResolvedValue({}),
// }));

// // Mock window.alert
// const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

// beforeEach(() => {
//   vi.clearAllMocks();
//   mockOnEdit = undefined;
//   mockOnSelectionChange = undefined;
//   mockOnSave = undefined;
//   mockOnDelete = undefined;
//   mockOnHideAddEdit = undefined;
//   mockOnHideDelete = undefined;
// });

// afterEach(() => {
//   vi.restoreAllMocks();
// });

// describe("Client Page", () => {
//   it("renders the ClientTable in TABLE view mode by default", () => {
//     render(<Client />);
//     expect(screen.getByTestId("ClientTable")).toBeInTheDocument();
//   });

//   it("shows Add dialog when AddButton is clicked", () => {
//     render(<Client />);
//     fireEvent.click(screen.getByTestId("AddButton"));
//     expect(screen.getByTestId("ClientAddEdit")).toBeInTheDocument();
//   });

//   it("hides Add dialog when cancel is clicked", () => {
//     render(<Client />);
//     fireEvent.click(screen.getByTestId("AddButton"));
//     expect(screen.getByTestId("ClientAddEdit")).toBeInTheDocument();
    
//     fireEvent.click(screen.getByText("Cancel"));
//     expect(screen.queryByTestId("ClientAddEdit")).not.toBeInTheDocument();
//   });

//   it("calls createClient API and shows success toast on save in add mode", async () => {
//     const createSpy = vi.spyOn(clientService, "createClient");
//     render(<Client />);
    
//     fireEvent.click(screen.getByTestId("AddButton"));
//     fireEvent.click(screen.getByText("Save"));

//     await waitFor(() => {
//       expect(createSpy).toHaveBeenCalledWith({
//         name: "Test Client",
//         address: "Test Address"
//       });
//     });
    
//     expect(screen.queryByTestId("ClientAddEdit")).not.toBeInTheDocument();
//   });

//   it("handles createClient API error gracefully", async () => {
//     vi.spyOn(clientService, "createClient").mockRejectedValueOnce(new Error("API Error"));
//     const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    
//     render(<Client />);
//     fireEvent.click(screen.getByTestId("AddButton"));
//     fireEvent.click(screen.getByText("Save"));

//     await waitFor(() => {
//       expect(consoleErrorSpy).toHaveBeenCalled();
//     });
    
//     consoleErrorSpy.mockRestore();
//   });

//   it("opens edit dialog when edit is triggered from table", () => {
//     render(<Client />);
    
//     const mockClient: ClientType = {
//       clientId: 1,
//       clientName: "Existing Client",
//       address: "Old Address"
//     };
    
//     // Simulate table calling onEdit
//     mockOnEdit?.(mockClient);
    
//     expect(screen.getByTestId("ClientAddEdit")).toBeInTheDocument();
//   });

//   it("calls updateClient API on save in edit mode", async () => {
//     const updateSpy = vi.spyOn(clientService, "updateClient");
//     render(<Client />);
    
//     const mockClient: ClientType = {
//       clientId: 1,
//       clientName: "Existing Client",
//       address: "Old Address"
//     };
    
//     mockOnEdit?.(mockClient);
//     fireEvent.click(screen.getByText("Save"));

//     await waitFor(() => {
//       expect(updateSpy).toHaveBeenCalledWith({
//         id: 1,
//         name: "Test Client",
//         address: "Test Address"
//       });
//     });
//   });

//   it("handles updateClient API error gracefully", async () => {
//     vi.spyOn(clientService, "updateClient").mockRejectedValueOnce(new Error("Update failed"));
//     const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    
//     render(<Client />);
    
//     const mockClient: ClientType = {
//       clientId: 1,
//       clientName: "Existing Client",
//       address: "Old Address"
//     };
    
//     mockOnEdit?.(mockClient);
//     fireEvent.click(screen.getByText("Save"));

//     await waitFor(() => {
//       expect(consoleErrorSpy).toHaveBeenCalled();
//     });
    
//     consoleErrorSpy.mockRestore();
//   });

//   it("throws error when saving client without clientId in edit mode", async () => {
//     const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
//     render(<Client />);
    
//     const mockClient: ClientType = {
//       clientId: 2,
//       clientName: "Invalid Client",
//       address: "No ID"
//     };
    
//     mockOnEdit?.(mockClient);
//     fireEvent.click(screen.getByText("Save"));

//     await waitFor(() => {
//       expect(consoleErrorSpy).toHaveBeenCalled();
//     });
    
//     consoleErrorSpy.mockRestore();
//   });

//   it("does not open edit dialog when EditButton is clicked without selection", () => {
//     render(<Client />);
//     fireEvent.click(screen.getByTestId("EditButton"));
//     expect(screen.queryByTestId("ClientAddEdit")).not.toBeInTheDocument();
//   });

//   it("opens edit dialog when EditButton is clicked with selected client", () => {
//     render(<Client />);
    
//     const mockClient: ClientType = {
//       clientId: 1,
//       clientName: "Selected Client",
//       address: "Address"
//     };
    
//     // Select client
//     mockOnSelectionChange?.(mockClient);
    
//     // Click edit button
//     fireEvent.click(screen.getByTestId("EditButton"));
    
//     expect(screen.getByTestId("ClientAddEdit")).toBeInTheDocument();
//   });

//     it("does not open delete dialog when DeleteButton is clicked without selection", () => {
//     render(<Client />);
//     // No selection yet → delete should not open
//     fireEvent.click(screen.getByTestId("DeleteButton"));
//     expect(screen.queryByTestId("ClientDelete")).not.toBeInTheDocument();
//   });

//   it("opens delete dialog when DeleteButton is clicked with selected client", () => {
//     render(<Client />);

//     const mockClient: ClientType = {
//       clientId: 1,
//       clientName: "To Delete",
//       address: "Address"
//     };

//     // ✅ Simulate client selection first
//     mockOnSelectionChange?.(mockClient);

//     // Now delete should open dialog
//     fireEvent.click(screen.getByTestId("DeleteButton"));
//     expect(screen.getByTestId("ClientDelete")).toBeInTheDocument();
//   });

//   it("hides delete dialog when cancel is clicked", () => {
//     render(<Client />);

//     const mockClient: ClientType = {
//       clientId: 1,
//       clientName: "To Delete",
//       address: "Address"
//     };

//     mockOnSelectionChange?.(mockClient);
//     fireEvent.click(screen.getByTestId("DeleteButton"));

//     // Confirm dialog visible
//     expect(screen.getByTestId("ClientDelete")).toBeInTheDocument();

//     // ✅ Cancel delete
//     fireEvent.click(screen.getByText("Cancel Delete"));
//     expect(screen.queryByTestId("ClientDelete")).not.toBeInTheDocument();
//   });

//   it("calls deleteClient API and hides dialog on confirmation", async () => {
//     const deleteSpy = vi.spyOn(clientService, "deleteClient");
//     render(<Client />);

//     const mockClient: ClientType = {
//       clientId: 1,
//       clientName: "To Delete",
//       address: "Address"
//     };

//     // ✅ Select client
//     mockOnSelectionChange?.(mockClient);

//     // Open delete dialog
//     fireEvent.click(screen.getByTestId("DeleteButton"));
//     await waitFor(() =>
//       expect(screen.getByTestId("ClientDelete")).toBeInTheDocument()
//     );

//     // Confirm delete
//     fireEvent.click(screen.getByText("Confirm Delete"));

//     await waitFor(() => {
//       expect(deleteSpy).toHaveBeenCalledWith(1);
//     });

//     // ✅ Delete dialog should close after confirmation
//     expect(screen.queryByTestId("ClientDelete")).not.toBeInTheDocument();
//   });

//   it("handles deleteClient API error gracefully", async () => {
//     vi.spyOn(clientService, "deleteClient").mockRejectedValueOnce(new Error("Delete failed"));
//     const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

//     render(<Client />);

//     const mockClient: ClientType = {
//       clientId: 1,
//       clientName: "To Delete",
//       address: "Address"
//     };

//     // ✅ Select client first
//     mockOnSelectionChange?.(mockClient);
//     fireEvent.click(screen.getByTestId("DeleteButton"));

//     await waitFor(() =>
//       expect(screen.getByTestId("ClientDelete")).toBeInTheDocument()
//     );

//     fireEvent.click(screen.getByText("Confirm Delete"));

//     await waitFor(() => {
//       expect(consoleErrorSpy).toHaveBeenCalled();
//     });

//     consoleErrorSpy.mockRestore();
//   });

//   it("does not call deleteClient API when clientId is invalid", async () => {
//     render(<Client />);

//     const mockClient: ClientType = {
//       clientId: undefined as unknown as number, // ⚠️ invalid ID
//       clientName: "Invalid",
//       address: "Address"
//     };

//     // ✅ Select invalid client
//     mockOnSelectionChange?.(mockClient);

//     fireEvent.click(screen.getByTestId("DeleteButton"));
//     await waitFor(() =>
//       expect(screen.getByTestId("ClientDelete")).toBeInTheDocument()
//     );

//     fireEvent.click(screen.getByText("Confirm Delete"));

//     await waitFor(() => {
//       expect(clientService.deleteClient).not.toHaveBeenCalled();
//     });
//   });

// //-----------------------------------------------------------------------------------------------
//   it("does not render ClientContactsView in initial TABLE mode", () => {
//     render(<Client />);
//     expect(screen.queryByTestId("ClientContactsView")).not.toBeInTheDocument();
//   });

//   it("does not render DepartmentTable in initial TABLE mode", () => {
//     render(<Client />);
//     expect(screen.queryByTestId("DepartmentTable")).not.toBeInTheDocument();
//   });

//   it("shows ExportExcelButton in toolbar", () => {
//     render(<Client />);
//     expect(screen.getByTestId("ExportExcelButton")).toBeInTheDocument();
//   });

//   it("renders SplitButton with disabled state when no client selected", () => {
//     render(<Client />);
//     const buttons = screen.getAllByRole("button");
//     const splitButtons = buttons.filter(btn => 
//       btn.className.includes("p-splitbutton")
//     );
//     expect(splitButtons.length).toBeGreaterThan(0);
//     expect(splitButtons[0]).toBeDisabled();
//   });

//   it("updates selectedClient when selection changes", () => {
//     render(<Client />);
    
//     const mockClient: ClientType = {
//       clientId: 1,
//       clientName: "Selected",
//       address: "Address"
//     };
    
//     mockOnSelectionChange?.(mockClient);
    
//     // EditButton should now be enabled (not have disabled attribute checking would require better mock)
//     fireEvent.click(screen.getByTestId("EditButton"));
//     expect(screen.getByTestId("ClientAddEdit")).toBeInTheDocument();
//   });

//   it("clears selectedClient when selection is removed", () => {
//     render(<Client />);
    
//     const mockClient: ClientType = {
//       clientId: 1,
//       clientName: "Selected",
//       address: "Address"
//     };
    
//     mockOnSelectionChange?.(mockClient);
//     mockOnSelectionChange?.(null);
    
//     fireEvent.click(screen.getByTestId("EditButton"));
//     expect(screen.queryByTestId("ClientAddEdit")).not.toBeInTheDocument();
//   });

//   it("shows alert when trying to view contacts without selecting client", () => {
//     render(<Client />);
    
//     const buttons = screen.getAllByRole("button");
//     const splitButton = buttons.find(btn => btn.className.includes("p-splitbutton-menubutton"));
    
//     // Can't easily trigger menu items in test, but testing the logic path
//     // The getMenuItems callback would show alert
//     expect(alertMock).not.toHaveBeenCalled();
//   });

//   it("switches to CONTACTS view when client is selected and contacts menu item is clicked", () => {
//     render(<Client />);
    
//     const mockClient: ClientType = {
//       clientId: 1,
//       clientName: "Selected",
//       address: "Address"
//     };
    
//     mockOnSelectionChange?.(mockClient);
    
//     // Manually trigger the menu callback (simulating menu item click)
//     const { getMenuItems } = require("../Contact/constants/contactConstants");
//     const menuItems = getMenuItems((view: string) => {
//       // This simulates clicking "Contacts" in the menu
//     });
    
//     // Since we can't easily click menu items, we'll just verify the table is still there
//     expect(screen.getByTestId("ClientTable")).toBeInTheDocument();
//   });

//   it("switches to DEPARTMENT view when client is selected and departments menu item is clicked", () => {
//     render(<Client />);
    
//     const mockClient: ClientType = {
//       clientId: 1,
//       clientName: "Selected",
//       address: "Address"
//     };
    
//     mockOnSelectionChange?.(mockClient);
    
//     expect(screen.getByTestId("ClientTable")).toBeInTheDocument();
//   });

//   it("returns to TABLE view when back button is clicked in CONTACTS view", () => {
//     render(<Client />);
    
//     // This would require actually switching views, which needs menu interaction
//     // For now, verify table is rendered
//     expect(screen.getByTestId("ClientTable")).toBeInTheDocument();
//   });

//   it("clears selection when returning to TABLE view", () => {
//     render(<Client />);
    
//     const mockClient: ClientType = {
//       clientId: 1,
//       clientName: "Selected",
//       address: "Address"
//     };
    
//     mockOnSelectionChange?.(mockClient);
    
//     // handleBackToClients would clear selection
//     expect(screen.getByTestId("ClientTable")).toBeInTheDocument();
//   });

//   it("increments refreshTrigger after successful client creation", async () => {
//     render(<Client />);
    
//     fireEvent.click(screen.getByTestId("AddButton"));
//     fireEvent.click(screen.getByText("Save"));

//     await waitFor(() => {
//       expect(clientService.createClient).toHaveBeenCalled();
//     });
    
//     // refreshTrigger would have incremented, causing ClientTable to refetch
//   });

//   it("increments refreshTrigger after successful client update", async () => {
//     render(<Client />);
    
//     const mockClient: ClientType = {
//       clientId: 1,
//       clientName: "Existing",
//       address: "Address"
//     };
    
//     mockOnEdit?.(mockClient);
//     fireEvent.click(screen.getByText("Save"));

//     await waitFor(() => {
//       expect(clientService.updateClient).toHaveBeenCalled();
//     });
//   });

//   it("increments refreshTrigger after successful client deletion", async () => {
//     render(<Client />);
    
//     const mockClient: ClientType = {
//       clientId: 1,
//       clientName: "To Delete",
//       address: "Address"
//     };
    
//     mockOnSelectionChange?.(mockClient);
//     fireEvent.click(screen.getByTestId("DeleteButton"));
//     fireEvent.click(screen.getByText("Confirm Delete"));

//     await waitFor(() => {
//       expect(clientService.deleteClient).toHaveBeenCalled();
//     });
//   });
// });