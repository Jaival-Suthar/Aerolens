import React from "react";
import { Button } from "primereact/button";

interface RecordResultsButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

/**
 * Special Call-to-Action button for recording post-interview results
 * Matches the light, subtle theme of the AddButton
 */
const RecordResultsButton: React.FC<RecordResultsButtonProps> = ({
  onClick,
  disabled = false,
}) => {
  return (
    <Button
      label="Record Results"
      icon="pi pi-star-fill"
      onClick={onClick}
      disabled={disabled}
      tooltip="Record interview rounds and results (Post-Interview)"
      tooltipOptions={{ position: 'bottom' }}
      className="record-results-btn"
      style={{
        fontWeight: '500',
        fontSize: 14,
        backgroundColor: disabled ? '#f0f0f0' : '#e3f1fc',
        color: disabled ? '#a3a3a3' : '#1976d2',
        border: 'none',
        borderRadius: 8,
        padding: '0.5rem 1.25rem',
        boxShadow: disabled ? 'none' : '0 2px 4px rgba(25, 118, 210, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease-in-out',
      }}
    />
  );
};

export default RecordResultsButton;
