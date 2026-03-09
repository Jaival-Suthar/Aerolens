import React, { useState, useRef } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { FaFileArchive } from "react-icons/fa";

type BulkPdfUploadButtonProps = {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  tooltip?: string;
};

const BulkPdfUploadButton: React.FC<BulkPdfUploadButtonProps> = ({
  onFileSelect,
  disabled,
  tooltip
}) => {
  const [visible, setVisible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const allowedTypes = [
    "application/zip",
    "application/x-zip-compressed"
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Please upload a valid PDF file.");
      return;
    }

    const maxSize = 50 * 1024 * 1024; // 50MB

    if (file.size > maxSize) {
      alert("File size exceeds 50MB limit");
      return;
    }

    onFileSelect(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setVisible(false);
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
        aria-label="Bulk PDF Upload"
        tooltip={tooltip || "Bulk PDF Upload"}
        tooltipOptions={{ position: "bottom" }}
        rounded
        text={false}
        className="font-medium mr-1"
        style={{
          backgroundColor: "#fdecea",
          color: "#b71c1c",
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
        <FaFileArchive style={{ color: "#b71c1c", fontSize: 20 }} />
      </Button>

      <Dialog
        header="Bulk PDF Upload"
        visible={visible}
        style={{ width: "400px" }}
        onHide={() => setVisible(false)}
        modal
      >
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          style={{
            border: "2px dashed #b71c1c",
            borderRadius: "8px",
            padding: "30px",
            textAlign: "center",
            cursor: "pointer",
            backgroundColor: "#fdecea"
          }}
          onClick={handleBrowseClick}
        >
          <FaFileArchive size={40} color="#b71c1c" />

          <p style={{ marginTop: "10px", fontWeight: 500 }}>
            Drag & Drop ZIP file here
          </p>

          <p style={{ fontSize: "0.85rem", color: "#555" }}>
            or click to browse (.zip)
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".zip"
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

export default BulkPdfUploadButton;