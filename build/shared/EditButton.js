import { jsx as _jsx } from "react/jsx-runtime";
import { Button } from "primereact/button";
import { FaPencilAlt } from "react-icons/fa"; // Use FontAwesome pencil icon
const EditButton = ({ onClick, disabled, tooltip }) => (_jsx(Button, { onClick: onClick, disabled: disabled, "aria-label": "Edit", tooltip: tooltip || "Edit", tooltipOptions: { position: "bottom" }, rounded: true, text: false, className: "font-medium mr-1", style: {
        backgroundColor: "#d1ecf1", // light blue for edit
        color: "#0c5460", // dark blue/teal for icon
        border: "none", // no border
        boxShadow: "none",
        width: 40, // perfect circle
        height: 40,
        padding: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    }, children: _jsx(FaPencilAlt, { style: { color: "#0c5460", fontSize: 20 } }) }));
export default EditButton;
