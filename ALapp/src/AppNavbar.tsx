import React, { useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menubar } from "primereact/menubar";
import { Button } from "primereact/button";

const AppNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = useCallback(
    (path: string) => {
      navigate(path);
    },
    [navigate]
  );

  // Helper function to check if a menu item or its children are active
  const isMenuActive = (path?: string, childrenPaths?: string[]) => {
    if (path && location.pathname === path) return true;
    if (childrenPaths) {
      return childrenPaths.some(childPath => location.pathname === childPath);
    }
    return false;
  };

  // Menubar items configuration with active state classes
  const items = [
    {
      label: "Home",
      icon: "pi pi-id-card",
      command: () => handleNavigation("/home"),
      className: isMenuActive("/home") ? "nav-item-active" : "",
    },
    {
      label: "Master",
      className: isMenuActive(undefined, ["/client", "/job-profile"]) ? "nav-item-active nav-dropdown-active" : "",
      items: [
        {
          label: "Client",
          icon: "pi pi-id-card",
          command: () => handleNavigation("/client"),
          className: isMenuActive("/client") ? "nav-subitem-active" : "",
        },
        {
          label: "Job Profile",
          icon: "pi pi-briefcase",
          command: () => handleNavigation("/job-profile"),
          className: isMenuActive("/job-profile") ? "nav-subitem-active" : "",
        },
        {
          label: "Members",
          icon: "pi pi-users",
          command: () => handleNavigation("/members"),
          className: isMenuActive("/members") ? "nav-subitem-active" : "",
        },
        {
          label: "Lookup Data",
          icon: "pi pi-database",
          command: () => handleNavigation("/lookup-data"),
          className: isMenuActive("/lookup-data") ? "nav-subitem-active" : "",
        }
      ],
    },
    {
      label: "Transaction",
      className: isMenuActive(undefined, ["/resume"]) ? "nav-item-active nav-dropdown-active" : "",
      items: [
        {
          label: "Resume",
          icon: "pi pi-file",
          command: () => handleNavigation("/resume"),
          className: isMenuActive("/resume") ? "nav-subitem-active" : "",
        },
      ],
    },
    {
      label: "Reports",
      className: isMenuActive(undefined, ["/reports"]) ? "nav-item-active nav-dropdown-active" : "",
      items: [
        {
          label: "Reports",
          icon: "pi pi-chart-bar",}
      ]
    },
  ];

  const startTemplate = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: "40px",
        paddingLeft: 24,
        paddingRight: 24,
        color: "#000000",
        fontWeight: 600,
        fontSize: 16,
        gap: 8,
      }}
    >
      <img
        src="/src/assets/Logo.webp"
        alt="Aerolens Logo"
        style={{
          height: 24,
          width: "auto",
          filter: "brightness(0) saturate(100%) invert(0%)",
        }}
      />
    </div>
  );

  const endTemplate = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: "40px",
        paddingRight: 24,
        gap: 2,
      }}
    >
      <Button
        icon="pi pi-cog"
        className="p-button-rounded p-button-text large"
        tooltip="Settings"
        tooltipOptions={{ position: "bottom" }}
        style={{
          width: 32,
          height: 32,
          color: "#666666",
          fontSize: 15,
        }}
      />
      <Button
        icon="pi pi-user"
        className="p-button-rounded p-button-text large"
        tooltip="User Profile"
        tooltipOptions={{ position: "bottom" }}
        style={{
          width: 32,
          height: 32,
          color: "#666666",
          fontSize: 15,
        }}
      />
    </div>
  );

  return (
    <>
      <style>{`
        .p-menubar-root-list > li > .p-menuitem-link .p-menuitem-text {
          padding-right: 1.5rem; /* Adjust padding for no arrow */
        }
        .p-menubar-root-list > li > ul {
          top: 58px !important; /* Align dropdown right below navbar */
        }
        .p-menubar-root-list > li > .p-menuitem-link > .pi-angle-down {
          display: none !important; /* Hide dropdown arrow */
        }
        
        /* Active state for direct menu items */
        .nav-item-active > .p-menuitem-link {
          font-weight: 600 !important;
          color: #000000 !important;
          border-bottom: 2px solid #000000 !important;
          background: rgba(0, 0, 0, 0.02) !important;
        }
        
        /* Active state for dropdown parent items */
        .nav-dropdown-active > .p-menuitem-link {
          font-weight: 600 !important;
          color: #000000 !important;
          background: rgba(0, 0, 0, 0.04) !important;
          border-bottom: 2px solid #3b82f6 !important; /* Blue indicator for dropdown parents */
        }
        
        /* Active state for submenu items */
        .nav-subitem-active > .p-menuitem-link {
          font-weight: 600 !important;
          color: #3b82f6 !important;
          background: rgba(59, 130, 246, 0.1) !important;
        }
        
        /* Hover states */
        .p-menubar-root-list > li > .p-menuitem-link:hover {
          background: rgba(0, 0, 0, 0.03) !important;
        }
        
        .p-menubar-submenu .p-menuitem-link:hover {
          background: rgba(59, 130, 246, 0.05) !important;
        }
        
        /* Ensure active states override hover */
        .nav-item-active > .p-menuitem-link:hover,
        .nav-dropdown-active > .p-menuitem-link:hover {
          background: rgba(0, 0, 0, 0.06) !important;
        }
        
        .nav-subitem-active > .p-menuitem-link:hover {
          background: rgba(59, 130, 246, 0.15) !important;
        }
        
        /* Smooth transitions */
        .p-menuitem-link {
          transition: all 0.2s ease !important;
        }
      `}</style>

      <div
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <Menubar
          model={items}
          start={startTemplate}
          end={endTemplate}
          style={{
            borderRadius: 0,
            background: "#ffffff",
            border: "none",
            padding: 0,
            height: 58,
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
            display: "flex",
            alignItems: "center",
          }}
          className="shadow-none"
        />
      </div>
    </>
  );
};

export default AppNavbar;