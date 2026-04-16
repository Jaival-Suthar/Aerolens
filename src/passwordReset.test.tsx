import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthContext } from "./shared/auth/AuthContext";

const toastShow = vi.fn();

vi.mock("primereact/toast", () => ({
  Toast: React.forwardRef(
    (_props: unknown, ref: React.Ref<{ show: (opts: unknown) => void }>) => {
      React.useImperativeHandle(ref, () => ({ show: toastShow }));
      return null;
    }
  ),
}));

vi.mock("primereact/dialog", () => ({
  Dialog: ({
    children,
    visible,
    footer,
  }: {
    children: React.ReactNode;
    visible: boolean;
    footer?: React.ReactNode;
  }) =>
    visible ? (
      <div role="dialog">
        {children}
        <div data-testid="dialog-footer">{footer}</div>
      </div>
    ) : null,
}));

vi.mock("./shared/DialogAddEditButton", () => ({
  default: ({
    label,
    onClick,
    disabled,
    loading,
  }: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
  }) => (
    <button type="button" disabled={disabled || loading} onClick={onClick}>
      {label}
    </button>
  ),
}));

vi.mock("./shared/PasswordInput", () => ({
  PasswordInput: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (v: string) => void;
  }) => (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

import { ChangePasswordDialog } from "./passwordReset";

function renderDialog(
  props: { visible?: boolean; onClose?: () => void; onSuccess?: () => void } = {},
  authOverrides: Partial<{
    accessToken: string | null;
    logoutAll: () => void | Promise<void>;
  }> = {}
) {
  const onClose = props.onClose ?? vi.fn();
  const authValue = {
    accessToken: "test-token",
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
    refreshAccessToken: vi.fn().mockResolvedValue("test-token"),
    logoutAll: vi.fn().mockResolvedValue(undefined),
    ...authOverrides,
  };
  render(
    <AuthContext.Provider value={authValue as React.ComponentProps<typeof AuthContext.Provider>["value"]}>
      <ChangePasswordDialog
        visible={props.visible ?? true}
        onClose={onClose}
        onSuccess={props.onSuccess}
      />
    </AuthContext.Provider>
  );
  return { onClose, logoutAll: authValue.logoutAll as ReturnType<typeof vi.fn> };
}

describe("ChangePasswordDialog", () => {
  beforeEach(() => {
    toastShow.mockClear();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("submits successfully, closes dialog, and logs out after delay", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { logoutAll } = renderDialog({ onClose });

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ message: "Password changed" }),
    });

    const inputs = screen.getAllByRole("textbox");
    await user.type(inputs[0], "oldpass12");
    await user.type(inputs[1], "newpass12");
    await user.type(inputs[2], "newpass12");

    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${import.meta.env.VITE_BASE_URL}/auth/change-password`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            currentPassword: "oldpass12",
            newPassword: "newpass12",
          }),
        })
      );
    });

    expect(toastShow).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "success",
        summary: "Password Changed",
      })
    );
    expect(onClose).toHaveBeenCalled();

    await waitFor(() => expect(logoutAll).toHaveBeenCalled(), { timeout: 3000 });
  });

  it("shows toast when not authenticated", async () => {
    const user = userEvent.setup();
    renderDialog({}, { accessToken: null });

    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(global.fetch).not.toHaveBeenCalled();
    expect(toastShow).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "error",
        summary: "Not authenticated",
      })
    );
  });

  it("blocks submit when new password is too short", async () => {
    const user = userEvent.setup();
    renderDialog();

    const inputs = screen.getAllByRole("textbox");
    await user.type(inputs[0], "current1");
    await user.type(inputs[1], "short");
    await user.type(inputs[2], "short");

    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(global.fetch).not.toHaveBeenCalled();
    expect(toastShow).toHaveBeenCalledWith(
      expect.objectContaining({ summary: "Invalid Password" })
    );
    expect(
      screen.getByText("Password must be at least 8 characters long")
    ).toBeInTheDocument();
  });

  it("blocks submit when new password matches current", async () => {
    const user = userEvent.setup();
    renderDialog();

    const inputs = screen.getAllByRole("textbox");
    await user.type(inputs[0], "samepass12");
    await user.type(inputs[1], "samepass12");
    await user.type(inputs[2], "samepass12");

    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(global.fetch).not.toHaveBeenCalled();
    expect(
      screen.getByText("New password must be different from current password")
    ).toBeInTheDocument();
  });

  it("blocks submit when confirmation does not match", async () => {
    const user = userEvent.setup();
    renderDialog();

    const inputs = screen.getAllByRole("textbox");
    await user.type(inputs[0], "current12!");
    await user.type(inputs[1], "newpass12!");
    await user.type(inputs[2], "otherpass12!");

    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(global.fetch).not.toHaveBeenCalled();
    expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
  });

  it("maps INVALID_CURRENT_PASSWORD from API", async () => {
    const user = userEvent.setup();
    renderDialog();

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: async () => ({
        error: "INVALID_CURRENT_PASSWORD",
        message: "Wrong current password",
      }),
    });

    const inputs = screen.getAllByRole("textbox");
    await user.type(inputs[0], "wrongold12");
    await user.type(inputs[1], "newpass12!");
    await user.type(inputs[2], "newpass12!");

    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText("Current password is incorrect")).toBeInTheDocument();
    });
    expect(toastShow).toHaveBeenCalledWith(
      expect.objectContaining({ summary: "Incorrect Password" })
    );
  });

  it("maps VALIDATION_ERROR details to field errors", async () => {
    const user = userEvent.setup();
    renderDialog();

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: async () => ({
        error: "VALIDATION_ERROR",
        message: "Invalid",
        details: {
          validationErrors: [
            { field: "newPassword", message: "Too weak" },
          ],
        },
      }),
    });

    const inputs = screen.getAllByRole("textbox");
    await user.type(inputs[0], "current12!");
    await user.type(inputs[1], "newpass12!");
    await user.type(inputs[2], "newpass12!");

    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText("Too weak")).toBeInTheDocument();
    });
    expect(toastShow).toHaveBeenCalledWith(
      expect.objectContaining({ summary: "Invalid Input" })
    );
  });

  it("uses default API message when error body omits message", async () => {
    const user = userEvent.setup();
    renderDialog();

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });

    const inputs = screen.getAllByRole("textbox");
    await user.type(inputs[0], "current12!");
    await user.type(inputs[1], "newpass12!");
    await user.type(inputs[2], "newpass12!");

    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(toastShow).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: "Unable to change password",
        })
      );
    });
  });

  it("shows generic error toast for other API failures", async () => {
    const user = userEvent.setup();
    renderDialog();

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: async () => ({
        error: "OTHER",
        message: "Server exploded",
      }),
    });

    const inputs = screen.getAllByRole("textbox");
    await user.type(inputs[0], "current12!");
    await user.type(inputs[1], "newpass12!");
    await user.type(inputs[2], "newpass12!");

    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(toastShow).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: "error",
          summary: "Error",
          detail: "Server exploded",
        })
      );
    });
  });

  it("clears newPassword field error when user edits new password", async () => {
    const user = userEvent.setup();
    renderDialog();

    const inputs = screen.getAllByRole("textbox");
    await user.type(inputs[0], "current12!");
    await user.type(inputs[1], "bad");
    await user.type(inputs[2], "bad");
    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(
      screen.getByText("Password must be at least 8 characters long")
    ).toBeInTheDocument();

    await user.clear(inputs[1]);
    await user.type(inputs[1], "fixedpass12");

    expect(
      screen.queryByText("Password must be at least 8 characters long")
    ).not.toBeInTheDocument();
  });

  it("calls onClose when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const { onClose } = renderDialog();

    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
