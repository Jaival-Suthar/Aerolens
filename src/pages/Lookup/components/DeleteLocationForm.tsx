import React, { useState, useRef } from 'react';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { LocationEntry } from '../types/locationTypes';
import { locationService } from '../services/locationService';
import { useAuth } from '../../../shared/auth/AuthContext';

interface DeleteLocationFormProps {
  visible: boolean;
  location: LocationEntry | null;
  onHide: () => void;
  onSuccess: () => void;
}

const DeleteLocationForm: React.FC<DeleteLocationFormProps> = ({
  visible,
  location,
  onHide,
  onSuccess,
}) => {
  const toast = useRef<Toast>(null);
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!location) return;
    
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
      const response = await locationService.delete(accessToken, location.locationId);

      if (response.success) {
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: response.message || 'Location deleted successfully',
          life: 3000,
        });
        onSuccess();
        onHide();
      } else {
        // Handle specific error cases
        toast.current?.show({
          severity: 'error',
          summary: 'Delete Failed',
          detail: response.message || 'Failed to delete location',
          life: 3000,
        });
      }
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to delete location',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Build confirmation message with available location details
  const getConfirmationMessage = () => {
  if (!location) return 'Delete this location?';

  const parts: string[] = [];

  if (location.city) parts.push(location.city);
  if (location.state) parts.push(location.state);
  if (location.country) parts.push(location.country);

  const locationText = parts.join(', ');

  return (
  <span>
    Are you sure you want to delete this location:{' '}
    <strong style={{ fontWeight: 700, color: '#000' }}>
      {locationText}
    </strong>
    ?
  </span>
);

};


  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog
        visible={visible}
        onHide={onHide}
        message={getConfirmationMessage()}
        header="Confirm Delete"
        icon="pi pi-exclamation-triangle"
        accept={handleDelete}
        reject={onHide}
        acceptLabel={loading ? "Deleting..." : "Delete"}
        rejectLabel="Cancel"
        acceptClassName="p-button-danger"
        rejectClassName="p-button-secondary"
        blockScroll
        draggable={false}
      />
    </>
  );
};

export default DeleteLocationForm;