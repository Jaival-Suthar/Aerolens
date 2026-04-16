import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PhoneInputField from "./PhoneInput";

vi.mock("react-phone-input-2", () => ({
  default: ({
    onChange,
    value,
    disabled,
    inputProps,
  }: {
    onChange: (v: string) => void;
    value: string;
    disabled?: boolean;
    inputProps?: Record<string, unknown>;
  }) => (
    <input
      data-testid="phone-mock"
      {...(inputProps ?? {})}
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(e.target.value || "")}
    />
  ),
}));

describe("PhoneInputField", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders and prefixes + on change when digits present", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <PhoneInputField value="" onChange={onChange} id="p1" />
    );
    const input = screen.getByTestId("phone-mock");
    await user.type(input, "919876543210");
    expect(onChange).toHaveBeenCalled();
    const last = onChange.mock.calls.at(-1)?.[0] as string;
    expect(last.startsWith("+")).toBe(true);
  });

  it("shows error message and aria-invalid", () => {
    render(
      <PhoneInputField value="+1" onChange={() => {}} error="Bad" id="e1" />
    );
    expect(screen.getByText("Bad")).toBeInTheDocument();
    expect(screen.getByTestId("phone-mock")).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });

  it("strips leading + when passing digits to underlying input", () => {
    render(<PhoneInputField value="+9198" onChange={() => {}} />);
    expect(screen.getByTestId("phone-mock")).toHaveValue("9198");
  });
});
