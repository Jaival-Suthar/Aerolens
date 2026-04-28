import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';

import JobProfileRequirementsAddEdit from '../components/jobProfileRequirementsAddEdit';
import JobProfileRequirementsDelete from '../components/jobProfileRequirementsDelete';
// import AddButton from '../../../shared/AddButton';
import EditButton from '../../../shared/EditButton';
import DeleteButton from '../../../shared/DeleteButton';
// import ExportExcelButton from '../../../shared/ExportExcelButton';
import { Button } from 'primereact/button';
import { useSearchParams } from "react-router-dom";
import { Dropdown } from 'primereact/dropdown';
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
import CogButton from '../../../shared/CogButton';
import ChangeLogsDialog from '../../../shared/ChangeLogsDialog';
import JobProfileRequirementsDeletedRecordsDialog from './jobProfileRequirementsDeletedRecordsDialog';
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
/* -------------------- Column Persistence -------------------- */
const STORAGE_KEY = "job-profile-requirements:visible-columns";

const loadVisibleColumns = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const fields: string[] = JSON.parse(raw);

    return ALL_JOBPROFILE_COLUMNS.filter(col =>
      fields.includes(col.field)
    );
  } catch {
    return null;
  }
};

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
  const [rows, setRows] = useState(20);
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

const [visibleColumns, setVisibleColumns] = useState(() =>
  loadVisibleColumns() ??
  ALL_JOBPROFILE_COLUMNS.filter(col =>
    DEFAULT_JOBPROFILE_COLUMNS.includes(col.field)
  )
);

