import React, { useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menubar } from "primereact/menubar";
import { Button } from "primereact/button";

type NavItem = {
  label: string;
  icon: string;
  path: string;
  description: string;
  size: "small" | "medium" | "large";
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    icon: "pi pi-id-card",
    path: "/dashboard",
    description: "View Dashboard and Analytics",
    size: "large",
  },
  {
    label: "Client",
    icon: "pi pi-id-card",
    path: "/client",
    description: "View Clients",
    size: "large",
  },
  {
    label: "Job Profile",
    icon: "pi pi-briefcase",
    path: "/job-profile",
    description: "View Job Profiles",
    size: "large",
  },
  {
    label: "Resume",
    icon: "pi pi-file",
    path: "/resume",
    description: "View Resumes",
    size: "large",
  }
];

const AppNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = useCallback(
    (path: string) => {
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
      template: () => (
        <div
          onClick={() => handleNavigation(item.path)}
          title={item.description}
          className={`nav-item ${isActive ? "nav-item-active" : ""}`}
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
          <span
            style={{
              lineHeight: "1.2",
              whiteSpace: "nowrap",
            }}
          >
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
      ),
    };
  });

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
        .nav-item:hover:not(.nav-item-active) {
          background-color: #f8f9fa !important;
          color: #333333 !important;
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
          model={model}
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
