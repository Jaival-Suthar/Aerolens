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
import { Button } from 'primereact/button';
import { useSearchParams } from "react-router-dom";
import { 
  getJobProfiles, 
  createJobProfile, 
  updateJobProfile,
  deleteJobProfile,
  getJobProfileById,
  fetchJobProfileLookupData
} from '../services/jobProfileService';
import type { 
  JobProfile, 
  ClientOption, 
  JobProfilePayload,
  Location
} from '../types/jobProfileTypes';
import { useAuth } from '../../../shared/auth/AuthContext'; 
import { FilterMatchMode } from 'primereact/api';
import type { DataTableFilterMeta } from 'primereact/datatable';
import { FaDownload, FaEye } from 'react-icons/fa';


// import SearchButton from '../../../shared/SearchButton';

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
  const [first, setFirst] = useState((pageFromUrl - 1) * 10);
  const [rows, setRows] = useState(10);
  // const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [filters, setFilters] = useState<DataTableFilterMeta>({
  clientName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  departmentName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  jobRole: { value: null, matchMode: FilterMatchMode.CONTAINS },
  jobProfileDescription: { value: null, matchMode: FilterMatchMode.CONTAINS },
  techSpecification: { value: null, matchMode: FilterMatchMode.CONTAINS },
  positions: { value: null, matchMode: FilterMatchMode.EQUALS },
  workArrangement: { value: null, matchMode: FilterMatchMode.CONTAINS },
  "location.city": { value: null, matchMode: FilterMatchMode.CONTAINS },
  receivedOnDisplay: { value: null, matchMode: FilterMatchMode.CONTAINS },
  estimatedCloseDateDisplay: { value: null, matchMode: FilterMatchMode.CONTAINS },
  status: { value: null, matchMode: FilterMatchMode.CONTAINS }
});


const [statusOptions, setStatusOptions] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);
  useEffect(() => {
  const loadLookupData = async () => {
    try {
      const { profileStatuses } = await fetchJobProfileLookupData(accessToken);
      setStatusOptions(profileStatuses);
    } catch (error) {
      console.error('Failed to load status options:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load status options',
        life: 3000
      });
    }
  };
  loadLookupData();
}, [accessToken]);
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
    const { jobProfiles: jobProfilesResponse, clients: clientsData, locations: locationsData } = await getJobProfiles(accessToken);
    
    if (!jobProfilesResponse.success) {
      throw new Error(jobProfilesResponse.message || 'Failed to load job profiles');
    }
    
    setJobProfiles(
  jobProfilesResponse.data.map((jp: JobProfile) => ({
    ...jp,

    locationString: jp.location
      ? `${jp.location.city}, ${jp.location.country}`
      : '',

    receivedOnDisplay: jp.receivedOn
      ? new Date(jp.receivedOn).toLocaleDateString('en-GB')
      : '',

    estimatedCloseDateDisplay: jp.estimatedCloseDate
      ? new Date(jp.estimatedCloseDate).toLocaleDateString('en-GB')
      : ''
  }))
);


    setClients(clientsData);
    setLocations(locationsData); // Set locations
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

//   const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//   const value = e.target.value;
//   const _filters = { ...filters };
//   _filters['global'].value = value;
  
