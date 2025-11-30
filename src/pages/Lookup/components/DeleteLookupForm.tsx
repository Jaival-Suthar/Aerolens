import React, { useState, useRef } from 'react';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { LookupEntry } from '../types/lookupTypes';
import { lookupService } from '../services/lookupService';
import { useAuth } from '../../../shared/auth/AuthContext'; 

interface DeleteLookupFormProps {
  visible: boolean;
  lookup: LookupEntry | null;
  onHide: () => void;
  onSuccess: () => void;
}

export const DeleteLookupForm: React.FC<DeleteLookupFormProps> = ({
  visible,
  lookup,
  onHide,
  onSuccess,
}) => {
  const toast = useRef<Toast>(null);
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!lookup) return;
    if (!accessToken) {
    toast.current?.show({
      severity: "warn",
      summary: "Authentication Required",
      detail: "Cannot delete. Please log in again.",
      life: 3000,
    });
    return;
  }
    setLoading(true);
    try {
      const response = await lookupService.delete(accessToken, lookup.lookupKey);

      if (response.success) {
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: response.message || 'Deleted successfully',
          life: 3000,
        });
        onSuccess();
        onHide();
      }
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to delete',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog
        visible={visible}
        onHide={onHide}
        message={`Delete lookup entry "${lookup?.tag}: ${lookup?.value}"?`}
        header="Confirm Delete"
        icon="pi pi-exclamation-triangle"
        accept={handleDelete}
        reject={onHide}
        acceptLabel="Delete"
        rejectLabel="Cancel"
        acceptClassName="p-button-danger"
        blockScroll
      />
    </>
  );
};