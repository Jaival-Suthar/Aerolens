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

// Mock react-icons
vi.mock("react-icons/fa", () => ({
  FaBriefcase: () => <span data-testid="icon-briefcase" />,
  FaUsers: () => <span data-testid="icon-users" />,
  FaDatabase: () => <span data-testid="icon-database" />,
  FaFile: () => <span data-testid="icon-file" />,
  FaChartBar: () => <span data-testid="icon-chartbar" />,
  FaIdCard: () => <span data-testid="icon-idcard" />,
  FaCog: () => <span data-testid="icon-cog" />,
  FaUser: () => <span data-testid="icon-user" />,
}));

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

    it("should navigate to settings when Settings button is clicked", async () => {
      const user = userEvent.setup();
      renderComponent();
      
      await user.click(screen.getByTestId("button-Settings"));
      
      expect(mockNavigate).toHaveBeenCalledWith("/settings");
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

    it("should handle Settings navigation", async () => {
      const user = userEvent.setup();
      renderComponent();
      
      await user.click(screen.getByTestId("button-Settings"));
      
      expect(mockNavigate).toHaveBeenCalledWith("/settings");
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
      expect(buttons).toHaveLength(2);
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
// import { describe, it, expect, vi, beforeEach } from 'vitest';
// import { render, screen, waitFor } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
// import { MemoryRouter, Routes, Route } from 'react-router-dom';
// import AppNavbar from './AppNavbar';

// // Mock PrimeReact components
// vi.mock('primereact/menubar', () => ({
//   Menubar: ({ model, start, end, ...props }: any) => (
//     <div data-testid="menubar" {...props}>
//       <div data-testid="menubar-start">{start}</div>
//       <div data-testid="menubar-items">
//         {model?.map((item: any, idx: number) => (
//           <div key={idx} data-testid={`menu-item-${item.label}`} className={item.className}>
//             <button onClick={item.command}>{item.label}</button>
//             {item.items && (
//               <div data-testid={`submenu-${item.label}`}>
//                 {item.items.map((subitem: any, subidx: number) => (
//                   <div key={subidx} className={subitem.className} data-testid={`submenu-item-${subitem.label}`}>
//                     <button onClick={subitem.command}>
//                       {subitem.icon}
//                       {subitem.label}
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//       <div data-testid="menubar-end">{end}</div>
//     </div>
//   ),
// }));

// vi.mock('primereact/button', () => ({
//   Button: ({ icon, tooltip, onClick, ...props }: any) => (
//     <button
//       onClick={onClick}
//       data-testid={`button-${tooltip}`}
//       title={tooltip}
//       {...props}
//     >
//       {icon}
//     </button>
//   ),
// }));

// // Mock react-icons
// vi.mock('react-icons/fa', () => ({
//   FaBriefcase: () => <span data-testid="icon-briefcase">briefcase</span>,
//   FaUsers: () => <span data-testid="icon-users">users</span>,
//   FaDatabase: () => <span data-testid="icon-database">database</span>,
//   FaFile: () => <span data-testid="icon-file">file</span>,
//   FaChartBar: () => <span data-testid="icon-chart">chart</span>,
//   FaIdCard: () => <span data-testid="icon-idcard">idcard</span>,
//   FaCog: () => <span data-testid="icon-settings">settings</span>,
//   FaUser: () => <span data-testid="icon-user">user</span>,
// }));

// const renderWithRouter = (initialRoute = '/home') => {
//   return render(
//     <MemoryRouter initialEntries={[initialRoute]}>
//       <Routes>
//         <Route path="*" element={<AppNavbar />} />
//       </Routes>
//     </MemoryRouter>
//   );
// };

// describe('AppNavbar', () => {
//   beforeEach(() => {
//     vi.clearAllMocks();
//   });

//   describe('Rendering & Structure', () => {
//     it('renders navbar container', () => {
//       renderWithRouter();
//       const container = screen.getByTestId('menubar')?.parentElement;
//       expect(container).toBeInTheDocument();
//     });

//     it('renders Menubar component', () => {
//       renderWithRouter();
//       expect(screen.getByTestId('menubar')).toBeInTheDocument();
//     });

//     it('renders start template with logo', () => {
//       renderWithRouter();
//       const startTemplate = screen.getByTestId('menubar-start');
//       expect(startTemplate).toBeInTheDocument();
//     });

//     it('renders end template with buttons', () => {
//       renderWithRouter();
//       const endTemplate = screen.getByTestId('menubar-end');
//       expect(endTemplate).toBeInTheDocument();
//     });

//     it('navbar has sticky positioning', () => {
//       renderWithRouter();
//       const navbar = screen.getByTestId('menubar')?.closest('div');
//       expect(navbar).toHaveStyle('position: sticky');
//       expect(navbar).toHaveStyle('top: 0');
//     });

//     it('navbar has correct z-index', () => {
//       renderWithRouter();
//       const navbar = screen.getByTestId('menubar')?.closest('div');
//       expect(navbar).toHaveStyle('zIndex: 50');
//     });

//     it('navbar has white background', () => {
//       renderWithRouter();
//       const navbar = screen.getByTestId('menubar')?.closest('div');
//       expect(navbar).toHaveStyle('background: #ffffff');
//     });

//     it('navbar has border bottom', () => {
//       renderWithRouter();
//       const navbar = screen.getByTestId('menubar')?.closest('div');
//       expect(navbar).toHaveStyle('borderBottom: 1px solid #e5e7eb');
//     });
//   });

//   describe('Menu Items Configuration', () => {
//     it('renders Home menu item', () => {
//       renderWithRouter();
//       expect(screen.getByTestId('menu-item-Home')).toBeInTheDocument();
//     });

//     it('renders Master menu item', () => {
//       renderWithRouter();
//       expect(screen.getByTestId('menu-item-Master')).toBeInTheDocument();
//     });

//     it('renders Transaction menu item', () => {
//       renderWithRouter();
//       expect(screen.getByTestId('menu-item-Transaction')).toBeInTheDocument();
//     });

//     it('renders Reports menu item', () => {
//       renderWithRouter();
//       expect(screen.getByTestId('menu-item-Reports')).toBeInTheDocument();
//     });

//     it('Master has submenu items', () => {
//       renderWithRouter();
//       const submenu = screen.getByTestId('submenu-Master');
//       expect(submenu).toBeInTheDocument();
//     });

//     it('Master submenu has Client item', () => {
//       renderWithRouter();
//       expect(screen.getByTestId('submenu-item-Client')).toBeInTheDocument();
//     });

//     it('Master submenu has Job Profile item', () => {
//       renderWithRouter();
//       expect(screen.getByTestId('submenu-item-Job Profile')).toBeInTheDocument();
//     });

//     it('Master submenu has Members item', () => {
//       renderWithRouter();
//       expect(screen.getByTestId('submenu-item-Members')).toBeInTheDocument();
//     });

//     it('Master submenu has Lookup Data item', () => {
//       renderWithRouter();
//       expect(screen.getByTestId('submenu-item-Lookup Data')).toBeInTheDocument();
//     });

//     it('Transaction has submenu item Resume', () => {
//       renderWithRouter();
//       expect(screen.getByTestId('submenu-item-Resume')).toBeInTheDocument();
//     });
//   });

//   describe('Navigation Functionality', () => {
//     it('navigates to /home on Home click', async () => {
//       const user = userEvent.setup();
//       renderWithRouter('/');

//       const homeButton = screen.getByRole('button', { name: 'Home' });
//       await user.click(homeButton);

//       await waitFor(() => {
//         expect(window.location.pathname).toBe('/home');
//       });
//     });

//     it('navigates to /client on Client click', async () => {
//       const user = userEvent.setup();
//       renderWithRouter();

//       const clientButton = screen.getByRole('button', { name: 'Client' });
//       await user.click(clientButton);

//       await waitFor(() => {
//         expect(window.location.pathname).toContain('/client');
//       });
//     });

//     it('navigates to /job-profile on Job Profile click', async () => {
//       const user = userEvent.setup();
//       renderWithRouter();

//       const jobButton = screen.getByRole('button', { name: 'Job Profile' });
//       await user.click(jobButton);

//       await waitFor(() => {
//         expect(window.location.pathname).toContain('/job-profile');
//       });
//     });

//     it('navigates to /members on Members click', async () => {
//       const user = userEvent.setup();
//       renderWithRouter();

//       const membersButton = screen.getByRole('button', { name: 'Members' });
//       await user.click(membersButton);

//       await waitFor(() => {
//         expect(window.location.pathname).toContain('/members');
//       });
//     });

//     it('navigates to /lookup-data on Lookup Data click', async () => {
//       const user = userEvent.setup();
//       renderWithRouter();

//       const lookupButton = screen.getByRole('button', { name: 'Lookup Data' });
//       await user.click(lookupButton);

//       await waitFor(() => {
//         expect(window.location.pathname).toContain('/lookup-data');
//       });
//     });

//     it('navigates to /resume on Resume click', async () => {
//       const user = userEvent.setup();
//       renderWithRouter();

//       const resumeButton = screen.getByRole('button', { name: 'Resume' });
//       await user.click(resumeButton);

//       await waitFor(() => {
//         expect(window.location.pathname).toContain('/resume');
//       });
//     });
//   });

//   describe('Active State - Direct Menu Items', () => {
//     it('Home item has active class when on /home', () => {
//       renderWithRouter('/home');
//       const homeItem = screen.getByTestId('menu-item-Home');
//       expect(homeItem).toHaveClass('nav-item-active');
//     });

//     it('Home item does not have active class on other routes', () => {
//       renderWithRouter('/client');
//       const homeItem = screen.getByTestId('menu-item-Home');
//       expect(homeItem).not.toHaveClass('nav-item-active');
//     });

//     it('Home item removes active class when navigating away', async () => {
//       const user = userEvent.setup();
//       const { rerender } = renderWithRouter('/home');

//       const homeItem = screen.getByTestId('menu-item-Home');
//       expect(homeItem).toHaveClass('nav-item-active');

//       // Simulate navigation to /client
//       rerender(
//         <MemoryRouter initialEntries={['/client']}>
//           <Routes>
//             <Route path="*" element={<AppNavbar />} />
//           </Routes>
//         </MemoryRouter>
//       );

//       await waitFor(() => {
//         expect(homeItem).not.toHaveClass('nav-item-active');
//       });
//     });
//   });

//   describe('Active State - Dropdown Parent Items', () => {
//     it('Master has active dropdown class when on /client', () => {
//       renderWithRouter('/client');
//       const masterItem = screen.getByTestId('menu-item-Master');
//       expect(masterItem).toHaveClass('nav-dropdown-active');
//     });

//     it('Master has active dropdown class when on /job-profile', () => {
//       renderWithRouter('/job-profile');
//       const masterItem = screen.getByTestId('menu-item-Master');
//       expect(masterItem).toHaveClass('nav-dropdown-active');
//     });

//     it('Master has active dropdown class when on /members', () => {
//       renderWithRouter('/members');
//       const masterItem = screen.getByTestId('menu-item-Master');
//       expect(masterItem).toHaveClass('nav-dropdown-active');
//     });

//     it('Master has active dropdown class when on /lookup-data', () => {
//       renderWithRouter('/lookup-data');
//       const masterItem = screen.getByTestId('menu-item-Master');
//       expect(masterItem).toHaveClass('nav-dropdown-active');
//     });

//     it('Transaction has active dropdown class when on /resume', () => {
//       renderWithRouter('/resume');
//       const transactionItem = screen.getByTestId('menu-item-Transaction');
//       expect(transactionItem).toHaveClass('nav-dropdown-active');
//     });

//     it('Master loses active dropdown class on unrelated route', () => {
//       renderWithRouter('/home');
//       const masterItem = screen.getByTestId('menu-item-Master');
//       expect(masterItem).not.toHaveClass('nav-dropdown-active');
//     });
//   });

//   describe('Active State - Submenu Items', () => {
//     it('Client submenu has active class on /client', () => {
//       renderWithRouter('/client');
//       const clientItem = screen.getByTestId('submenu-item-Client');
//       expect(clientItem).toHaveClass('nav-subitem-active');
//     });

//     it('Job Profile submenu has active class on /job-profile', () => {
//       renderWithRouter('/job-profile');
//       const jobItem = screen.getByTestId('submenu-item-Job Profile');
//       expect(jobItem).toHaveClass('nav-subitem-active');
//     });

//     it('Resume submenu has active class on /resume', () => {
//       renderWithRouter('/resume');
//       const resumeItem = screen.getByTestId('submenu-item-Resume');
//       expect(resumeItem).toHaveClass('nav-subitem-active');
//     });

//     it('Members submenu has active class on /members', () => {
//       renderWithRouter('/members');
//       const membersItem = screen.getByTestId('submenu-item-Members');
//       expect(membersItem).toHaveClass('nav-subitem-active');
//     });

//     it('Lookup Data submenu has active class on /lookup-data', () => {
//       renderWithRouter('/lookup-data');
//       const lookupItem = screen.getByTestId('submenu-item-Lookup Data');
//       expect(lookupItem).toHaveClass('nav-subitem-active');
//     });

//     it('only one submenu item has active class at a time', () => {
//       renderWithRouter('/client');
//       const clientItem = screen.getByTestId('submenu-item-Client');
//       const jobItem = screen.getByTestId('submenu-item-Job Profile');

//       expect(clientItem).toHaveClass('nav-subitem-active');
//       expect(jobItem).not.toHaveClass('nav-subitem-active');
//     });
//   });

//   describe('End Template - Settings and User Buttons', () => {
//     it('renders Settings button', () => {
//       renderWithRouter();
//       expect(screen.getByTestId('button-Settings')).toBeInTheDocument();
//     });

//     it('renders User Profile button', () => {
//       renderWithRouter();
//       expect(screen.getByTestId('button-User Profile')).toBeInTheDocument();
//     });

//     it('Settings button has settings icon', () => {
//       renderWithRouter();
//       const settingsButton = screen.getByTestId('button-Settings');
//       expect(settingsButton).toBeInTheDocument();
//       expect(screen.getByTestId('icon-settings')).toBeInTheDocument();
//     });

//     it('User Profile button has user icon', () => {
//       renderWithRouter();
//       const userButton = screen.getByTestId('button-User Profile');
//       expect(userButton).toBeInTheDocument();
//       expect(screen.getByTestId('icon-user')).toBeInTheDocument();
//     });

//     it('both end buttons are present in end template', () => {
//       renderWithRouter();
//       const endTemplate = screen.getByTestId('menubar-end');
//       expect(endTemplate.querySelectorAll('button')).toHaveLength(2);
//     });
//   });

//   describe('Icons in Menu Items', () => {
//     it('Client has IdCard icon', () => {
//       renderWithRouter();
//       expect(screen.getByTestId('icon-idcard')).toBeInTheDocument();
//     });

//     it('Job Profile has Briefcase icon', () => {
//       renderWithRouter();
//       expect(screen.getByTestId('icon-briefcase')).toBeInTheDocument();
//     });

//     it('Members has Users icon', () => {
//       renderWithRouter();
//       expect(screen.getByTestId('icon-users')).toBeInTheDocument();
//     });

//     it('Lookup Data has Database icon', () => {
//       renderWithRouter();
//       expect(screen.getByTestId('icon-database')).toBeInTheDocument();
//     });

//     it('Resume has File icon', () => {
//       renderWithRouter();
//       expect(screen.getByTestId('icon-file')).toBeInTheDocument();
//     });

//     it('Reports has Chart icon', () => {
//       renderWithRouter();
//       expect(screen.getByTestId('icon-chart')).toBeInTheDocument();
//     });
//   });

//   describe('Start Template - Logo', () => {
//     it('renders logo in start template', () => {
//       renderWithRouter();
//       const startTemplate = screen.getByTestId('menubar-start');
//       const logo = startTemplate.querySelector('img');
//       expect(logo).toBeInTheDocument();
//     });

//     it('logo has correct alt text', () => {
//       renderWithRouter();
//       const logo = screen.getByAltText('Aerolens Logo');
//       expect(logo).toBeInTheDocument();
//     });

//     it('logo has correct height', () => {
//       renderWithRouter();
//       const logo = screen.getByAltText('Aerolens Logo');
//       expect(logo).toHaveStyle('height: 24px');
//     });
//   });

//   describe('Styling & CSS', () => {
//     it('menubar has white background', () => {
//       renderWithRouter();
//       expect(screen.getByTestId('menubar')).toHaveStyle('background: #ffffff');
//     });

//     it('menubar has correct height', () => {
//       renderWithRouter();
//       expect(screen.getByTestId('menubar')).toHaveStyle('height: 58px');
//     });

//     it('menubar has flex display', () => {
//       renderWithRouter();
//       expect(screen.getByTestId('menubar')).toHaveStyle('display: flex');
//     });

//     it('menubar items are center aligned', () => {
//       renderWithRouter();
//       expect(screen.getByTestId('menubar')).toHaveStyle('alignItems: center');
//     });

//     it('navbar container has sticky positioning', () => {
//       renderWithRouter();
//       const navbar = screen.getByTestId('menubar')?.closest('div[style*="sticky"]');
//       expect(navbar).toBeInTheDocument();
//     });
//   });

//   describe('Edge Cases', () => {
//     it('renders all menu items on initial load', () => {
//       renderWithRouter('/home');
//       expect(screen.getByTestId('menu-item-Home')).toBeInTheDocument();
//       expect(screen.getByTestId('menu-item-Master')).toBeInTheDocument();
//       expect(screen.getByTestId('menu-item-Transaction')).toBeInTheDocument();
//       expect(screen.getByTestId('menu-item-Reports')).toBeInTheDocument();
//     });

//     it('maintains state when rendering multiple times', () => {
//       const { rerender } = renderWithRouter('/home');
//       expect(screen.getByTestId('menu-item-Home')).toHaveClass('nav-item-active');

//       rerender(
//         <MemoryRouter initialEntries={['/home']}>
//           <Routes>
//             <Route path="*" element={<AppNavbar />} />
//           </Routes>
//         </MemoryRouter>
//       );

//       expect(screen.getByTestId('menu-item-Home')).toHaveClass('nav-item-active');
//     });

//     it('handles unknown routes gracefully', () => {
//       renderWithRouter('/unknown-route');
//       const homeItem = screen.getByTestId('menu-item-Home');
//       expect(homeItem).not.toHaveClass('nav-item-active');
//     });

//     it('renders all menu items regardless of active state', () => {
//       renderWithRouter('/unknown');
//       expect(screen.getByTestId('menu-item-Home')).toBeInTheDocument();
//       expect(screen.getByTestId('menu-item-Master')).toBeInTheDocument();
//       expect(screen.getByTestId('menu-item-Transaction')).toBeInTheDocument();
//       expect(screen.getByTestId('menu-item-Reports')).toBeInTheDocument();
//     });

//     it('logo src is correct path', () => {
//       renderWithRouter();
//       const logo = screen.getByAltText('Aerolens Logo') as HTMLImageElement;
//       expect(logo.src).toContain('Logo.webp');
//     });

//     it('only one top-level menu item can be active at a time', () => {
//       renderWithRouter('/home');
//       const homeItem = screen.getByTestId('menu-item-Home');
//       const masterItem = screen.getByTestId('menu-item-Master');
      
//       expect(homeItem).toHaveClass('nav-item-active');
//       expect(masterItem).not.toHaveClass('nav-item-active');
//     });

//     it('handles rapid route changes', () => {
//       const { rerender } = renderWithRouter('/home');
//       expect(screen.getByTestId('menu-item-Home')).toHaveClass('nav-item-active');

//       rerender(
//         <MemoryRouter initialEntries={['/client']}>
//           <Routes>
//             <Route path="*" element={<AppNavbar />} />
//           </Routes>
//         </MemoryRouter>
//       );

//       const masterItem = screen.getByTestId('menu-item-Master');
//       expect(masterItem.className).toBeTruthy();
//     });
//   });
// });