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
  getClients, 
  createJobProfile, 
  updateJobProfile 
} from '../services/jobProfileService';
import type { 
  JobProfile, 
  ClientOption, 
  JobProfileRequest 
} from '../types/jobProfileTypes';

const JobProfileMain: React.FC = () => {
  const toast = useRef<Toast>(null);
  const [jobProfiles, setJobProfiles] = useState<JobProfile[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog states
  const [addEditVisible, setAddEditVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [selectedJobProfile, setSelectedJobProfile] = useState<JobProfile | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadJobProfiles();
    loadClients();
  }, []);

  const loadJobProfiles = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const response = await getJobProfiles(page, limit);
      if (response.success) {
        setJobProfiles(response.data);
        setTotalRecords(response.totalRecords);
        setCurrentPage(response.currentPage);
      }
    } catch (error) {
      console.error('Error fetching job profiles:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load job profiles'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const clientsData = await getClients();
      setClients(clientsData);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load clients'
      });
    }
  };

  const handleAddNew = () => {
    setSelectedJobProfile(null);
    setAddEditVisible(true);
  };

  const handleEdit = (jobProfile: JobProfile) => {
    setSelectedJobProfile(jobProfile);
    setAddEditVisible(true);
  };

  const handleDelete = (jobProfile: JobProfile) => {
    setSelectedJobProfile(jobProfile);
    setDeleteVisible(true);
  };

  const handleSave = async (jobProfileData: JobProfileRequest) => {
    try {
      let response;
      
      if (jobProfileData.jobProfileId) {
        // Update existing
        response = await updateJobProfile(jobProfileData.jobProfileId, jobProfileData);
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
        loadJobProfiles(currentPage);
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: response.message || 'Failed to save job profile'
        });
      }
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    }
  };

  const handleDeleteConfirm = () => {
    toast.current?.show({
      severity: 'success',
      summary: 'Success',
      detail: 'Job profile deleted successfully'
    });
    loadJobProfiles(currentPage);
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
        paginator
        rows={10}
        totalRecords={totalRecords}
        lazy
        onPage={(e) => { 
          setSelectedJobProfile(null); // clear selection on page change
          loadJobProfiles(e.page! + 1, e.rows);
        }}
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
        />
        <Column 
          field="departmentName" 
          header="Department" 
          sortable 
        />
        <Column 
          field="jobRole" 
          header="Role" 
          sortable 
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
        onHide={() => setAddEditVisible(false)}
        onSave={handleSave}
        jobProfile={selectedJobProfile}
        clients={clients}
        loading={loading}
      />

      {/* Delete Confirmation Dialog */}
      <JobProfileDelete
        visible={deleteVisible}
        onHide={() => setDeleteVisible(false)}
        onDelete={handleDeleteConfirm}
        jobProfile={selectedJobProfile}
        loading={loading}
      />
    </div>
  );
};

export default JobProfileMain;