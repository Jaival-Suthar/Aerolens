import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import type { JobProfile, ClientOption } from '../types/jobProfileTypes';
import DialogDeleteButton from '../../../shared/DialogDeleteButton';
interface Props {
  visible: boolean;
  onHide: () => void;
  onDelete: () => void;
  jobProfile: JobProfile | null;
  clients: ClientOption[];
  loading?: boolean;
}

const JobProfileDelete: React.FC<Props> = ({
  visible,
  onHide,
  onDelete,
  jobProfile,
  clients,
  loading = false,
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    onDelete();
  };

  const handleHide = () => {
    setError(null);
    onHide();
  };

  const footer = (
    <div className="flex justify-content-end gap-2">
      <DialogDeleteButton
        onCancel={handleHide}
        onDelete={handleDelete}
        cancelDisabled={loading}
        deleteDisabled={loading}
      />
    </div>
  );

  if (!jobProfile) return null;

  // Look up clientName and departmentName from clients array
  const client = clients.find(c => c.clientId === jobProfile.clientId);
  const clientName = client?.clientName || jobProfile.clientName || '-';
  const departmentName = client?.departments.find(d => d.departmentId === jobProfile.departmentId)?.departmentName || jobProfile.departmentName || '-';

  return (
    <Dialog
      visible={visible}
      header="Delete Job Profile"
      style={{ width: '30rem' }}
      modal
      onHide={handleHide}
      footer={footer}
      draggable={false}
      resizable={false}
    >

      {error && (
        <Message severity="error" text={error} className="mb-3 w-full" />
      )}

      <div className="bg-surface-50 p-3 border-round mb-4">
        <div className="grid">
          <div className="col-12">
            <strong>Job Profile Details:</strong>
          </div>
          <div className="col-6">
            <span className="text-color-secondary">Job Profile ID:</span>
          </div>
          <div className="col-6">
            {jobProfile.jobProfileId}
          </div>
          <div className="col-6">
            <span className="text-color-secondary">Client:</span>
          </div>
          <div className="col-6">
            {clientName}
          </div>
          <div className="col-6">
            <span className="text-color-secondary">Department:</span>
          </div>
          <div className="col-6">
            {departmentName}
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
            <span className="text-color-secondary">Location:</span>
          </div>
          <div className="col-6">
            {jobProfile.location ? `${jobProfile.location.city}, ${jobProfile.location.country}` : '-'}
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