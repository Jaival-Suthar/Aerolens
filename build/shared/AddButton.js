import { jsx as _jsx } from "react/jsx-runtime";
import { Button } from "primereact/button";
import { FaPlus } from "react-icons/fa";
const AddButton = ({ onClick, disabled, tooltip }) => (_jsx(Button, { onClick: onClick, disabled: disabled, "aria-label": "Add", tooltip: tooltip || "Add", tooltipOptions: { position: "bottom" }, rounded: true, text: false, className: "font-medium mr-1", style: {
        backgroundColor: "#e3f1fc",
        color: "#1976d2",
        border: "none",
        boxShadow: "none",
        width: 40,
        height: 40,
        padding: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    }, children: _jsx(FaPlus, { style: { color: "#1976d2", fontSize: 20 } }) }));
export default AddButton;
