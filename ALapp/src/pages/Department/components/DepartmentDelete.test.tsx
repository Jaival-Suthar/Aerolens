// src/pages/Department/components/DepartmentDelete.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DepartmentDelete from "./departmentDelete";
import { deleteDepartment } from "../services/useDepartment";
import type { Department } from "../types/departmentTypes";

// Mock PrimeReact components
vi.mock("primereact/dialog", () => ({
  Dialog: ({ visible, onHide, header, footer, children }: any) =>
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

vi.mock("primereact/button", () => ({
  Button: ({ label, onClick, disabled, loading, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      data-testid={props["data-testid"]}
      {...props}
    >
      {loading ? "Loading..." : label}
    </button>
  ),
}));

// Mock DialogDeleteButton
vi.mock("../../../shared/DialogDeleteButton", () => ({
  default: ({ onCancel, onDelete, loading }: any) => (
    <div data-testid="dialog-delete-button">
      <button
        onClick={onCancel}
        disabled={loading}
        data-testid="cancel-button"
      >
        Cancel
      </button>
      <button
        onClick={onDelete}
        disabled={loading}
        data-testid="delete-button"
      >
        {loading ? "Deleting..." : "Delete"}
      </button>
    </div>
  ),
}));

// Mock the deleteDepartment service
vi.mock("../services/useDepartment", () => ({
  deleteDepartment: vi.fn(),
}));

describe("DepartmentDelete", () => {
  const mockOnHide = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockOnClearSelection = vi.fn();

  const mockDepartment: Department = {
    departmentId: 1,
    departmentName: "Human Resources",
    departmentDescription: "Manages employee relations and HR policies",
    clientId: 100,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  };

  const defaultProps = {
    visible: true,
    onHide: mockOnHide,
    selectedDepartment: mockDepartment,
    onSuccess: mockOnSuccess,
    onClearSelection: mockOnClearSelection,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Dialog Visibility", () => {
    it("should render dialog when visible is true", () => {
      render(<DepartmentDelete {...defaultProps} />);

      expect(screen.getByTestId("dialog")).toBeInTheDocument();
    });

    it("should not render dialog when visible is false", () => {
      render(<DepartmentDelete {...defaultProps} visible={false} />);

      expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
    });

    it("should display correct header", () => {
      render(<DepartmentDelete {...defaultProps} />);

      expect(screen.getByTestId("dialog-header")).toHaveTextContent(
        "Confirm Deletion"
      );
    });
  });

  describe("Content Display", () => {
    it("should display department name in confirmation message", () => {
      render(<DepartmentDelete {...defaultProps} />);

      expect(
        screen.getByText(/Are you sure you want to delete department/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(`"${mockDepartment.departmentName}"`)
      ).toBeInTheDocument();
    });

    it("should display warning message", () => {
      render(<DepartmentDelete {...defaultProps} />);

      expect(
        screen.getByText("This action cannot be undone.")
      ).toBeInTheDocument();
    });

    it("should handle department name with special characters", () => {
      const specialDept = {
        ...mockDepartment,
        departmentName: "R&D / Innovation",
      };

      render(
        <DepartmentDelete {...defaultProps} selectedDepartment={specialDept} />
      );

      expect(screen.getByText('"R&D / Innovation"')).toBeInTheDocument();
    });

    it("should render DialogDeleteButton component", () => {
      render(<DepartmentDelete {...defaultProps} />);

      expect(screen.getByTestId("dialog-delete-button")).toBeInTheDocument();
      expect(screen.getByTestId("cancel-button")).toBeInTheDocument();
      expect(screen.getByTestId("delete-button")).toBeInTheDocument();
    });
  });

  describe("Cancel Functionality", () => {
    it("should call onHide when cancel button is clicked", async () => {
      const user = userEvent.setup();
      render(<DepartmentDelete {...defaultProps} />);

      const cancelButton = screen.getByTestId("cancel-button");
      await user.click(cancelButton);

      expect(mockOnHide).toHaveBeenCalledTimes(1);
    });

    it("should call onHide when dialog close button is clicked", async () => {
      const user = userEvent.setup();
      render(<DepartmentDelete {...defaultProps} />);

      const closeButton = screen.getByTestId("dialog-close");
      await user.click(closeButton);

      expect(mockOnHide).toHaveBeenCalledTimes(1);
    });

    it("should not call other callbacks when canceling", async () => {
      const user = userEvent.setup();
      render(<DepartmentDelete {...defaultProps} />);

      const cancelButton = screen.getByTestId("cancel-button");
      await user.click(cancelButton);

      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockOnClearSelection).not.toHaveBeenCalled();
    });
  });

  describe("Delete Functionality", () => {
    it("should call deleteDepartment with correct departmentId", async () => {
      const user = userEvent.setup();
      vi.mocked(deleteDepartment).mockResolvedValueOnce(undefined as any);

      render(<DepartmentDelete {...defaultProps} />);

      const deleteButton = screen.getByTestId("delete-button");
      await user.click(deleteButton);

      await waitFor(() => {
        expect(deleteDepartment).toHaveBeenCalledWith(
          mockDepartment.departmentId
        );
        expect(deleteDepartment).toHaveBeenCalledTimes(1);
      });
    });

    it("should call callbacks in correct order after successful deletion", async () => {
      const user = userEvent.setup();
      vi.mocked(deleteDepartment).mockResolvedValueOnce(undefined as any);

      render(<DepartmentDelete {...defaultProps} />);

      const deleteButton = screen.getByTestId("delete-button");
      await user.click(deleteButton);

      await waitFor(() => {
        expect(mockOnClearSelection).toHaveBeenCalledTimes(1);
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
        expect(mockOnHide).toHaveBeenCalledTimes(1);
      });

      // Verify order: clearSelection -> success -> hide
      const clearSelectionOrder = mockOnClearSelection.mock.invocationCallOrder[0];
      const successOrder = mockOnSuccess.mock.invocationCallOrder[0];
      const hideOrder = mockOnHide.mock.invocationCallOrder[0];

      expect(clearSelectionOrder).toBeLessThan(successOrder);
      expect(successOrder).toBeLessThan(hideOrder);
    });

    it("should not call deleteDepartment when selectedDepartment is null", async () => {
      const user = userEvent.setup();

      render(
        <DepartmentDelete {...defaultProps} selectedDepartment={null} />
      );

      const deleteButton = screen.getByTestId("delete-button");
      await user.click(deleteButton);

      await waitFor(() => {
        expect(deleteDepartment).not.toHaveBeenCalled();
      });
    });
  });

  describe("Loading State", () => {
    it("should show loading state during deletion", async () => {
      const user = userEvent.setup();
      let resolveDelete: () => void;
      const deletePromise = new Promise<void>((resolve) => {
        resolveDelete = resolve;
      });

      vi.mocked(deleteDepartment).mockReturnValueOnce(deletePromise as any);

      render(<DepartmentDelete {...defaultProps} />);

      const deleteButton = screen.getByTestId("delete-button");
      await user.click(deleteButton);

      // Should show loading text
      expect(screen.getByText("Deleting...")).toBeInTheDocument();

      // Buttons should be disabled
      expect(screen.getByTestId("cancel-button")).toBeDisabled();
      expect(screen.getByTestId("delete-button")).toBeDisabled();

      // Resolve the promise
      resolveDelete!();
      await waitFor(() => {
        expect(deleteDepartment).toHaveBeenCalled();
      });
    });

    it("should prevent multiple delete clicks while loading", async () => {
      const user = userEvent.setup();
      let resolveDelete: () => void;
      const deletePromise = new Promise<void>((resolve) => {
        resolveDelete = resolve;
      });

      vi.mocked(deleteDepartment).mockReturnValueOnce(deletePromise as any);

      render(<DepartmentDelete {...defaultProps} />);

      const deleteButton = screen.getByTestId("delete-button");

      // Click delete button multiple times
      await user.click(deleteButton);
      await user.click(deleteButton);
      await user.click(deleteButton);

      // Should only call deleteDepartment once
      expect(deleteDepartment).toHaveBeenCalledTimes(1);

      resolveDelete!();
    });
  });

  describe("Error Handling", () => {
    it("should handle deletion error gracefully", async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const error = new Error("Network error");

      vi.mocked(deleteDepartment).mockRejectedValueOnce(error);

      render(<DepartmentDelete {...defaultProps} />);

      const deleteButton = screen.getByTestId("delete-button");
      await user.click(deleteButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Error deleting department:",
          error
        );
      });

      // Should not call success callbacks on error
      expect(mockOnClearSelection).not.toHaveBeenCalled();
      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockOnHide).not.toHaveBeenCalled();

      // Should reset loading state
      expect(screen.getByText("Delete")).toBeInTheDocument();

      consoleErrorSpy.mockRestore();
    });

    it("should log error with different error types", async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      vi.mocked(deleteDepartment).mockRejectedValueOnce("String error");

      render(<DepartmentDelete {...defaultProps} />);

      const deleteButton = screen.getByTestId("delete-button");
      await user.click(deleteButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Error deleting department:",
          "String error"
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Console Logging", () => {
    it("should log success message after successful deletion", async () => {
      const user = userEvent.setup();
      const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      vi.mocked(deleteDepartment).mockResolvedValueOnce(undefined as any);

      render(<DepartmentDelete {...defaultProps} />);

      const deleteButton = screen.getByTestId("delete-button");
      await user.click(deleteButton);

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          `Department "${mockDepartment.departmentName}" deleted successfully`
        );
      });

      consoleLogSpy.mockRestore();
    });

    it("should log cancellation message when cancel is clicked", async () => {
      const user = userEvent.setup();
      const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      render(<DepartmentDelete {...defaultProps} />);

      const cancelButton = screen.getByTestId("cancel-button");
      await user.click(cancelButton);

      expect(consoleLogSpy).toHaveBeenCalledWith("Deletion cancelled");

      consoleLogSpy.mockRestore();
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long department names", () => {
      const longNameDept = {
        ...mockDepartment,
        departmentName: "A".repeat(200),
      };

      render(
        <DepartmentDelete {...defaultProps} selectedDepartment={longNameDept} />
      );

      expect(screen.getByText(`"${"A".repeat(200)}"`)).toBeInTheDocument();
    });

    it("should handle empty department name", () => {
      const emptyNameDept = {
        ...mockDepartment,
        departmentName: "",
      };

      render(
        <DepartmentDelete {...defaultProps} selectedDepartment={emptyNameDept} />
      );

      expect(screen.getByText('""')).toBeInTheDocument();
    });

    it("should handle department with id 0", async () => {
      const user = userEvent.setup();
      vi.mocked(deleteDepartment).mockResolvedValueOnce(undefined as any);

      const deptWithZeroId = {
        ...mockDepartment,
        departmentId: 0,
      };

      render(
        <DepartmentDelete {...defaultProps} selectedDepartment={deptWithZeroId} />
      );

      const deleteButton = screen.getByTestId("delete-button");
      await user.click(deleteButton);

      await waitFor(() => {
        expect(deleteDepartment).toHaveBeenCalledWith(0);
      });
    });

    it("should handle rapid open/close cycles", async () => {
      const { rerender } = render(<DepartmentDelete {...defaultProps} />);

      rerender(<DepartmentDelete {...defaultProps} visible={false} />);
      rerender(<DepartmentDelete {...defaultProps} visible={true} />);
      rerender(<DepartmentDelete {...defaultProps} visible={false} />);

      expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
    });
  });

  describe("Props Changes", () => {
    it("should update displayed department when selectedDepartment changes", () => {
      const { rerender } = render(<DepartmentDelete {...defaultProps} />);

      expect(screen.getByText('"Human Resources"')).toBeInTheDocument();

      const newDepartment: Department = {
        departmentId: 2,
        departmentName: "Engineering",
        departmentDescription: "Software development and technical operations",
        clientId: 100,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      };

      rerender(
        <DepartmentDelete {...defaultProps} selectedDepartment={newDepartment} />
      );

      expect(screen.getByText('"Engineering"')).toBeInTheDocument();
      expect(screen.queryByText('"Human Resources"')).not.toBeInTheDocument();
    });

    it("should handle selectedDepartment becoming null after initial render", () => {
      const { rerender } = render(<DepartmentDelete {...defaultProps} />);

      expect(screen.getByText('"Human Resources"')).toBeInTheDocument();

      rerender(
        <DepartmentDelete {...defaultProps} selectedDepartment={null} />
      );

      // Component should still render but with null handling
      expect(screen.getByTestId("dialog")).toBeInTheDocument();
    });
  });
});