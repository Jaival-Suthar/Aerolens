import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';

import JobProfileAddEdit from '../components/jobProfileAddEdit';
import JobProfileDelete from '../components/jobProfileDelete';
import AddButton from '../../../shared/AddButton';
import EditButton from '../../../shared/EditButton';
import DeleteButton from '../../../shared/DeleteButton';
import { 
  getJobProfiles, 
  createJobProfile, 
  updateJobProfile,
  deleteJobProfile,
  getJobProfileById
} from '../services/jobProfileService';
import type { 
  JobProfile, 
  ClientOption, 
  JobProfilePayload,
  ApiResponse
} from '../types/jobProfileTypes';

const JobProfileMain: React.FC = () => {
  const toast = useRef<Toast>(null);
  const [jobProfiles, setJobProfiles] = useState<JobProfile[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedJobProfile, setSelectedJobProfile] = useState<JobProfile | null>(null);
  const [addEditVisible, setAddEditVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Get both job profiles and clients in one call
      const { jobProfiles: jobProfilesResponse, clients: clientsData } = await getJobProfiles();
      
      if (jobProfilesResponse.success) {
        setJobProfiles(jobProfilesResponse.data);
        setClients(clientsData);
      } else {
        throw new Error(jobProfilesResponse.message || 'Failed to load job profiles');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load data'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setSelectedJobProfile(null);
    setAddEditVisible(true);
  };

  const handleEdit = async (jobProfile: JobProfile) => {
  try {
    setLoading(true);
    // Fetch fresh data from API
    const response = await getJobProfileById(jobProfile.jobProfileId);
    if (response.success) {
      setSelectedJobProfile(response.data);
      setAddEditVisible(true);
    } else {
      throw new Error(response.message || 'Failed to fetch job profile');
    }
  } catch (error) {
    console.error('Error fetching job profile:', error);
    toast.current?.show({
      severity: 'error',
      summary: 'Error',
      detail: error instanceof Error ? error.message : 'Failed to fetch job profile'
    });
  } finally {
    setLoading(false);
  }
};

  const handleDelete = (jobProfile: JobProfile) => {
    setSelectedJobProfile(jobProfile);
    setDeleteVisible(true);
  };

  const handleSave = async (jobProfileData: JobProfilePayload) => {
    try {
      let response: ApiResponse<JobProfile>;
      
      if (selectedJobProfile?.jobProfileId) {
        // Update existing
        response = await updateJobProfile(selectedJobProfile.jobProfileId, jobProfileData);
      } else {
        // Create new
        response = await createJobProfile(jobProfileData);
      }

      if (response.success) {
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: response.message
        });
        setAddEditVisible(false);
        setSelectedJobProfile(null);
        loadData(); // Reload both job profiles and clients
      } else {
        throw new Error(response.message || 'Failed to save job profile');
      }
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedJobProfile) return;

    try {
      const response: ApiResponse<null> = await deleteJobProfile(selectedJobProfile.jobProfileId);
      if (response.success) {
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: response.message
        });
        setDeleteVisible(false);
        setSelectedJobProfile(null);
        loadData(); // Reload data
      } else {
        throw new Error(response.message || 'Failed to delete job profile');
      }
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    }
  };

  // Table column renderers
  const statusBodyTemplate = (rowData: JobProfile) => {
    const getSeverity = (status: string) => {
      switch (status) {
        case 'In Progress': return 'info';
        case 'Pending': return 'warning';
        case 'Closed': return 'success';
        case 'Cancelled': return 'danger';
        default: return 'info';
      }
    };

    return <Tag value={rowData.status} severity={getSeverity(rowData.status)} />;
  };

  const dateBodyTemplate = (rowData: JobProfile, field: keyof JobProfile) => {
    const date = rowData[field] as string;
    return date ? new Date(date).toLocaleDateString() : '-';
  };

  return (
    <div className="card">
      <Toast ref={toast} />
      
      <div className="flex justify-content-between align-items-center mb-4">
        <h2>Job Profiles Management</h2>
        <div className='flex gap-2'>
          <AddButton onClick={handleAddNew} />
          <EditButton onClick={() => handleEdit(selectedJobProfile!)} disabled={!selectedJobProfile} />
          <DeleteButton onClick={() => handleDelete(selectedJobProfile!)} disabled={!selectedJobProfile} />
        </div>
      </div>

      <DataTable
        value={jobProfiles}
        loading={loading}
        selectionMode="single"
        selection={selectedJobProfile}
        onSelectionChange={(e) => setSelectedJobProfile(e.value as JobProfile | null)}
        dataKey="jobProfileId"
        responsiveLayout="scroll"
        emptyMessage="No job profiles found"
      >
        <Column
          selectionMode="single"
          headerStyle={{ width: '3rem' }}
          frozen
        />
        <Column 
          field="clientName" 
          header="Client" 
          sortable 
          body={(rowData) => rowData.clientName || '-'}
        />
        <Column 
          field="departmentName" 
          header="Department" 
          sortable 
          body={(rowData) => rowData.departmentName || '-'}
        />
        <Column 
          field="jobRole" 
          header="Role" 
          sortable 
        />
        <Column 
          field="jobProfileDescription" 
          header="Description" 
          style={{ maxWidth: '200px' }}
          body={(rowData) => (
            <div className="text-overflow-ellipsis overflow-hidden" title={rowData.jobProfileDescription}>
              {rowData.jobProfileDescription}
            </div>
          )}
        />
        <Column 
          field="techSpecification" 
          header="Tech Stack" 
          style={{ maxWidth: '200px' }}
          body={(rowData) => (
            <div className="text-overflow-ellipsis overflow-hidden" title={rowData.techSpecification}>
              {rowData.techSpecification}
            </div>
          )}
        />
        <Column 
          field="positions" 
          header="Positions" 
          sortable 
          style={{ width: '8rem' }}
        />
        <Column 
          field="location" 
          header="Location" 
          sortable 
        />
        <Column 
          field="receivedOn" 
          header="Received On" 
          sortable 
          body={(rowData) => dateBodyTemplate(rowData, 'receivedOn')}
        />
        <Column 
          field="estimatedCloseDate" 
          header="Close Date" 
          sortable 
          body={(rowData) => dateBodyTemplate(rowData, 'estimatedCloseDate')}
        />
        <Column 
          field="status" 
          header="Status" 
          body={statusBodyTemplate}
          sortable 
        />
      </DataTable>

      {/* Add/Edit Dialog */}
      <JobProfileAddEdit
        visible={addEditVisible}
        onHide={() => {
          setAddEditVisible(false);
          setSelectedJobProfile(null);
        }}
        onSave={handleSave}
        jobProfile={selectedJobProfile}
        clients={clients}
        loading={loading}
      />

      {/* Delete Confirmation Dialog */}
      <JobProfileDelete
        visible={deleteVisible}
        onHide={() => {
          setDeleteVisible(false);
          setSelectedJobProfile(null);
        }}
        onDelete={handleDeleteConfirm}
        jobProfile={selectedJobProfile}
        clients={clients}
        loading={loading}
      />
    </div>
  );
};

export default JobProfileMain;