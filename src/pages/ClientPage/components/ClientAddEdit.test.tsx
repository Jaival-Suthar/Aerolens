// ClientAddEdit.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ClientAddEdit from "../components/clientAddEdit";
import type { ClientType, ClientAddType } from "../types/clientTypes";

// Mock PrimeReact Dialog
vi.mock("primereact/dialog", () => ({
  Dialog: ({ children, footer, visible, header, onHide }: any) =>
    visible ? (
      <div data-testid="dialog">
        <div data-testid="dialog-header">{header}</div>
        <div data-testid="dialog-content">{children}</div>
        <div data-testid="dialog-footer">{footer}</div>
        <button onClick={onHide} data-testid="dialog-close">
          Close
        </button>
      </div>
    ) : null,
}));

// Mock PrimeReact InputText
vi.mock("primereact/inputtext", () => ({
  InputText: ({ id, value, onChange, className, autoFocus }: any) => (
    <input
      id={id}
      data-testid={id}
      value={value}
      onChange={onChange}
      className={className}
      autoFocus={autoFocus}
    />
  ),
}));

// Mock DialogButton
vi.mock("../../../shared/DialogAddEditButton", () => ({
  default: ({ label, onClick, severity }: any) => (
    <button
      onClick={onClick}
      data-testid={`button-${label.toLowerCase().replace(/\s+/g, "-")}`}
      data-severity={severity}
    >
      {label}
    </button>
  ),
}));

// Mock react-icons
vi.mock("react-icons/fa", () => ({
  FaCheck: () => <span data-testid="check-icon" />,
}));

