import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ViewButton from "./ViewButton";

vi.mock("primereact/button", () => ({
  Button: (props: {
    children: React.ReactNode;
    onClick: () => void;
    tooltip?: string;
    "aria-label"?: string;
  }) => (
    <button
      type="button"
      aria-label={props["aria-label"]}
      data-tooltip={props.tooltip}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  ),
}));

vi.mock("react-icons/fa", () => ({
  FaEye: () => <span data-testid="eye" />,
}));

describe("ViewButton", () => {
  it("uses default tooltip when none provided", () => {
    const onClick = vi.fn();
    render(<ViewButton onClick={onClick} />);
    expect(screen.getByRole("button")).toHaveAttribute(
      "data-tooltip",
      "View details"
    );
  });

  it("uses custom tooltip when provided", () => {
    render(<ViewButton onClick={vi.fn()} tooltip="Open record" />);
    expect(screen.getByRole("button")).toHaveAttribute(
      "data-tooltip",
      "Open record"
    );
  });

  it("invokes onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ViewButton onClick={onClick} />);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalled();
  });
});
