import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';

import JobProfileAddEdit from '../components/jobProfileAddEdit';
import JobProfileDelete from '../components/jobProfileDelete';
import AddButton from '../../../shared/AddButton';
import EditButton from '../../../shared/EditButton';
import DeleteButton from '../../../shared/DeleteButton';
import ExportExcelButton from '../../../shared/ExportExcelButton';
import { useSearchParams } from "react-router-dom";
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
  JobProfilePayload
} from '../types/jobProfileTypes';
import { useAuth } from '../../../shared/auth/AuthContext'; 
import { FilterMatchMode } from 'primereact/api';
import SearchButton from '../../../shared/SearchButton';

const JobProfileMain: React.FC = () => {
  const toast = useRef<Toast>(null);
  const dt = useRef<DataTable<any>>(null);
  const { accessToken } = useAuth(); // Get access token from auth context
  
  const [jobProfiles, setJobProfiles] = useState<JobProfile[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedJobProfile, setSelectedJobProfile] = useState<JobProfile | null>(null);
  const [addEditVisible, setAddEditVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  // ----- Pagination with URL Sync -----
  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = Number(searchParams.get("page")) || 1;
  const [first, setFirst] = useState((pageFromUrl - 1) * 5); // 5 = default rows
  const [rows, setRows] = useState(5);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters, setFilters] = useState<any>({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

  useEffect(() => {
    loadData();
  }, []);

  // Centralized error handler - reduces duplication
  const showError = (message: string) => {
    toast.current?.show({
      severity: 'error',
      summary: 'Error',
      detail: message
    });
  };

  const showSuccess = (message: string) => {
    toast.current?.show({
      severity: 'success',
      summary: 'Success',
      detail: message
    });
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const { jobProfiles: jobProfilesResponse, clients: clientsData } = await getJobProfiles(accessToken);
      
      if (!jobProfilesResponse.success) {
        throw new Error(jobProfilesResponse.message || 'Failed to load job profiles');
      }
      
      setJobProfiles(jobProfilesResponse.data);
      setClients(clientsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      showError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const onPageChange = (event: any) => {
  setFirst(event.first);
  setRows(event.rows);
  const newPage = event.page + 1; // PrimeReact page index starts from 0
  setSearchParams({ page: newPage.toString() });
};

  const handleAddNew = () => {
    setSelectedJobProfile(null);
    setAddEditVisible(true);
  };

  const handleEdit = async (jobProfile: JobProfile) => {
    setLoading(true);
    try {
      const response = await getJobProfileById(accessToken, jobProfile.jobProfileId);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch job profile');
      }
      
      setSelectedJobProfile(response.data);
      setAddEditVisible(true);
    } catch (error) {
      console.error('Error fetching job profile:', error);
      showError(error instanceof Error ? error.message : 'Failed to fetch job profile');
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
      // Simplified: single flow with ternary
      const response = selectedJobProfile?.jobProfileId
        ? await updateJobProfile(accessToken, selectedJobProfile.jobProfileId, jobProfileData)
        : await createJobProfile(accessToken, jobProfileData);

      if (!response.success) {
        throw new Error(response.message || 'Failed to save job profile');
      }

      showSuccess(response.message);
      setAddEditVisible(false);
      setSelectedJobProfile(null);
      loadData();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedJobProfile) return;

    try {
      const response = await deleteJobProfile(accessToken, selectedJobProfile.jobProfileId);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete job profile');
      }

      showSuccess(response.message);
      setDeleteVisible(false);
      setSelectedJobProfile(null);
      loadData();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  const closeDialog = () => {
    setAddEditVisible(false);
    setSelectedJobProfile(null);
  };

  const closeDeleteDialog = () => {
    setDeleteVisible(false);
    setSelectedJobProfile(null);
  };

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  const _filters = { ...filters };
  _filters['global'].value = value;
  
  setFilters(_filters);
  setGlobalFilterValue(value);
};

 

  // Simplified status mapping
  const STATUS_SEVERITY_MAP: Record<string, 'info' | 'warning' | 'success' | 'danger'> = {
    'In Progress': 'info',
    'Pending': 'warning',
    'Closed': 'success',
    'Cancelled': 'danger'
  };

  const statusBodyTemplate = (rowData: JobProfile) => (
    <Tag 
      value={rowData.status} 
      severity={STATUS_SEVERITY_MAP[rowData.status] || 'info'} 
    />
  );

  const dateBodyTemplate = (rowData: JobProfile, field: keyof JobProfile) => {
    const date = rowData[field] as string;
    return date ? new Date(date).toLocaleDateString() : '-';
  };

  return (
    <div className="card">
      <Toast ref={toast} />
      
      <div className="flex justify-content-between align-items-center mb-2">
  <h2>Job Profiles Requirements</h2>
  <div className='flex gap-2 align-items-center'>
    <SearchButton
      value={globalFilterValue}
      onChange={onGlobalFilterChange}
      placeholder="Search..."
    />
    <ExportExcelButton dtRef={dt} />
    <AddButton onClick={handleAddNew} />
    <EditButton 
      onClick={() => selectedJobProfile && handleEdit(selectedJobProfile)} 
      disabled={!selectedJobProfile} 
    />
    <DeleteButton 
      onClick={() => selectedJobProfile && handleDelete(selectedJobProfile)} 
      disabled={!selectedJobProfile} 
    />
  </div>
</div>

      <DataTable
        ref={dt}
        value={jobProfiles}
        loading={loading}
        selectionMode="single"
        selection={selectedJobProfile}
        onSelectionChange={(e) => setSelectedJobProfile(e.value as JobProfile | null)}
        dataKey="jobProfileId"
        responsiveLayout="scroll"
        emptyMessage="No job profiles found"
        paginator
        rows={rows}
        first={first}
        onPage={onPageChange}
        rowsPerPageOptions={[5, 10, 20, 50]}
        globalFilterFields={['clientName', 'departmentName', 'jobRole', 'jobProfileDescription', 'techSpecification', 'positions','location', 'status']}
        filters={filters}
      >

        <Column
          selectionMode="single"
          headerStyle={{ width: '3rem' }}
          frozen
        />
        <Column field="clientName" header="Client" sortable />
        <Column field="departmentName" header="Department" sortable />
        <Column field="jobRole" header="Role" sortable />
        <Column 
          field="jobProfileDescription" 
          header="Description" 
          style={{ maxWidth: '200px' }}
        />
        <Column 
          field="techSpecification" 
          header="Tech Stack" 
          style={{ maxWidth: '200px' }}
        />
        <Column 
          field="positions" 
          header="Positions" 
          sortable 
          style={{ width: '8rem' }}
        />
        <Column field="location" header="Location" sortable />
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

      <JobProfileAddEdit
        visible={addEditVisible}
        onHide={closeDialog}
        onSave={handleSave}
        jobProfile={selectedJobProfile}
        clients={clients}
        loading={loading}
      />

      <JobProfileDelete
        visible={deleteVisible}
        onHide={closeDeleteDialog}
        onDelete={handleDeleteConfirm}
        jobProfile={selectedJobProfile}
        clients={clients}
        loading={loading}
      />
    </div>
  );
};

export default JobProfileMain;