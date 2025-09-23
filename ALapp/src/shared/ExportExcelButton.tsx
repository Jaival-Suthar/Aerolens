import React from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';

type ExportExcelButtonProps = {
  dtRef: React.RefObject<React.ElementRef<typeof DataTable>>;
  label?: string;
  disabled?: boolean;
  tooltip?: string;
};

const ExportExcelButton: React.FC<ExportExcelButtonProps> = ({ dtRef, label = 'Export', disabled, tooltip }) => {
  const handleExport = () => {
    dtRef.current?.exportCSV();
  };

  return (
    <Button
      icon="pi pi-file-excel"
      rounded
      text={false}
      severity="success"
      size="large"
      className="font-medium"
      onClick={handleExport}
      disabled={disabled}
      aria-label={label}
      tooltip={tooltip || label}
      tooltipOptions={{ position: 'bottom' }}
      style={{
        backgroundColor: '#d4edda',
        borderColor: '#c3e6cb',
        color: '#155724',
        borderWidth: '1.5px',
        borderStyle: 'solid'
      }}
    />
  );
};

export default ExportExcelButton;
