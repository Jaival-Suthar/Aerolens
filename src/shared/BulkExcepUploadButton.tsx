import React, { useState, useRef } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { FaFileExcel } from "react-icons/fa";

type BulkExcelUploadButtonProps = {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  tooltip?: string;
};

const BulkExcelUploadButton: React.FC<BulkExcelUploadButtonProps> = ({
  onFileSelect,
  disabled,
  tooltip
}) => {
  const [visible, setVisible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file) {
      onFileSelect(file);
      setVisible(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <Button
        onClick={() => setVisible(true)}
        disabled={disabled}
        aria-label="Bulk Upload"
        tooltip={tooltip || "Bulk Excel Upload"}
        tooltipOptions={{ position: "bottom" }}
        rounded
        text={false}
        className="font-medium mr-1"
        style={{
          backgroundColor: "#e6f4ea",
          color: "#1b5e20",
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
        <FaFileExcel style={{ color: "#1b5e20", fontSize: 20 }} />
      </Button>

      <Dialog
        header="Bulk Excel Upload"
        visible={visible}
        style={{ width: "400px" }}
        onHide={() => setVisible(false)}
        modal
      >
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          style={{
            border: "2px dashed #1b5e20",
            borderRadius: "8px",
            padding: "30px",
            textAlign: "center",
            cursor: "pointer",
            backgroundColor: "#f1f8f4"
          }}
          onClick={handleBrowseClick}
        >
          <FaFileExcel size={40} color="#1b5e20" />
          <p style={{ marginTop: "10px", fontWeight: 500 }}>
            Drag & Drop Excel file here
          </p>
          <p style={{ fontSize: "0.85rem", color: "#555" }}>
            or click to browse (.xlsx, .xls)
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />
      </Dialog>
    </>
  );
};

export default BulkExcelUploadButton;
