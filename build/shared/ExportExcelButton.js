import { jsx as _jsx } from "react/jsx-runtime";
import { Button } from "primereact/button";
import { FaFileExcel } from "react-icons/fa";
const ExportExcelButton = ({ dtRef, label = "Export", disabled, tooltip }) => {
    const handleExport = () => {
        dtRef.current?.exportCSV();
    };
    return (_jsx(Button, { onClick: handleExport, disabled: disabled, "aria-label": label, tooltip: tooltip || label, tooltipOptions: { position: "bottom" }, rounded: true, text: false, className: "font-medium mr-1", style: {
            backgroundColor: "#d4edda", // pastel green
            color: "#155724", // dark green for icon
            border: "none",
            boxShadow: "none",
            width: 40,
            height: 40,
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }, children: _jsx(FaFileExcel, { style: { color: "#155724", fontSize: 20 } }) }));
};
export default ExportExcelButton;
