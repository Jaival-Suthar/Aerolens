import { jsx as _jsx } from "react/jsx-runtime";
import { Button } from "primereact/button";
import { FaTrash } from "react-icons/fa";
const DeleteButton = ({ onClick, disabled, tooltip }) => (_jsx(Button, { onClick: onClick, disabled: disabled, "aria-label": "Delete", tooltip: tooltip || "Delete", tooltipOptions: { position: "bottom" }, rounded: true, text: false, className: "font-medium mr-1", style: {
        backgroundColor: "#f8d7da", // pastel red
        color: "#721c24", // deeper red for icon
        border: "none",
        boxShadow: "none",
        width: 40,
        height: 40,
        padding: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    }, children: _jsx(FaTrash, { style: { color: "#721c24", fontSize: 20 } }) }));
export default DeleteButton;