//   setFilters(_filters);
//   setGlobalFilterValue(value);
// };

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


  const locationBodyTemplate = (rowData: JobProfile) => {
  if (!rowData.location) return '-';
  return `${rowData.location.city}, ${rowData.location.country}`;
  };

  const capitalizeFirstLetter = (str: string) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const workArrangementBodyTemplate = (rowData: JobProfile) => {
    return rowData.workArrangement ? capitalizeFirstLetter(rowData.workArrangement) : '-';
  };

  const downloadJD = async (jobProfileId: number) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_URL}/jobProfile/${jobProfileId}/get-JD`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err: any) {
    toast.current?.show({
      severity: 'error',
      summary: 'Error',
      detail: err.message, // ✅ backend message only
    });
  }
};


const previewJD = async (jobProfileId: number) => {
  try {
    if (!accessToken) throw new Error('Authentication token required');

    const previewUrl = `${import.meta.env.VITE_BASE_URL}/jobProfile/${jobProfileId}/get-JD/preview`;
    const response = await fetch(previewUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  

    const contentType = response.headers.get('content-type');

    // ❌ Backend returned JSON error
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'JD preview failed');
    }

    // ❌ Not a PDF (safety check)
    if (!contentType?.includes('application/pdf')) {
      throw new Error('Preview is only supported for PDF files. Please download the file instead.');
    }

    // ✅ PDF preview
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error: any) {
    console.error('JD preview failed:', error);
    toast.current?.show({
      severity: 'error',
      summary: 'Preview Error',
      detail: error.message,
    });
  }
};




const jdBodyTemplate = (rowData: any) => {
  if (!rowData.jdFileName) {
    return <span className="text-muted">—</span>;
  }

  const isPdf = rowData.jdOriginalName?.toLowerCase().endsWith('.pdf');

  return (
    <div className="flex gap-2 align-items-center">
      <Button
        className="p-button-text p-button-sm"
        tooltip="Download JD"
        onClick={() => downloadJD(rowData.jobProfileId)}
      >
        <FaDownload />
      </Button>

      {isPdf && (
        <Button
          type="button"
          className="p-button-text p-button-sm"
          onClick={() => {
            previewJD(rowData.jobProfileId);
          }}
        >
          <FaEye />
        </Button>
      )}
    </div>
  );
};


  return (
    <div className="card">
      <Toast ref={toast} />
      
      <div className="flex justify-content-between align-items-center mb-2">
  <h2>Job Profiles Requirements</h2>
  <div className='flex gap-2 align-items-center'>
    {/* <SearchButton
      value={globalFilterValue}
      onChange={onGlobalFilterChange}
      placeholder="Search..."
    /> */}
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
        filterDisplay="menu"
        onFilter={(e) => setFilters(e.filters)}
        dataKey="jobProfileId"
        responsiveLayout="scroll"
        emptyMessage="No job profiles found"
        paginator
        rows={rows}
        first={first}
        onPage={onPageChange}
        rowsPerPageOptions={[5, 10, 20, 50]}
        // globalFilterFields={['clientName', 'departmentName', 'jobRole', 'jobProfileDescription', 'techSpecification','workArrangement', 'positions','location', 'status']}
        filters={filters}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Job Profiles"
      >
        <Column
          selectionMode="single"
          headerStyle={{ width: '3rem' }}
          frozen
        />
        <Column field="clientName" header="Client" sortable filter/>
        <Column field="departmentName" header="Department" sortable filter/>
        <Column field="jobRole" header="Role" sortable filter/>
        <Column 
          field="jobProfileDescription" 
          header="Description" 
          style={{ maxWidth: '200px' }}
          filter
        />
        <Column 
          field="techSpecification" 
          header="Tech Stack" 
          style={{ maxWidth: '200px' }}
          filter
        />
        <Column 
          field="positions" 
          header="Positions" 
          sortable 
          style={{ width: '8rem' }}
          filter
        />
        <Column 
          field="workArrangement"
          header="Work Arrangement"
          sortable
          body={workArrangementBodyTemplate}
          filter
        />
        <Column
          header="Location"
          body={locationBodyTemplate}
          sortable
          filter
          filterField="location.city"
          showFilterMatchModes={false}
        />
        <Column
          header="Received On"
          body={(row) => row.receivedOnDisplay || '-'}
          filter
          filterField="receivedOnDisplay"
          showFilterMatchModes={false}
        />
        <Column
          header="Close Date"
          sortable
          body={(row) => row.estimatedCloseDateDisplay || '-'}
          filter
          filterField="estimatedCloseDateDisplay"
          showFilterMatchModes={false}
          showApplyButton={false}
          showClearButton={true}
        />
        <Column 
          field="status" 
          header="Status" 
          body={statusBodyTemplate}
          sortable 
          filter
        />
        <Column
          header="JD"
          body={jdBodyTemplate}
          style={{ width: '8rem', textAlign: 'center' }}
        />

      </DataTable>

      <JobProfileAddEdit
        visible={addEditVisible}
        onHide={closeDialog}
        onSave={handleSave}
        jobProfile={selectedJobProfile}
        clients={clients}
        locations={locations}
        loading={loading}
        statusOptions={statusOptions}
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