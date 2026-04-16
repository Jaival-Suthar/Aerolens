import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PasswordInput } from "./PasswordInput";

vi.mock("primereact/inputtext", () => ({
  InputText: (props: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    className?: string;
    autoComplete?: string;
  }) => (
    <input
      data-testid="pwd"
      type={props.type}
      className={props.className}
      autoComplete={props.autoComplete}
      value={props.value}
      onChange={props.onChange}
    />
  ),
}));

vi.mock("react-icons/fi", () => ({
  FiEye: () => <span data-testid="eye">E</span>,
  FiEyeOff: () => <span data-testid="eye-off">O</span>,
}));

describe("PasswordInput", () => {
  beforeEach(() => vi.clearAllMocks());

  it("toggles visibility on icon click", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PasswordInput value="secret" onChange={onChange} />);
    const input = screen.getByTestId("pwd");
    expect(input).toHaveAttribute("type", "password");
    await user.click(screen.getByTestId("eye"));
    expect(input).toHaveAttribute("type", "text");
    await user.click(screen.getByTestId("eye-off"));
    expect(input).toHaveAttribute("type", "password");
  });

  it("applies invalid class and forwards onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <PasswordInput
        value=""
        onChange={onChange}
        invalid
        autoComplete="current-password"
      />
    );
    expect(screen.getByTestId("pwd").className).toContain("p-invalid");
    await user.type(screen.getByTestId("pwd"), "a");
    expect(onChange).toHaveBeenCalled();
  });
});
