import React from 'react';
import { Button } from 'primereact/button';

type AddButtonProps = {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  tooltip?: string;
};

const AddButton: React.FC<AddButtonProps> = ({ onClick, disabled, tooltip }) => (
  <Button
    icon="pi pi-plus"
    rounded
    text={false}
    severity="success"
    size="large"
    className="font-medium mr-1"
    onClick={onClick}
    disabled={disabled}
    aria-label="Add"
    tooltip={tooltip || "Add"}
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

export default AddButton;
