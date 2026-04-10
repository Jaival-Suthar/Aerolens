import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import type { LookupEntry } from "../types/lookupTypes";
import LookupTable from "./lookupTable";
import { DataTable } from "primereact/datatable";

vi.mock("../../../shared/auth/AuthContext", () => ({
  useAuth: () => ({ accessToken: "mock-token-123" }),
}));

vi.mock("primereact/datatable", () => ({
  DataTable: vi.fn(({ children, value, emptyMessage, ...props }) => (
    <div data-testid="data-table" {...props}>
      {value?.length === 0 && <div data-testid="empty-message">{emptyMessage}</div>}
      {children}
    </div>
  )),
  Column: vi.fn(() => null),
}));

vi.mock("../../../shared/AddButton", () => ({
  default: ({ onClick }: { onClick: () => void }) => (
    <button type="button" data-testid="add-button" onClick={onClick}>
      Add
    </button>
  ),
}));

vi.mock("../../../shared/EditButton", () => ({
  default: ({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) => (
    <button type="button" data-testid="edit-button" onClick={onClick} disabled={disabled}>
      Edit
    </button>
  ),
}));

vi.mock("../../../shared/DeleteButton", () => ({
  default: ({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) => (
    <button type="button" data-testid="delete-button" onClick={onClick} disabled={disabled}>
      Delete
    </button>
  ),
}));

vi.mock("../../../shared/SearchButton", () => ({
  default: () => <div data-testid="search-button" />,
}));

vi.mock("./AddEditLookupForm", () => ({
  AddLookupForm: ({
    visible,
    onHide,
    onSuccess,
  }: {
    visible: boolean;
    onHide: () => void;
    onSuccess: () => void;
  }) =>
    visible ? (
      <div data-testid="add-edit-dialog">
        <button type="button" data-testid="dialog-success" onClick={() => { onSuccess(); onHide(); }}>
          OK
        </button>
        <button type="button" data-testid="dialog-hide" onClick={onHide}>
          Close
        </button>
      </div>
    ) : null,
}));

vi.mock("./DeleteLookupForm", () => ({
  DeleteLookupForm: () => null,
}));

const mockData: LookupEntry[] = [
  { lookupKey: 1, tag: "tag1", value: "value1" },
  { lookupKey: 2, tag: "tag2", value: "value2" },
];

describe("LookupTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders title and passes data to DataTable", () => {
    render(<LookupTable data={mockData} />);

    expect(screen.getByText("Lookup Data")).toBeInTheDocument();
    expect(screen.getByTestId("data-table")).toBeInTheDocument();
    expect(DataTable).toHaveBeenCalled();
    const props = (DataTable as unknown as { mock: { calls: unknown[][] } }).mock.calls[0][0] as {
      value: LookupEntry[];
      rows: number;
    };
    expect(props.value).toEqual(mockData);
    expect(props.rows).toBe(20);
  });

  it("shows empty message when data is empty", () => {
    render(<LookupTable data={[]} />);
    expect(screen.getByTestId("empty-message")).toHaveTextContent("No lookup entries found");
  });

  it("disables edit/delete until selection", () => {
    render(<LookupTable data={mockData} />);
    expect(screen.getByTestId("edit-button")).toBeDisabled();
    expect(screen.getByTestId("delete-button")).toBeDisabled();
  });

  it("calls onDataChange after add success", async () => {
    const onDataChange = vi.fn();
    const user = userEvent.setup();
    render(<LookupTable data={mockData} onDataChange={onDataChange} />);

    await user.click(screen.getByTestId("add-button"));
    await user.click(screen.getByTestId("dialog-success"));

    expect(onDataChange).toHaveBeenCalled();
  });
});
