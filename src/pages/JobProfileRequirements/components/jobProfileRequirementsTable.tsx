import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';

import JobProfileRequirementsAddEdit from '../components/jobProfileRequirementsAddEdit';
import JobProfileRequirementsDelete from '../components/jobProfileRequirementsDelete';
import AddButton from '../../../shared/AddButton';
import EditButton from '../../../shared/EditButton';
import DeleteButton from '../../../shared/DeleteButton';
import ExportExcelButton from '../../../shared/ExportExcelButton';
import { Button } from 'primereact/button';
import { useSearchParams } from "react-router-dom";
import {
  getJobProfileRequirements,
  getJobProfileRequirementsById,
  createJobProfileRequirements,
  updateJobProfileRequirements,
  deleteJobProfileRequirements,
  fetchJobProfileRequirementsLookupData
} from '../services/jobProfileRequirementsService';

import type {
  JobProfileRequirements,
  JobProfileRequirementsPayload,
  ClientOption,
  Location
} from '../types/jobProfileRequirementsTypes';

import { useAuth } from '../../../shared/auth/AuthContext'; 
import { FilterMatchMode } from 'primereact/api';
import type { DataTableFilterMeta } from 'primereact/datatable';
import { FaDownload, FaEye } from 'react-icons/fa';
import ColumnSettingsButton from "../../../shared/ColumnSettingsButton";
import ViewButton from "../../../shared/ViewButton";
import PremiumDetailsDialog from "../../../shared/PremiumDetailsDialog";
import DetailsSection from "../../../shared/DetailsSection";
import DetailsGrid from "../../../shared/DetailsGrid";
import type {
  DataTableFilterMetaData,
} from 'primereact/datatable';
import SearchButton from '../../../shared/SearchButton';
const ALL_JOBPROFILE_COLUMNS = [
  { field: "clientName", header: "Client", sortable: true, filter: true },
  { field: "departmentName", header: "Department", sortable: true, filter: true },
  { field: "jobRole", header: "Job Role", sortable: true, filter: true },
  // { field: "techSpecification", header: "Tech Stack", filter: true },
  { field: "positions", header: "Positions", sortable: true, filter: true },
  { field: "workArrangement", header: "Work Arrangement", sortable: true, filter: true },
  { field: "location", header: "Location", sortable: true, filter: true },
  { field: "receivedOnDisplay", header: "Received On", filter: true },
  { field: "estimatedCloseDateDisplay", header: "Close Date", filter: true },
  { field: "status", header: "Status", sortable: true, filter: true },
];

const DEFAULT_JOBPROFILE_COLUMNS = [
  "clientName",
  "departmentName",
  "jobRole",
  "positions",
  "location",
  "status"
];

