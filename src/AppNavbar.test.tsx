import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import AppNavbar from "./AppNavbar";

const mockNavigate = vi.fn();
let mockPathname = "/home";
const mockToggleSidebar = vi.fn();

vi.mock('./shared/store/profile', () => ({
  useProfileStore: () => ({
    toggleSidebar: mockToggleSidebar,
    openSidebar: vi.fn(),
    closeSidebar: vi.fn(),
    member: null,
    isSidebarOpen: false,
    setProfile: vi.fn(),
    clearProfile: vi.fn(),
  }),
}));

vi.mock('./pages/Signup/components/SignupForm', () => ({
  default: () => null,
}));

vi.mock('react-phone-input-2', () => ({ default: () => null }));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: mockPathname }),
  };
});

vi.mock("primereact/menubar", () => ({
  Menubar: ({ model, start, end }: { model: any[]; start: any; end: any }) => (
    <div data-testid="menubar">
      <div data-testid="menubar-start">{start}</div>
      <div data-testid="menubar-items">
        {model.map((item: any, idx: number) => (
          <div key={idx} data-testid={`menu-item-${item.label}`}>
            <button onClick={item.command}>{item.label}</button>
            {item.items && (
              <div data-testid={`submenu-${item.label}`}>
                {item.items.map((subItem: any, subIdx: number) => (
                  <button
                    key={subIdx}
                    onClick={subItem.command}
                    data-testid={`submenu-item-${subItem.label}`}
                  >
                    {subItem.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div data-testid="menubar-end">{end}</div>
    </div>
  ),
}));

vi.mock("primereact/menu", () => ({
  Menu: ({ model }: { model: any[] }) => (
    <div data-testid="settings-menu">
      {model?.map((item: any, idx: number) => (
        <button
          key={idx}
          data-testid={`settings-menu-item-${item.label}`}
          onClick={item.command}
        >
          {item.label}
        </button>
      ))}
    </div>
  ),
}));

vi.mock("primereact/button", () => ({
  Button: ({ tooltip, onClick, icon }: { tooltip: string; onClick: () => void; icon?: any }) => (
    <button onClick={onClick} data-testid={`button-${tooltip}`}>
      {icon}
      {tooltip}
    </button>
  ),
}));

vi.mock("primereact/toast", () => ({
  Toast: () => null,
}));

vi.mock("react-icons/fa", () => ({
  FaClipboardList: () => <span data-testid="icon-clipboardlist" />,
  FaCog: () => <span data-testid="icon-cog" />,
  FaUser: () => <span data-testid="icon-user" />,
  FaUsers: () => <span />,
  FaDatabase: () => <span />,
  FaFile: () => <span />,
  FaChartBar: () => <span />,
  FaIdCard: () => <span />,
  FaUserTie: () => <span data-testid="icon-usertie" />,
  FaUserPlus: () => <span data-testid="icon-userplus" />,
  FaBuilding: () => <span data-testid="icon-building" />,
  FaLayerGroup: () => <span data-testid="icon-layergroup" />,
  FaRegCalendarAlt: () => <span data-testid="icon-calendar" />,
  FaBullseye: () => <span data-testid="icon-bullseye" />,
  FaHistory: () => <span data-testid="icon-history" />,
}));

describe("AppNavbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = "/home";
  });

  const renderComponent = (pathname = "/home") => {
    mockPathname = pathname;
    return render(
      <MemoryRouter>
        <AppNavbar />
      </MemoryRouter>
    );
  };

  describe("Rendering", () => {
    it("should render the navbar with logo", () => {
      renderComponent();
      expect(screen.getByAltText("Aerolens Logo")).toBeInTheDocument();
    });

    it("should render all top-level menu items", () => {
      renderComponent();
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Master")).toBeInTheDocument();
      expect(screen.getByText("Transaction")).toBeInTheDocument();
      expect(screen.getByTestId("menu-item-Reports")).toBeInTheDocument();
    });

    it("should render Master submenu items", () => {
      renderComponent();
      expect(screen.getByTestId("submenu-item-Client")).toBeInTheDocument();
      expect(screen.getByTestId("submenu-item-Job Profile")).toBeInTheDocument();
      expect(screen.getByTestId("submenu-item-Members")).toBeInTheDocument();
      expect(screen.getByTestId("submenu-item-Lookup Data")).toBeInTheDocument();
    });

    it("should render Transaction submenu items", () => {
      renderComponent();
      expect(screen.getByTestId("submenu-item-Resume")).toBeInTheDocument();
    });

    it("should render Settings and User Profile buttons", () => {
      renderComponent();
      expect(screen.getByTestId("button-Settings")).toBeInTheDocument();
      expect(screen.getByTestId("button-User Profile")).toBeInTheDocument();
    });

    it("should render icons", () => {
      renderComponent();
      expect(screen.getByTestId("icon-cog")).toBeInTheDocument();
      expect(screen.getByTestId("icon-user")).toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    it("should navigate to home when Home menu item is clicked", async () => {
      const user = userEvent.setup();
      renderComponent();
      const homeButton = screen.getByTestId("menu-item-Home").querySelector("button");
      await user.click(homeButton!);
      expect(mockNavigate).toHaveBeenCalledWith("/home");
    });

    it("should navigate to client when Client submenu item is clicked", async () => {
      const user = userEvent.setup();
      renderComponent();
      await user.click(screen.getByTestId("submenu-item-Client"));
      expect(mockNavigate).toHaveBeenCalledWith("/client");
    });

    it("should navigate to job-profile when Job Profile submenu item is clicked", async () => {
      const user = userEvent.setup();
      renderComponent();
      await user.click(screen.getByTestId("submenu-item-Job Profile"));
      expect(mockNavigate).toHaveBeenCalledWith("/job-profile");
    });

    it("should navigate to members when Members submenu item is clicked", async () => {
      const user = userEvent.setup();
      renderComponent();
      await user.click(screen.getByTestId("submenu-item-Members"));
      expect(mockNavigate).toHaveBeenCalledWith("/members");
    });

    it("should navigate to lookup-data when Lookup Data submenu item is clicked", async () => {
      const user = userEvent.setup();
      renderComponent();
      await user.click(screen.getByTestId("submenu-item-Lookup Data"));
      expect(mockNavigate).toHaveBeenCalledWith("/lookup-data");
    });

    it("should navigate to resume when Resume submenu item is clicked", async () => {
      const user = userEvent.setup();
      renderComponent();
      await user.click(screen.getByTestId("submenu-item-Resume"));
      expect(mockNavigate).toHaveBeenCalledWith("/resume");
    });

    it("should open signup dialog when 'Create User' settings item is clicked", async () => {
      const user = userEvent.setup();
      renderComponent();
      await user.click(screen.getByTestId("settings-menu-item-Create User"));
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should toggle sidebar when Profile button is clicked", async () => {
      const user = userEvent.setup();
      renderComponent();
      await user.click(screen.getByTestId("button-User Profile"));
      expect(mockToggleSidebar).toHaveBeenCalledTimes(1);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should navigate to /audit-logs when 'Audit Logs' is selected from settings", async () => {
  const user = userEvent.setup();
  renderComponent();

  await user.click(screen.getByTestId("button-Settings"));
  const auditLogsItem = screen.getByTestId("settings-menu-item-Audit Logs");
  await user.click(auditLogsItem);

  expect(mockNavigate).toHaveBeenCalledWith("/audit-logs");
});
  });

  describe("Active State Highlighting", () => {
    it("should render correctly when on Home page", () => {
      const { container } = renderComponent("/home");
      expect(container).toBeInTheDocument();
      expect(screen.getByText("Home")).toBeInTheDocument();
    });

    it("should render correctly when on Client page", () => {
      renderComponent("/client");
      expect(screen.getByText("Master")).toBeInTheDocument();
    });

    it("should render correctly when on Job Profile page", () => {
      renderComponent("/job-profile");
      expect(screen.getByText("Master")).toBeInTheDocument();
    });

    it("should render correctly when on Resume page", () => {
      renderComponent("/resume");
      expect(screen.getByText("Transaction")).toBeInTheDocument();
    });

    it("should render correctly on unrelated page", () => {
      renderComponent("/unknown-route");
      expect(screen.getByText("Home")).toBeInTheDocument();
    });
  });

  describe("Menu Structure", () => {
    it("should have correct Master submenu items count", () => {
      renderComponent();
      const masterSubmenu = screen.getByTestId("submenu-Master");
      const buttons = masterSubmenu.querySelectorAll("button");
      expect(buttons.length).toBeGreaterThanOrEqual(4);
    });

    it("should have Transaction submenu", () => {
      renderComponent();
      expect(screen.getByTestId("submenu-Transaction")).toBeInTheDocument();
    });

    it("should have Reports submenu", () => {
      renderComponent();
      expect(screen.getByTestId("submenu-Reports")).toBeInTheDocument();
    });

    it("should have all top-level menu items", () => {
      renderComponent();
      expect(screen.getByTestId("menu-item-Home")).toBeInTheDocument();
      expect(screen.getByTestId("menu-item-Master")).toBeInTheDocument();
      expect(screen.getByTestId("menu-item-Transaction")).toBeInTheDocument();
      expect(screen.getByTestId("menu-item-Reports")).toBeInTheDocument();
    });
  });

  describe("Component Structure", () => {
    it("should render menubar with correct structure", () => {
      renderComponent();
      expect(screen.getByTestId("menubar")).toBeInTheDocument();
      expect(screen.getByTestId("menubar-start")).toBeInTheDocument();
      expect(screen.getByTestId("menubar-end")).toBeInTheDocument();
    });

    it("should render logo in start template", () => {
      renderComponent();
      const startSection = screen.getByTestId("menubar-start");
      expect(startSection.querySelector("img")).toBeInTheDocument();
    });

    it("should navigate to all Master submenu paths", async () => {
      const user = userEvent.setup();
      renderComponent();
      await user.click(screen.getByTestId("submenu-item-Client"));
      await user.click(screen.getByTestId("submenu-item-Job Profile"));
      await user.click(screen.getByTestId("submenu-item-Members"));
      await user.click(screen.getByTestId("submenu-item-Lookup Data"));
      expect(mockNavigate).toHaveBeenCalledTimes(4);
      expect(mockNavigate).toHaveBeenCalledWith("/client");
      expect(mockNavigate).toHaveBeenCalledWith("/job-profile");
      expect(mockNavigate).toHaveBeenCalledWith("/members");
      expect(mockNavigate).toHaveBeenCalledWith("/lookup-data");
    });

    it("should handle multiple clicks on same item", async () => {
      const user = userEvent.setup();
      renderComponent();
      const homeButton = screen.getByTestId("menu-item-Home").querySelector("button");
      await user.click(homeButton!);
      await user.click(homeButton!);
      expect(mockNavigate).toHaveBeenCalledTimes(2);
    });

    it("should clear mocks between tests", () => {
      renderComponent();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
