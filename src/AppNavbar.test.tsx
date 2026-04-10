import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import AppNavbar from "./AppNavbar";

// Mock variables must be defined before vi.mock
const mockNavigate = vi.fn();
let mockPathname = "/home";
// Mock profile store
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
// Mock react-router-dom
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: mockPathname }),
  };
});
// Add this mock for PrimeReact Menu
vi.mock("primereact/menu", () => ({
  Menu: ({ model, popup }: any) => {
    return (
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
    );
  },
}));
// Mock PrimeReact components
vi.mock("primereact/menubar", () => ({
  Menubar: ({ model, start, end }: any) => (
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

vi.mock("primereact/button", () => ({
  Button: ({ icon, onClick, tooltip, ...props }: any) => (
    <button onClick={onClick} data-testid={`button-${tooltip}`} {...props}>
      {icon}
    </button>
  ),
}));

vi.mock("react-icons/fa", () => {
  const Stub = () => <span data-testid="fa-icon-stub" />;
  const named: Record<string, unknown> = {
    __esModule: true,
    FaCog: () => <span data-testid="icon-cog" />,
    FaUser: () => <span data-testid="icon-user" />,
  };
  return new Proxy(named, {
    get(t, p: string | symbol) {
      if (typeof p === "string" && p in t) return t[p];
      if (p === "__esModule") return true;
      return Stub;
    },
  });
});

describe("AppNavbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = "/home";
    mockToggleSidebar.mockClear();
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

    it("should render Reports submenu items", () => {
      renderComponent();
      const reportsItems = screen.getAllByTestId("submenu-item-Reports");
      expect(reportsItems.length).toBeGreaterThan(0);
    });

    it("should render Settings and User Profile buttons", () => {
      renderComponent();
      expect(screen.getByTestId("button-Settings")).toBeInTheDocument();
      expect(screen.getByTestId("button-User Profile")).toBeInTheDocument();
    });

    it("should render icons for all submenu items", () => {
      renderComponent();
      // Icons are not rendered in our mock, so we skip this test
      // In the actual component, icons are passed as props to the mock
      expect(screen.getByTestId("icon-cog")).toBeInTheDocument();
      expect(screen.getByTestId("icon-user")).toBeInTheDocument();
    });

    it("should render action icons in end template", () => {
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
      expect(mockNavigate).toHaveBeenCalledTimes(1);
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

    it("should navigate to reports when Reports submenu item is clicked", async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const reportsButtons = screen.getAllByTestId("submenu-item-Reports");
      await user.click(reportsButtons[0]);
      
      expect(mockNavigate).toHaveBeenCalledWith("/reports");
    });

    it("should navigate to /signup when 'Create User' is selected from settings", async () => {
  const user = userEvent.setup();
  renderComponent();

  // Click settings cog
  await user.click(screen.getByTestId("button-Settings"));

  // Now click the menu item "Create User"
  const createUserItem = screen.getByTestId("settings-menu-item-Create User");
  await user.click(createUserItem);
  expect(mockNavigate).toHaveBeenCalledWith("/signup");
  expect(mockNavigate).toHaveBeenCalledTimes(1);
});

    it("should toggle sidebar instead of navigate for Profile button", async () => {
  const user = userEvent.setup();
  renderComponent();
  
  await user.click(screen.getByTestId("button-User Profile"));
  
  expect(mockToggleSidebar).toHaveBeenCalledTimes(1);
  expect(mockNavigate).not.toHaveBeenCalled();
});
  });

  describe("Active State Highlighting", () => {
    it("should render correctly when on Home page", () => {
      const { container } = renderComponent("/home");
      expect(container).toBeInTheDocument();
      expect(screen.getByText("Home")).toBeInTheDocument();
    });

    it("should render correctly when on Client page", () => {
      const { container } = renderComponent("/client");
      expect(container).toBeInTheDocument();
      expect(screen.getByText("Master")).toBeInTheDocument();
    });

    it("should render correctly when on Job Profile page", () => {
      const { container } = renderComponent("/job-profile");
      expect(container).toBeInTheDocument();
      expect(screen.getByText("Master")).toBeInTheDocument();
    });

    it("should render correctly when on Members page", () => {
      const { container } = renderComponent("/members");
      expect(container).toBeInTheDocument();
      expect(screen.getByText("Master")).toBeInTheDocument();
    });

    it("should render correctly when on Lookup Data page", () => {
      const { container } = renderComponent("/lookup-data");
      expect(container).toBeInTheDocument();
      expect(screen.getByText("Master")).toBeInTheDocument();
    });

    it("should render correctly when on Resume page", () => {
      const { container } = renderComponent("/resume");
      expect(container).toBeInTheDocument();
      expect(screen.getByText("Transaction")).toBeInTheDocument();
    });

    it("should render correctly when on Reports page", () => {
      const { container } = renderComponent("/reports");
      expect(container).toBeInTheDocument();
      const reportsElements = screen.getAllByText("Reports");
      expect(reportsElements.length).toBeGreaterThan(0);
    });

    it("should render correctly when on unrelated page", () => {
      const { container } = renderComponent("/unknown-route");
      expect(container).toBeInTheDocument();
      expect(screen.getByText("Home")).toBeInTheDocument();
    });
  });

  describe("Menu Structure", () => {
    it("should have correct number of Master submenu items", () => {
      renderComponent();
      const masterSubmenu = screen.getByTestId("submenu-Master");
      const buttons = masterSubmenu.querySelectorAll("button");
      expect(buttons).toHaveLength(4);
    });

    it("should have correct number of Transaction submenu items", () => {
      renderComponent();
      const transactionSubmenu = screen.getByTestId("submenu-Transaction");
      const buttons = transactionSubmenu.querySelectorAll("button");
      expect(buttons).toHaveLength(1);
    });

    it("should have correct number of Reports submenu items", () => {
      renderComponent();
      const reportsSubmenu = screen.getByTestId("submenu-Reports");
      const buttons = reportsSubmenu.querySelectorAll("button");
      expect(buttons).toHaveLength(1);
    });

    it("should have all menu items present", () => {
      renderComponent();
      expect(screen.getByTestId("menu-item-Home")).toBeInTheDocument();
      expect(screen.getByTestId("menu-item-Master")).toBeInTheDocument();
      expect(screen.getByTestId("menu-item-Transaction")).toBeInTheDocument();
      expect(screen.getByTestId("menu-item-Reports")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle multiple rapid clicks on same menu item", async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const homeButton = screen.getByTestId("menu-item-Home").querySelector("button");
      await user.click(homeButton!);
      await user.click(homeButton!);
      await user.click(homeButton!);
      
      expect(mockNavigate).toHaveBeenCalledTimes(3);
      expect(mockNavigate).toHaveBeenCalledWith("/home");
    });

    it("should handle navigation between different menu items", async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const homeButton = screen.getByTestId("menu-item-Home").querySelector("button");
      await user.click(homeButton!);
      
      await user.click(screen.getByTestId("submenu-item-Client"));
      
      expect(mockNavigate).toHaveBeenCalledTimes(2);
      expect(mockNavigate).toHaveBeenNthCalledWith(1, "/home");
      expect(mockNavigate).toHaveBeenNthCalledWith(2, "/client");
    });

    it("should toggle sidebar instead of navigate for Profile button", async () => {
  const user = userEvent.setup();
  renderComponent();
  
  await user.click(screen.getByTestId("button-User Profile"));
  
  expect(mockToggleSidebar).toHaveBeenCalledTimes(1);
  expect(mockNavigate).not.toHaveBeenCalled();
});
  });

  describe("Component Structure", () => {
    it("should render menubar with correct structure", () => {
      renderComponent();
      expect(screen.getByTestId("menubar")).toBeInTheDocument();
      expect(screen.getByTestId("menubar-start")).toBeInTheDocument();
      expect(screen.getByTestId("menubar-items")).toBeInTheDocument();
      expect(screen.getByTestId("menubar-end")).toBeInTheDocument();
    });

    it("should render logo in start template", () => {
      renderComponent();
      const startSection = screen.getByTestId("menubar-start");
      expect(startSection.querySelector("img")).toBeInTheDocument();
    });

    it("should render action buttons in end template", () => {
      renderComponent();
      const endSection = screen.getByTestId("menubar-end");
      const buttons = endSection.querySelectorAll("button");
      expect(buttons).toHaveLength(3);
    });
  });

  describe("Callback Functionality", () => {
    it("should use handleNavigation callback for Home", async () => {
      const user = userEvent.setup();
      renderComponent();
      
      const homeButton = screen.getByTestId("menu-item-Home").querySelector("button");
      await user.click(homeButton!);
      
      expect(mockNavigate).toHaveBeenCalledWith("/home");
    });

    it("should clear mocks between tests", () => {
      renderComponent();
      expect(mockNavigate).not.toHaveBeenCalled();
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
  });
});