const JobProfileRequirementsTable: React.FC = () => {
  const toast = useRef<Toast>(null);
  const dt = useRef<DataTable<any>>(null);
  const { accessToken } = useAuth(); // Get access token from auth context
  
  const [jobProfiles, setJobProfiles] = useState<JobProfileRequirements[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedJobProfile, setSelectedJobProfile] = useState<JobProfileRequirements | null>(null);
  const [addEditVisible, setAddEditVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  // ----- Pagination with URL Sync -----
  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = Number(searchParams.get("page")) || 1;
  const [first, setFirst] = useState((pageFromUrl - 1) * 10);
  const [rows, setRows] = useState(10);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [filters, setFilters] = useState<DataTableFilterMeta>({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  clientName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  departmentName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  jobRole: { value: null, matchMode: FilterMatchMode.CONTAINS },
  // jobProfileDescription: { value: null, matchMode: FilterMatchMode.CONTAINS },
  // techSpecification: { value: null, matchMode: FilterMatchMode.CONTAINS },
  positions: { value: null, matchMode: FilterMatchMode.EQUALS },
  workArrangement: { value: null, matchMode: FilterMatchMode.CONTAINS },
  "location.city": { value: null, matchMode: FilterMatchMode.CONTAINS },
  receivedOnDisplay: { value: null, matchMode: FilterMatchMode.CONTAINS },
  estimatedCloseDateDisplay: { value: null, matchMode: FilterMatchMode.CONTAINS },
  status: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const [visibleColumns, setVisibleColumns] = useState(
  ALL_JOBPROFILE_COLUMNS.filter(col =>
    DEFAULT_JOBPROFILE_COLUMNS.includes(col.field)
  )
);
const [statusOptions, setStatusOptions] = useState<string[]>([]);
const [viewJobProfile, setViewJobProfile] = useState<JobProfileRequirements | null>(null);
  useEffect(() => {
    loadData();
  }, []);
  useEffect(() => {
  const loadLookupData = async () => {
    try {
      const { profileStatuses } = await fetchJobProfileRequirementsLookupData(accessToken);
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
    const { JobProfileRequirements: jobProfilesResponse, clients: clientsData, locations: locationsData } = await getJobProfileRequirements(accessToken);
    
    if (!jobProfilesResponse.success) {
      throw new Error(jobProfilesResponse.message || 'Failed to load job profiles');
    }
    
    setJobProfiles(
  jobProfilesResponse.data.map((jp: JobProfileRequirements) => ({
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

  const handleEdit = async (jobProfile: JobProfileRequirements) => {
    setLoading(true);
    try {
      const response = await getJobProfileRequirementsById(
        accessToken,
        jobProfile.jobProfileRequirementId
      );

      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch job profile');
      }
      
      setSelectedJobProfile(response.data);
      setAddEditVisible(true);
    } catch (error: any) {
      console.error('Error fetching job profile:', error);
      showError(
        error?.message ||
        error?.error ||
        'Failed to fetch job profile'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (jobProfile: JobProfileRequirements) => {
    setSelectedJobProfile(jobProfile);
    setDeleteVisible(true);
  };

  const handleSave = async (jobProfileData: JobProfileRequirementsPayload) => {
    try {
      // Simplified: single flow with ternary
      const response = selectedJobProfile?.jobProfileRequirementId
      ? await updateJobProfileRequirements(
          accessToken,
          selectedJobProfile.jobProfileRequirementId,
          jobProfileData
        )
      : await createJobProfileRequirements(accessToken, jobProfileData);


      if (!response.success) {
        throw new Error(response.message || 'Failed to save job profile');
      }

      showSuccess(response.message);
      setAddEditVisible(false);
      setSelectedJobProfile(null);
      loadData();
      return response;
    } catch (error: any) {
      const message =
        error?.message ||
        error?.error ||
        'Something went wrong';
      showError(message);
      throw error;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedJobProfile) return;

    try {
      const response = await deleteJobProfileRequirements(
        accessToken,
        selectedJobProfile.jobProfileRequirementId
      );

      
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete job profile');
      }

      showSuccess(response.message);
      setDeleteVisible(false);
      setSelectedJobProfile(null);
      loadData();
    } catch (error: any) {
      showError(
        error?.message ||
        error?.error ||
        'An unexpected error occurred'
      );
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

  const globalFilter = _filters['global'] as DataTableFilterMetaData;

  globalFilter.value = value;

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

  const statusBodyTemplate = (rowData: JobProfileRequirements) => (
    <Tag 
      value={rowData.status} 
      severity={STATUS_SEVERITY_MAP[rowData.status] || 'info'} 
    />
  );


  const locationBodyTemplate = (rowData: JobProfileRequirements) => {
  if (!rowData.location) return '-';
  return `${rowData.location.city}, ${rowData.location.country}`;
  };

  const capitalizeFirstLetter = (str: string) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const workArrangementBodyTemplate = (rowData: JobProfileRequirements) => {
    return rowData.workArrangement ? capitalizeFirstLetter(rowData.workArrangement) : '-';
  };


  const getNestedValue = (obj: any, path: string) =>
  path.split(".").reduce((acc, key) => acc?.[key], obj);

  const getJobProfileDisplayValue = (
    col: any,
    jp: JobProfileRequirements
  ) => {
    switch (col.field) {
      case "location":
        return jp.location
          ? `${jp.location.city}, ${jp.location.country}`
          : "-";

      case "workArrangement":
        return jp.workArrangement
          ? capitalizeFirstLetter(jp.workArrangement)
          : "-";

      case "status":
        return jp.status || "-";

      default:
        return getNestedValue(jp, col.field) ?? "-";
    }
  };

  const buildJobProfileDetails = (jp: JobProfileRequirements) => {
  return ALL_JOBPROFILE_COLUMNS.map(col => ({
    label: col.header,
    value: getJobProfileDisplayValue(col, jp),
    field: col.field,
  }));
};

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden"}}>
      <Toast ref={toast} />
      
      <div className="flex justify-content-between align-items-center mb-2">
        <h2 style={{ color: "#07253f" }}>Job Profiles Requirements</h2>
        <div className='flex gap-2 align-items-center'>
          <SearchButton
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Search..."
          />
          <ColumnSettingsButton
            value={visibleColumns}
            options={ALL_JOBPROFILE_COLUMNS}
            optionLabel="header"
            onChange={setVisibleColumns}
            onReset={() =>
              setVisibleColumns(
                ALL_JOBPROFILE_COLUMNS.filter(col =>
                  DEFAULT_JOBPROFILE_COLUMNS.includes(col.field)
                )
              )
            }
          />
          <ExportExcelButton dtRef={dt} />
          {/* <AddButton onClick={handleAddNew} /> */}
          <EditButton 
            onClick={() => selectedJobProfile && handleEdit(selectedJobProfile)} 
            disabled={!selectedJobProfile} 
          />
          <DeleteButton 
            onClick={() => selectedJobProfile && handleDelete(selectedJobProfile)} 
            disabled={!selectedJobProfile} 
          />
          <ViewButton
            onClick={() => setViewJobProfile(selectedJobProfile)}
            disabled={!selectedJobProfile}
            tooltip="View Job Profile Details"
          />
        </div>
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
      <DataTable
        ref={dt}
        value={jobProfiles}
        loading={loading}
        selectionMode="single"
        selection={selectedJobProfile}
        scrollable
        scrollHeight="flex"
        onSelectionChange={(e) => setSelectedJobProfile(e.value as JobProfileRequirements | null)}
        filterDisplay="menu"
        onFilter={(e) => setFilters(e.filters)}
        dataKey="jobProfileRequirementId"
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
        {visibleColumns.map((col) => {
          let body;

          if (col.field === "location") body = locationBodyTemplate;
          if (col.field === "workArrangement") body = workArrangementBodyTemplate;
          if (col.field === "status") body = statusBodyTemplate;

          return (
            <Column
              key={col.field}
              field={col.field}
              header={col.header}
              body={body}
              sortable={col.sortable}
              filter={col.filter}
              filterField={col.field === "location" ? "location.city" : col.field}
              showFilterMatchModes={false}
            />
          );
        })}

      </DataTable>
      </div>
      <JobProfileRequirementsAddEdit
        visible={addEditVisible}
        onHide={closeDialog}
        onSave={handleSave}
        jobProfile={selectedJobProfile}
        jobProfileId={selectedJobProfile?.jobProfileId ?? 0}
        clients={clients}
        locations={locations}
        loading={loading}
        statusOptions={statusOptions}
      />

      <JobProfileRequirementsDelete
        visible={deleteVisible}
        onHide={closeDeleteDialog}
        onDelete={handleDeleteConfirm}
        jobProfile={selectedJobProfile}
        clients={clients}
        loading={loading}
      />
      <PremiumDetailsDialog
        visible={!!viewJobProfile}
        title="Job Profile Details"
        onHide={() => setViewJobProfile(null)}
      >
        {viewJobProfile && (
          <>
            {/* 🔹 Core Information */}
            {/* <DetailsSection title="Job Overview">
              <DetailsGrid
                items={buildJobProfileDetails(viewJobProfile).filter(
                  i => !["techSpecification"].includes(i.field)
                )}
              />
            </DetailsSection> */}

            {/* 🔹 Tech Stack
            {viewJobProfile.techSpecification && (
              <DetailsSection title="Tech Stack">
                <div
                  style={{
                    fontSize: "var(--value-size)",
                    lineHeight: 1.6,
                    color: "#111827",
                    whiteSpace: "pre-line",
                  }}
                >
                  {viewJobProfile.techSpecification}
                </div>
              </DetailsSection>
            )} */}

            {/* 🔹 Job Description (500+ chars safe) */}
            {/* {viewJobProfile.jobProfileDescription && (
              <DetailsSection title="Job Description">
                <div
                  style={{
                    fontSize: "var(--value-size)",
                    lineHeight: 1.65,
                    color: "#111827",
                    whiteSpace: "pre-line",
                    maxHeight: "260px",
                    overflowY: "auto",
                    paddingRight: "6px",
                  }}
                >
                  {viewJobProfile.jobProfileDescription}
                </div>
              </DetailsSection>
            )} */}
          </>
        )}
      </PremiumDetailsDialog>
    </div>
  );
};

export default JobProfileRequirementsTable;