describe("ClientAddEdit", () => {
  const mockOnHide = vi.fn();
  const mockOnSave = vi.fn();

  const mockClient: ClientType = {
    clientId: 1,
    clientName: "SpaceX",
    address: "Mars Base",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Add Mode", () => {
    it("renders dialog with 'Add New Client' header in add mode", () => {
      render(
        <ClientAddEdit
          visible={true}
          onHide={mockOnHide}
          onSave={mockOnSave}
          mode="add"
          client={null}
        />
      );

      expect(screen.getByTestId("dialog-header")).toHaveTextContent("Add New Client");
    });

    it("renders empty form fields in add mode", () => {
      render(
        <ClientAddEdit
          visible={true}
          onHide={mockOnHide}
          onSave={mockOnSave}
          mode="add"
          client={null}
        />
      );

      const clientNameInput = screen.getByTestId("clientName") as HTMLInputElement;
      const addressInput = screen.getByTestId("address") as HTMLInputElement;

      expect(clientNameInput.value).toBe("");
      expect(addressInput.value).toBe("");
    });

    it("shows 'Add Client' button in add mode", () => {
      render(
        <ClientAddEdit
          visible={true}
          onHide={mockOnHide}
          onSave={mockOnSave}
          mode="add"
          client={null}
        />
      );

      expect(screen.getByTestId("button-add-client")).toBeInTheDocument();
    });

    it("calls onSave with ClientAddType when form is valid in add mode", async () => {
      render(
        <ClientAddEdit
          visible={true}
          onHide={mockOnHide}
          onSave={mockOnSave}
          mode="add"
          client={null}
        />
      );

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
      } as ClientAddType);
    });

    it("trims whitespace from inputs before saving in add mode", async () => {
      render(
        <ClientAddEdit
          visible={true}
          onHide={mockOnHide}
          onSave={mockOnSave}
          mode="add"
          client={null}
        />
      );

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
      render(
        <ClientAddEdit
          visible={true}
          onHide={mockOnHide}
          onSave={mockOnSave}
          mode="edit"
          client={mockClient}
        />
      );

      expect(screen.getByTestId("dialog-header")).toHaveTextContent("Edit Client");
    });

    it("populates form fields with client data in edit mode", () => {
      render(
        <ClientAddEdit
          visible={true}
          onHide={mockOnHide}
          onSave={mockOnSave}
          mode="edit"
          client={mockClient}
        />
      );

      const clientNameInput = screen.getByTestId("clientName") as HTMLInputElement;
      const addressInput = screen.getByTestId("address") as HTMLInputElement;

      expect(clientNameInput.value).toBe("SpaceX");
      expect(addressInput.value).toBe("Mars Base");
    });

    it("shows 'Update Client' button in edit mode", () => {
      render(
        <ClientAddEdit
          visible={true}
          onHide={mockOnHide}
          onSave={mockOnSave}
          mode="edit"
          client={mockClient}
        />
      );

      expect(screen.getByTestId("button-update-client")).toBeInTheDocument();
    });

    it("calls onSave with ClientType including clientId in edit mode", async () => {
      render(
        <ClientAddEdit
          visible={true}
          onHide={mockOnHide}
          onSave={mockOnSave}
          mode="edit"
          client={mockClient}
        />
      );

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
      } as ClientType);
    });

    it("does not call onSave if clientId is missing in edit mode", async () => {
      const clientWithoutId = { clientName: "Test", address: "Test Address" } as any;

      render(
        <ClientAddEdit
          visible={true}
          onHide={mockOnHide}
          onSave={mockOnSave}
          mode="edit"
          client={clientWithoutId}
        />
      );

      const submitButton = screen.getByTestId("button-update-client");
      fireEvent.click(submitButton);

      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  describe("Validation", () => {
    it("shows error when client name is empty", async () => {
      render(
        <ClientAddEdit
          visible={true}
          onHide={mockOnHide}
          onSave={mockOnSave}
          mode="add"
          client={null}
        />
      );

      const submitButton = screen.getByTestId("button-add-client");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Client Name is required")).toBeInTheDocument();
      });

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it("shows error when address is empty", async () => {
      render(
        <ClientAddEdit
          visible={true}
          onHide={mockOnHide}
          onSave={mockOnSave}
          mode="add"
          client={null}
        />
      );

      const submitButton = screen.getByTestId("button-add-client");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Address is required")).toBeInTheDocument();
      });

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it("shows both errors when both fields are empty", async () => {
      render(
        <ClientAddEdit
          visible={true}
          onHide={mockOnHide}
          onSave={mockOnSave}
          mode="add"
          client={null}
        />
      );

      const submitButton = screen.getByTestId("button-add-client");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Client Name is required")).toBeInTheDocument();
        expect(screen.getByText("Address is required")).toBeInTheDocument();
      });

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it("clears error when user starts typing in client name field", async () => {
      render(
        <ClientAddEdit
          visible={true}
          onHide={mockOnHide}
          onSave={mockOnSave}
          mode="add"
          client={null}
        />
      );

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
      render(
        <ClientAddEdit
          visible={true}
          onHide={mockOnHide}
          onSave={mockOnSave}
          mode="add"
          client={null}
        />
      );

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
      render(
        <ClientAddEdit
          visible={true}
          onHide={mockOnHide}
          onSave={mockOnSave}
          mode="add"
          client={null}
        />
      );

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
      render(
        <ClientAddEdit
          visible={false}
          onHide={mockOnHide}
          onSave={mockOnSave}
          mode="add"
          client={null}
        />
      );

      expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
    });

    it("resets form when dialog closes", async () => {
      const { rerender } = render(
        <ClientAddEdit
          visible={true}
          onHide={mockOnHide}
          onSave={mockOnSave}
          mode="add"
          client={null}
        />
      );

      const clientNameInput = screen.getByTestId("clientName");
      const addressInput = screen.getByTestId("address");

      await userEvent.type(clientNameInput, "Tesla");
      await userEvent.type(addressInput, "Factory");

      const cancelButton = screen.getByTestId("button-cancel");
      fireEvent.click(cancelButton);

      expect(mockOnHide).toHaveBeenCalled();

      rerender(
        <ClientAddEdit
          visible={true}
          onHide={mockOnHide}
          onSave={mockOnSave}
          mode="add"
          client={null}
        />
      );

      const newClientNameInput = screen.getByTestId("clientName") as HTMLInputElement;
      const newAddressInput = screen.getByTestId("address") as HTMLInputElement;

      expect(newClientNameInput.value).toBe("");
      expect(newAddressInput.value).toBe("");
    });

    it("clears errors when dialog reopens", async () => {
      const { rerender } = render(
        <ClientAddEdit
          visible={true}
          onHide={mockOnHide}
          onSave={mockOnSave}
          mode="add"
          client={null}
        />
      );

      const submitButton = screen.getByTestId("button-add-client");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Client Name is required")).toBeInTheDocument();
      });

      rerender(
        <ClientAddEdit
          visible={false}
          onHide={mockOnHide}
          onSave={mockOnSave}
          mode="add"
          client={null}
        />
      );

      rerender(
        <ClientAddEdit
          visible={true}
          onHide={mockOnHide}
          onSave={mockOnSave}
          mode="add"
          client={null}
        />
      );

      expect(screen.queryByText("Client Name is required")).not.toBeInTheDocument();
      expect(screen.queryByText("Address is required")).not.toBeInTheDocument();
    });
  });

  describe("Cancel Functionality", () => {
    it("calls onHide when cancel button is clicked", () => {
      render(
        <ClientAddEdit
          visible={true}
          onHide={mockOnHide}
          onSave={mockOnSave}
          mode="add"
          client={null}
        />
      );

      const cancelButton = screen.getByTestId("button-cancel");
      fireEvent.click(cancelButton);

      expect(mockOnHide).toHaveBeenCalledTimes(1);
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it("calls onHide when dialog close button is clicked", () => {
      render(
        <ClientAddEdit
          visible={true}
          onHide={mockOnHide}
          onSave={mockOnSave}
          mode="add"
          client={null}
        />
      );

      const closeButton = screen.getByTestId("dialog-close");
      fireEvent.click(closeButton);

      expect(mockOnHide).toHaveBeenCalled();
    });
  });

  describe("Form Fields", () => {
    it("renders required field indicators", () => {
      render(
        <ClientAddEdit
          visible={true}
          onHide={mockOnHide}
          onSave={mockOnSave}
          mode="add"
          client={null}
        />
      );

      const requiredIndicators = screen.getAllByText("*");
      expect(requiredIndicators).toHaveLength(2);
    });

    it("sets autofocus on client name field", () => {
      render(
        <ClientAddEdit
          visible={true}
          onHide={mockOnHide}
          onSave={mockOnSave}
          mode="add"
          client={null}
        />
      );

      const clientNameInput = screen.getByTestId("clientName");
    //   expect(clientNameInput).toHaveAttribute("autoFocus");
    expect(document.activeElement).toBe(clientNameInput);
    });

    it("applies p-invalid class when field has error", async () => {
      render(
        <ClientAddEdit
          visible={true}
          onHide={mockOnHide}
          onSave={mockOnSave}
          mode="add"
          client={null}
        />
      );

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
      render(
        <ClientAddEdit
          visible={true}
          onHide={mockOnHide}
          onSave={mockOnSave}
          client={null}
        />
      );

      expect(screen.getByTestId("dialog-header")).toHaveTextContent("Add New Client");
      expect(screen.getByTestId("button-add-client")).toBeInTheDocument();
    });
  });
});