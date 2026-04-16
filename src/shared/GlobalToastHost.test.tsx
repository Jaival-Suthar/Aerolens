import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import GlobalToastHost from "./GlobalToastHost";
import * as toastSvc from "./services/globalToastService";

vi.mock("./services/globalToastService", () => ({
  registerGlobalToast: vi.fn(),
}));

vi.mock("primereact/toast", () => ({
  Toast: ({ position }: { position?: string }) => (
    <div data-testid="toast" data-position={position} />
  ),
}));

describe("GlobalToastHost", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it("registers toast on mount and clears on unmount", () => {
    const { unmount } = render(<GlobalToastHost />);
    expect(toastSvc.registerGlobalToast).toHaveBeenCalled();
    unmount();
    expect(toastSvc.registerGlobalToast).toHaveBeenLastCalledWith(null);
  });
});
