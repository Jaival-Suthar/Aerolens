import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { deleteJobProfile } from '../services/jobProfileService';
import type { JobProfile } from '../types/jobProfileTypes';

interface Props {
  visible: boolean;
  onHide: () => void;
  onDelete: () => void;
  jobProfile: JobProfile | null;
  loading?: boolean;
}

const JobProfileDelete: React.FC<Props> = ({
  visible,
  onHide,
  onDelete,
  jobProfile,
  loading = false,
}) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!jobProfile?.jobProfileId) return;

    setDeleting(true);
    setError(null);

    try {
      const response = await deleteJobProfile(jobProfile.jobProfileId);
      
      if (response.success) {
        onDelete();
        onHide();
      } else {
        setError(response.message || 'Failed to delete job profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setDeleting(false);
    }
  };

  const handleHide = () => {
    if (!deleting) {
      setError(null);
      onHide();
    }
  };

  const footer = (
    <div className="flex justify-content-end gap-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        outlined
        onClick={handleHide}
        disabled={deleting || loading}
      />
      <Button
        label="Delete"
        icon="pi pi-trash"
        severity="danger"
        onClick={handleDelete}
        loading={deleting}
        disabled={loading}
      />
    </div>
  );

  if (!jobProfile) return null;

  return (
    <Dialog
      visible={visible}
      header="Delete Job Profile"
      style={{ width: '30rem' }}
      modal
      onHide={handleHide}
      footer={footer}
      closable={!deleting}
      draggable={false}
      resizable={false}
    >
      <div className="flex align-items-center gap-3 mb-4">
        <i className="pi pi-exclamation-triangle text-orange-500" style={{ fontSize: '2rem' }}></i>
        <div>
          <div className="font-bold text-lg">Confirm Deletion</div>
          <div className="text-color-secondary">This action cannot be undone.</div>
        </div>
      </div>

      {error && (
        <Message severity="error" text={error} className="mb-3 w-full" />
      )}

      <div className="bg-surface-50 p-3 border-round mb-4">
        <div className="grid">
          <div className="col-12">
            <strong>Job Profile Details:</strong>
          </div>
          <div className="col-6">
            <span className="text-color-secondary">ID:</span>
          </div>
          <div className="col-6">
            {jobProfile.jobProfileId}
          </div>
          <div className="col-6">
            <span className="text-color-secondary">Client:</span>
          </div>
          <div className="col-6">
            {jobProfile.clientName}
          </div>
          <div className="col-6">
            <span className="text-color-secondary">Department:</span>
          </div>
          <div className="col-6">
            {jobProfile.departmentName}
          </div>
          <div className="col-6">
            <span className="text-color-secondary">Role:</span>
          </div>
          <div className="col-6">
            {jobProfile.jobRole}
          </div>
          <div className="col-6">
            <span className="text-color-secondary">Positions:</span>
          </div>
          <div className="col-6">
            {jobProfile.positions}
          </div>
          <div className="col-6">
            <span className="text-color-secondary">Status:</span>
          </div>
          <div className="col-6">
            <span className={`
              inline-flex align-items-center px-2 py-1 border-round text-sm
              ${jobProfile.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : ''}
              ${jobProfile.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
              ${jobProfile.status === 'Closed' ? 'bg-green-100 text-green-800' : ''}
              ${jobProfile.status === 'Cancelled' ? 'bg-red-100 text-red-800' : ''}
            `}>
              {jobProfile.status}
            </span>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="m-0 text-color-secondary">
          Are you sure you want to delete this job profile?
        </p>
      </div>
    </Dialog>
  );
};

export default JobProfileDelete;