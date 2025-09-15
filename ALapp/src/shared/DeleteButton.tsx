import React from 'react';
import { Button } from 'primereact/button';

type DeleteButtonProps = {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  tooltip?: string;
};

const DeleteButton: React.FC<DeleteButtonProps> = ({ onClick, disabled, tooltip }) => (
  <Button
    icon="pi pi-trash"
    rounded
    text={false}
    severity="danger"
    size="large"
    className="font-medium"
    onClick={onClick}
    disabled={disabled}
    aria-label="Delete"
    tooltip={tooltip || "Delete"}
    tooltipOptions={{ position: 'bottom' }}
    style={{
      backgroundColor: '#f8d7da',
      borderColor: '#f5c6cb',
      color: '#721c24',
      borderWidth: '1.5px',
      borderStyle: 'solid'
    }}
  />
);

export default DeleteButton;
