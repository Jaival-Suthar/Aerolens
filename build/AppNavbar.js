import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menubar } from "primereact/menubar";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { FaBriefcase, FaUsers, FaDatabase, FaFile, FaChartBar, FaIdCard, FaCog, FaUser, } from "react-icons/fa";
import { useProfileStore } from "./shared/store/profile";
import Logo from "./assets/Logo.webp";
const AppNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toggleSidebar } = useProfileStore();
    const handleNavigation = useCallback((path) => {
        navigate(path);
    }, [navigate]);
    const isMenuActive = (path, childrenPaths) => {
        if (path && location.pathname === path)
            return true;
        if (childrenPaths)
            return childrenPaths.includes(location.pathname);
        return false;
    };
    // Settings dropdown
    const settingsMenu = useRef(null);
    const settingsItems = [
        {
            label: "Create User",
            icon: _jsx(FaUser, { style: { marginRight: 8, marginLeft: 4 } }),
            command: () => handleNavigation("/signup"),
        },
    ];
    const items = [
        {
            label: "Home",
            command: () => handleNavigation("/home"),
            className: isMenuActive("/home") ? "nav-item-active" : "",
        },
        {
            label: "Master",
            className: isMenuActive(undefined, ["/client", "/job-profile", "/members", "/lookup-data"])
                ? "nav-item-active nav-dropdown-active"
                : "",
            items: [
                {
                    label: "Client",
                    icon: _jsx(FaIdCard, { style: { marginRight: 8, marginLeft: 4 } }),
                    command: () => handleNavigation("/client"),
                    className: isMenuActive("/client") ? "nav-subitem-active" : "",
                },
                {
                    label: "Job Profile",
                    icon: _jsx(FaBriefcase, { style: { marginRight: 8, marginLeft: 4 } }),
                    command: () => handleNavigation("/job-profile"),
                    className: isMenuActive("/job-profile") ? "nav-subitem-active" : "",
                },
                {
                    label: "Members",
                    icon: _jsx(FaUsers, { style: { marginRight: 8, marginLeft: 4 } }),
                    command: () => handleNavigation("/members"),
                    className: isMenuActive("/members") ? "nav-subitem-active" : "",
                },
                {
                    label: "Lookup Data",
                    icon: _jsx(FaDatabase, { style: { marginRight: 8, marginLeft: 4 } }),
                    command: () => handleNavigation("/lookup-data"),
                    className: isMenuActive("/lookup-data") ? "nav-subitem-active" : "",
                },
            ],
        },
        {
            label: "Transaction",
            className: isMenuActive(undefined, ["/resume"])
                ? "nav-item-active nav-dropdown-active"
                : "",
            items: [
                {
                    label: "Resume",
                    icon: _jsx(FaFile, { style: { marginRight: 8, marginLeft: 4 } }),
                    command: () => handleNavigation("/resume"),
                    className: isMenuActive("/resume") ? "nav-subitem-active" : "",
                },
            ],
        },
        {
            label: "Reports",
            className: isMenuActive(undefined, ["/reports"])
                ? "nav-item-active nav-dropdown-active"
                : "",
            items: [
                {
                    label: "Reports",
                    icon: _jsx(FaChartBar, { style: { marginRight: 8, marginLeft: 4 } }),
                    command: () => handleNavigation("/reports"),
                    className: isMenuActive("/reports") ? "nav-subitem-active" : "",
                },
            ],
        },
    ];
    const startTemplate = (_jsx("div", { style: {
            display: "flex",
            alignItems: "center",
            height: "40px",
            paddingLeft: 24,
            paddingRight: 24,
            color: "#000000",
            fontWeight: 600,
            fontSize: 16,
            gap: 8,
        }, children: _jsx("img", { src: Logo, alt: "Aerolens Logo", style: {
                height: 24,
                width: "auto",
                filter: "brightness(0) saturate(100%) invert(0%)",
            } }) }));
    const endTemplate = (_jsxs("div", { style: {
            display: "flex",
            alignItems: "center",
            height: "40px",
            paddingRight: 24,
            gap: 4,
        }, children: [_jsxs("div", { style: { position: "relative" }, children: [_jsx(Menu, { model: settingsItems, popup: true, ref: settingsMenu }), _jsx(Button, { icon: _jsx(FaCog, {}), className: "p-button-rounded p-button-text", tooltip: "Settings", tooltipOptions: { position: "bottom" }, style: {
                            width: 32,
                            height: 32,
                            color: "#666666",
                            fontSize: 15,
                        }, onClick: (event) => settingsMenu.current?.toggle(event) })] }), _jsx(Button, { icon: _jsx(FaUser, {}), className: "p-button-rounded p-button-text", tooltip: "User Profile", tooltipOptions: { position: "bottom" }, style: {
                    width: 32,
                    height: 32,
                    color: "#666666",
                    fontSize: 15,
                }, onClick: toggleSidebar })] }));
    return (_jsxs(_Fragment, { children: [_jsx("style", { children: `
        /* --- Base Menubar Customization --- */
        .p-menubar-root-list > li > .p-menuitem-link .p-menuitem-text {
          padding-right: 1.5rem;
        }
        .p-menubar-root-list > li > ul {
          top: 58px !important;
        }
        .p-menubar-root-list > li > .p-menuitem-link > .pi-angle-down {
          display: none !important;
        }

        /* --- Active States --- */
        .nav-item-active > .p-menuitem-link {
          font-weight: 600 !important;
          color: #000 !important;
          border-bottom: 2px solid #000 !important;
          background: rgba(0, 0, 0, 0.02) !important;
        }
        .nav-dropdown-active > .p-menuitem-link {
          font-weight: 600 !important;
          color: #000 !important;
          background: rgba(0, 0, 0, 0.04) !important;
          border-bottom: 2px solid #3b82f6 !important;
        }
        .nav-subitem-active > .p-menuitem-link {
          font-weight: 600 !important;
          color: #3b82f6 !important;
          background: rgba(59, 130, 246, 0.1) !important;
        }

        /* --- Hover States --- */
        .p-menubar-root-list > li > .p-menuitem-link:hover {
          background: rgba(0, 0, 0, 0.03) !important;
        }
        .p-menubar-submenu .p-menuitem-link:hover {
          background: rgba(59, 130, 246, 0.05) !important;
        }
        .nav-item-active > .p-menuitem-link:hover,
        .nav-dropdown-active > .p-menuitem-link:hover {
          background: rgba(0, 0, 0, 0.06) !important;
        }
        .nav-subitem-active > .p-menuitem-link:hover {
          background: rgba(59, 130, 246, 0.15) !important;
        }

        /* --- Transition --- */
        .p-menuitem-link {
          transition: all 0.2s ease !important;
        }

        /* --- Responsive (optional tweak) --- */
        @media (max-width: 768px) {
          .p-menubar {
            font-size: 14px;
          }
        }
      ` }), _jsx("div", { style: {
                    background: "#fff",
                    borderBottom: "1px solid #e5e7eb",
                    position: "sticky",
                    top: 0,
                    zIndex: 50,
                }, children: _jsx(Menubar, { model: items, start: startTemplate, end: endTemplate, style: {
                        borderRadius: 0,
                        background: "#ffffff",
                        border: "none",
                        padding: 0,
                        height: 58,
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
                        display: "flex",
                        alignItems: "center",
                    }, className: "shadow-none" }) })] }));
};
export default AppNavbar;
