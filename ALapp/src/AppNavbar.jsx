import React, { useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menubar } from "primereact/menubar";
import { Button } from "primereact/button";

const navItems = [
  {
    label: "Dashboard",
    icon: "pi pi-home",
    path: "/dashboard",
    description: "View dashboard and analytics",
    size: "large"
  },
  {
    label: "Projects",
    icon: "pi pi-briefcase",
    path: "/projects",
    description: "Manage your projects",
    size: "large"
  },
  {
    label: "Reports",
    icon: "pi pi-chart-line",
    path: "/reports",
    description: "Generate and view reports",
    size: "large"
  },
];

const AppNavbar = () => {
  //console.log("Navbar Rendered");
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = useCallback(
    (path) => {
      navigate(path);
    },
    [navigate]
  );

  // Swiss design inspired navigation items with precise spacing
  const model = navItems.map((item) => {
    const isActive = location.pathname === item.path;

    return {
      label: item.label,
      icon: item.icon,
      command: () => handleNavigation(item.path),
      title: item.description,
      template: (_item, _options) => {
        return (
          <div
            onClick={() => handleNavigation(item.path)}
            title={item.description}
            className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              height: "40px",
              padding: "0 20px",
              marginRight: "8px",
              position: "relative",
              color: isActive ? "#000000" : "#666666",
              fontWeight: isActive ? "500" : "400",
              fontSize: "14px",
              userSelect: "none",
              gap: "6px",
              borderRadius: 0,
              backgroundColor: "transparent",
            }}
          >
            {/* Icon with consistent sizing */}
            <span 
              className={item.icon} 
              aria-hidden="true"
              style={{
                fontSize: "16px",
                lineHeight: "1",
              }}
            />
            
            {/* Label with Swiss typography principles */}
            <span style={{
              lineHeight: "1.2",
              whiteSpace: "nowrap",
            }}>
              {item.label}
            </span>

            {/* Active indicator - minimal underline */}
            {isActive && (
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: "24px",
                  right: "24px",
                  height: "2px",
                  backgroundColor: "#000000",
                }}
              />
            )}
          </div>
        );
      },
    };
  });

  // Brand section with Swiss minimalism
  const startTemplate = (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      height: "40px",
      paddingLeft: "24px",
      paddingRight: "24px",
      color: "#000000",
      fontWeight: "600",
      fontSize: "16px",
      gap: "8px",
    }}
  >
    <img
      src="/src/assets/Logo.webp"
      alt="Aerolens Logo"
      style={{
        height: "24px",
        width: "auto",
        filter: "brightness(0) saturate(100%) invert(0%)", // Makes logo black to match text
      }}
    />
  </div>
);
  // Actions section with proper spacing
  const endTemplate = (
    <div 
      style={{ 
        display: "flex",
        alignItems: "center",
        height: "40px",
        paddingRight: "24px",
        gap: "2px",
      }}
    >
      <Button 
        icon="pi pi-cog" 
        className="p-button-rounded p-button-text large" 
        tooltip="Settings"
        tooltipOptions={{ position: "bottom" }}
        style={{
          width: "32px",
          height: "32px",
          color: "#666666",
          fontSize: "14px",
        }}
      />
      <Button 
        icon="pi pi-user" 
        className="p-button-rounded p-button-text large" 
        tooltip="User Profile" 
        tooltipOptions={{ position: "bottom" }}
        style={{
          width: "32px",
          height: "32px",
          color: "#666666",
          fontSize: "14px",
        }}
      />
    </div>
  );

  return (
    <>
      <style>{`
        .nav-item:hover:not(.nav-item-active) {
          background-color: #f8f9fa !important;
          color: #333333 !important;
        }
      `}</style>
      <div style={{ 
        background: "#ffffff", 
        borderBottom: "1px solid #e5e7eb",
        position: "sticky", 
        top: 0, 
        zIndex: 50,
      }}>
        <Menubar
        model={model}
        start={startTemplate}
        end={endTemplate}
        style={{
          borderRadius: 0,
          background: "#ffffff",
          border: "none",
          padding: 0,
          height: "58px",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
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