const [statusOptions, setStatusOptions] = useState<string[]>([]);
const [viewJobProfile, setViewJobProfile] = useState<JobProfileRequirements | null>(null);
const [showDeletedRecordsDialog, setShowDeletedRecordsDialog] = useState(false);
const [showCogMenu, setShowCogMenu] = useState(false);
const [showChangeLogsDialog, setShowChangeLogsDialog] = useState(false);
const cogMenuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!showCogMenu) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (cogMenuRef.current && !cogMenuRef.current.contains(event.target as Node)) {
        setShowCogMenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showCogMenu]);

  useEffect(() => {
    loadData();
  }, []);
  useEffect(() => {
  const fields = visibleColumns.map(c => c.field);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(fields)
  );
}, [visibleColumns]);

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
      severity: "error",
      summary: "Error",
      detail: message,
      life: 3000,
    });
  };

  const showSuccess = (message: string) => {
    toast.current?.show({
      severity: "success",
      summary: "Success",
      detail: message ?? "",
      life: 3000,
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
        // Check if there are validation errors to pass back to the form
        if (response.details?.validationErrors && Array.isArray(response.details.validationErrors)) {
          // Create an error object with validation details
          const validationError: any = new Error(response.message || 'Validation failed');
          validationError.validationErrors = response.details.validationErrors;
          throw validationError;
        }
        
        // For non-validation errors, show toast and throw
        const errorMessage = response.message || 'Failed to save job profile';
        throw new Error(errorMessage);
      }

      showSuccess(response.message);
      setAddEditVisible(false);
      setSelectedJobProfile(null);
      loadData();
      return response;
    } catch (error: any) {
      // If it has validation errors, re-throw to let dialog handle it
      if (error.validationErrors) {
        throw error;
      }
      
      // Otherwise show toast for general errors
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

  const uniqueValues = <T,>(arr: (T | null |undefined)[]) =>
  Array.from(new Set(arr.filter(Boolean)));

  const toOptions = (values: (string | null | undefined)[]) =>
    uniqueValues(values).map(v => ({
      label: String(v),
      value: v
    }));

    const clientFilterTemplate = (options: any) => (
      <Dropdown
        value={options.value}
        options={toOptions(jobProfiles.map(j => j.clientName))}
        onChange={(e) => options.filterCallback(e.value)}
        placeholder="Select Client"
        showClear
        style={{ minWidth: "12rem" }}
      />
    );

    const departmentFilterTemplate = (options: any) => (
      <Dropdown
        value={options.value}
        options={toOptions(jobProfiles.map(j => j.departmentName))}
        onChange={(e) => options.filterCallback(e.value)}
        placeholder="Select Department"
        showClear
        style={{ minWidth: "12rem" }}
      />
    );

    const jobRoleFilterTemplate = (options: any) => (
      <Dropdown
        value={options.value}
        options={toOptions(jobProfiles.map(j => j.jobRole))}
        onChange={(e) => options.filterCallback(e.value)}
        placeholder="Select Job Role"
        showClear
        style={{ minWidth: "12rem" }}
      />
    );

    const statusFilterTemplate = (options: any) => (
      <Dropdown
        value={options.value}
        options={toOptions(jobProfiles.map(j => j.status))}
        onChange={(e) => options.filterCallback(e.value)}
        placeholder="Select Status"
        showClear
        style={{ minWidth: "12rem" }}
      />
    );

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden"}}>
      <Toast ref={toast} position="top-right" />
      
      <div className="flex justify-content-between align-items-center mb-2">
        <h2 style={{ color: "#07253f" }}>Job Profile Requirements</h2>
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
          {/* <ExportExcelButton dtRef={dt} /> */}
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
          <div ref={cogMenuRef} style={{ position: "relative" }}>
            <CogButton
              onClick={() => setShowCogMenu((prev) => !prev)}
              tooltip="Requirement Activity"
            />
            {showCogMenu && (
              <div
                className="card shadow-3"
                style={{
                  position: "absolute",
                  right: 0,
                  top: 50,
                  zIndex: 1000,
                  minWidth: 220,
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "0.5rem",
                }}
              >
                <div
                  className="p-2 border-round"
                  role="button"
                  tabIndex={selectedJobProfile ? 0 : -1}
                  aria-disabled={!selectedJobProfile}
                  onClick={() => { if (!selectedJobProfile) return; setShowCogMenu(false); setShowChangeLogsDialog(true); }}
                  onKeyDown={(e) => { if (!selectedJobProfile) return; if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setShowCogMenu(false); setShowChangeLogsDialog(true); } }}
                  style={{ display: "flex", alignItems: "center", cursor: selectedJobProfile ? "pointer" : "not-allowed", opacity: selectedJobProfile ? 1 : 0.4 }}
                  onMouseEnter={(e) => { if (selectedJobProfile) e.currentTarget.style.backgroundColor = "#f3f4f6"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <i className="pi pi-history" style={{ fontSize: "14px", color: "#374151" }} />
                  <span style={{ marginLeft: "12px", fontSize: "14px", fontWeight: 500, color: "#374151" }}>
                    Change Logs
                  </span>
                </div>
                <div
                  className="p-2 border-round"
                  role="button"
                  tabIndex={0}
                  onClick={() => { setShowCogMenu(false); setShowDeletedRecordsDialog(true); }}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setShowCogMenu(false); setShowDeletedRecordsDialog(true); } }}
                  style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f3f4f6"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <i className="pi pi-trash" style={{ fontSize: "14px", color: "#374151" }} />
                  <span style={{ marginLeft: "12px", fontSize: "14px", fontWeight: 500, color: "#374151" }}>
                    Deleted Requirements
                  </span>
                </div>
              </div>
            )}
          </div>
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
        rowsPerPageOptions={[20, 50,100]}
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

          let filterElement;

          if (col.field === "clientName")
            filterElement = clientFilterTemplate;

          if (col.field === "departmentName")
            filterElement = departmentFilterTemplate;

          if (col.field === "jobRole")
            filterElement = jobRoleFilterTemplate;

          if (col.field === "status")
            filterElement = statusFilterTemplate;

          return (
            <Column
              key={col.field}
              field={col.field}
              header={col.header}
              body={body}
              sortable={col.sortable}
              filter={col.filter}
              filterElement={filterElement}
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
            {/* 🔹 Job Profile Overview */}
            <DetailsSection title="Job Profile Overview">
              <DetailsGrid
                items={buildJobProfileDetails(viewJobProfile)}
              />
            </DetailsSection>
          </>
        )}
      </PremiumDetailsDialog>
      <JobProfileRequirementsDeletedRecordsDialog
        isOpen={showDeletedRecordsDialog}
        onClose={() => setShowDeletedRecordsDialog(false)}
        onRestoreSuccess={loadData}
      />
      <ChangeLogsDialog
        isOpen={showChangeLogsDialog}
        onClose={() => setShowChangeLogsDialog(false)}
        title="Job Profile Requirements Change Logs"
      />

    </div>
  );
};

export default JobProfileRequirementsTable;
