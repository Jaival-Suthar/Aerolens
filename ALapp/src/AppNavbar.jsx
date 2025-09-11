import React, { useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menubar } from "primereact/menubar";
import { Button } from "primereact/button";

const navItems = [
  {
    label: "Client",
    icon: "pi pi-id-card",
    path: "/client",
    description: "View Clients",
    size: "large"
  },
  {
    label: "Clients",
    icon: "pi pi-building",
    path: "/department",
    description: "Manage company departments",
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
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = useCallback(
    (path) => {
      navigate(path);
    },
    [navigate]
  );

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
            <span 
              className={item.icon} 
              aria-hidden="true"
              style={{
                fontSize: "16px",
                lineHeight: "1",
              }}
            />
            
            <span style={{
              lineHeight: "1.2",
              whiteSpace: "nowrap",
            }}>
              {item.label}
            </span>

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
        paddingRight: "24px",
        gap: "2px",
      }}
    >
      <Button 
        icon="pi pi-cog" 
        className="p-button-rounded p-button-text large" 
        tooltip="Settings"
        tooltipOptions={{ position: "bottom" }}
        fontSize="15px"
        style={{
          width: "32px",
          height: "32px",
          color: "#666666",
          fontSize: "15px",
        }}
      />
      <Button 
        icon="pi pi-user" 
        className="p-button-rounded p-button-text large" 
        tooltip="User Profile" 
        tooltipOptions={{ position: "bottom" }}
        fontSize="15px"
        style={{
          width: "32px",
          height: "32px",
          color: "#666666",
          fontSize: "15px",
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