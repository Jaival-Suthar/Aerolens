import React from 'react';
import { Button } from 'primereact/button';

const EditButton = ({ onClick, disabled, tooltip }) => (
  <Button
    icon="pi pi-pencil"
    rounded
    text={false}
    severity="info"
    size="large"
    className="font-medium mr-1"
    onClick={onClick}
    disabled={disabled}
    aria-label="Edit"
    tooltip={tooltip || "Edit"}
    tooltipOptions={{ position: 'bottom' }}
    style={{
      backgroundColor: '#d1ecf1',
      borderColor: '#bee5eb',
      color: '#0c5460',
      borderWidth: '1.5px',
      borderStyle: 'solid'
    }}
  />
);

export default EditButton;
