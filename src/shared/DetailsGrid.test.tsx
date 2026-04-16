import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DetailsGrid from "./DetailsGrid";

describe("DetailsGrid", () => {
  it("renders scalar values", () => {
    render(
      <DetailsGrid
        items={[
          { label: "Name", value: "Alice" },
          { label: "Note", value: "Line1\nLine2" },
        ]}
      />
    );
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("renders array values as list with cleaned bullets", () => {
    render(
      <DetailsGrid
        items={[
          {
            label: "Skills",
            value: ["•  React", "  • Node"],
          },
        ]}
      />
    );
    expect(screen.getByText("Skills")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Node")).toBeInTheDocument();
  });

  it("spans full width when fullWidth is set", () => {
    const { container } = render(
      <DetailsGrid items={[{ label: "Wide", value: "x", fullWidth: true }]} />
    );
    const cell = container.querySelector('[style*="grid-column"]');
    expect(cell).toBeTruthy();
  });
});
