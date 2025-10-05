import React from "react";
import { Button } from "primereact/button";
import { FaFileExcel } from "react-icons/fa";
import { DataTable } from "primereact/datatable";

type ExportExcelButtonProps = {
  dtRef: React.RefObject<React.ElementRef<typeof DataTable>>;
  label?: string;
  disabled?: boolean;
  tooltip?: string;
};

const ExportExcelButton: React.FC<ExportExcelButtonProps> = ({ dtRef, label = "Export", disabled, tooltip }) => {
  const handleExport = () => {
    dtRef.current?.exportCSV();
  };

  return (
    <Button
      onClick={handleExport}
      disabled={disabled}
      aria-label={label}
      tooltip={tooltip || label}
      tooltipOptions={{ position: "bottom" }}
      rounded
      text={false}
      className="font-medium mr-1"
      style={{
        backgroundColor: "#d4edda",   // pastel green
        color: "#155724",             // dark green for icon
        border: "none",
        boxShadow: "none",
        width: 40,
        height: 40,
        padding: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <FaFileExcel style={{ color: "#155724", fontSize: 20 }} />
    </Button>
  );
};

export default ExportExcelButton;
