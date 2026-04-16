import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DetailsSection from "./DetailsSection";

describe("DetailsSection", () => {
  it("renders title and children", () => {
    render(
      <DetailsSection title="Overview">
        <p>Body</p>
      </DetailsSection>
    );
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });
});
