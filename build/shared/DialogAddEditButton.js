import { jsx as _jsx } from "react/jsx-runtime";
import { Button } from "primereact/button";
const DialogButton = ({ label, severity = "success", icon = null, onClick, className = "", disabled = false, loading = false, // <-- add this default
 }) => {
    return (_jsx(Button, { label: label, severity: severity, icon: icon, size: "small", onClick: onClick, className: `w-auto ${className}`, disabled: disabled, loading: loading, style: {
            padding: "0.4rem 1rem",
            borderRadius: "6px",
            fontWeight: severity === "secondary" ? 500 : 600,
        } }));
};
export default DialogButton;
