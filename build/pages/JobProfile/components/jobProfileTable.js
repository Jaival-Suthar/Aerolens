import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
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
import { getJobProfiles, createJobProfile, updateJobProfile, deleteJobProfile, getJobProfileById } from '../services/jobProfileService';
import { useAuth } from '../../../shared/auth/AuthContext'; // Import auth context
const JobProfileMain = () => {
    const toast = useRef(null);
    const dt = useRef(null);
    const { accessToken } = useAuth(); // Get access token from auth context
    const [jobProfiles, setJobProfiles] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedJobProfile, setSelectedJobProfile] = useState(null);
    const [addEditVisible, setAddEditVisible] = useState(false);
    const [deleteVisible, setDeleteVisible] = useState(false);
    // ----- Pagination with URL Sync -----
    const [searchParams, setSearchParams] = useSearchParams();
    const pageFromUrl = Number(searchParams.get("page")) || 1;
    const [first, setFirst] = useState((pageFromUrl - 1) * 5); // 5 = default rows
    const [rows, setRows] = useState(5);
    useEffect(() => {
        loadData();
    }, []);
    // Centralized error handler - reduces duplication
    const showError = (message) => {
        toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: message
        });
    };
    const showSuccess = (message) => {
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
        }
        catch (error) {
            console.error('Error fetching data:', error);
            showError('Failed to load data');
        }
        finally {
            setLoading(false);
        }
    };
    const onPageChange = (event) => {
        setFirst(event.first);
        setRows(event.rows);
        const newPage = event.page + 1; // PrimeReact page index starts from 0
        setSearchParams({ page: newPage.toString() });
    };
    const handleAddNew = () => {
        setSelectedJobProfile(null);
        setAddEditVisible(true);
    };
    const handleEdit = async (jobProfile) => {
        setLoading(true);
        try {
            const response = await getJobProfileById(accessToken, jobProfile.jobProfileId);
            if (!response.success) {
                throw new Error(response.message || 'Failed to fetch job profile');
            }
            setSelectedJobProfile(response.data);
            setAddEditVisible(true);
        }
        catch (error) {
            console.error('Error fetching job profile:', error);
            showError(error instanceof Error ? error.message : 'Failed to fetch job profile');
        }
        finally {
            setLoading(false);
        }
    };
    const handleDelete = (jobProfile) => {
        setSelectedJobProfile(jobProfile);
        setDeleteVisible(true);
    };
    const handleSave = async (jobProfileData) => {
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
        }
        catch (error) {
            showError(error instanceof Error ? error.message : 'An unexpected error occurred');
        }
    };
    const handleDeleteConfirm = async () => {
        if (!selectedJobProfile)
            return;
        try {
            const response = await deleteJobProfile(accessToken, selectedJobProfile.jobProfileId);
            if (!response.success) {
                throw new Error(response.message || 'Failed to delete job profile');
            }
            showSuccess(response.message);
            setDeleteVisible(false);
            setSelectedJobProfile(null);
            loadData();
        }
        catch (error) {
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
    // Simplified status mapping
    const STATUS_SEVERITY_MAP = {
        'In Progress': 'info',
        'Pending': 'warning',
        'Closed': 'success',
        'Cancelled': 'danger'
    };
    const statusBodyTemplate = (rowData) => (_jsx(Tag, { value: rowData.status, severity: STATUS_SEVERITY_MAP[rowData.status] || 'info' }));
    const dateBodyTemplate = (rowData, field) => {
        const date = rowData[field];
        return date ? new Date(date).toLocaleDateString() : '-';
    };
    return (_jsxs("div", { className: "card", children: [_jsx(Toast, { ref: toast }), _jsxs("div", { className: "flex justify-content-between align-items-center mb-2", children: [_jsx("h2", { children: "Job Profiles Requirements" }), _jsxs("div", { className: 'flex gap-2', children: [_jsx(ExportExcelButton, { dtRef: dt }), _jsx(AddButton, { onClick: handleAddNew }), _jsx(EditButton, { onClick: () => selectedJobProfile && handleEdit(selectedJobProfile), disabled: !selectedJobProfile }), _jsx(DeleteButton, { onClick: () => selectedJobProfile && handleDelete(selectedJobProfile), disabled: !selectedJobProfile })] })] }), _jsxs(DataTable, { ref: dt, value: jobProfiles, loading: loading, selectionMode: "single", selection: selectedJobProfile, onSelectionChange: (e) => setSelectedJobProfile(e.value), dataKey: "jobProfileId", responsiveLayout: "scroll", emptyMessage: "No job profiles found", paginator: true, rows: rows, first: first, onPage: onPageChange, rowsPerPageOptions: [5, 10, 20, 50], children: [_jsx(Column, { selectionMode: "single", headerStyle: { width: '3rem' }, frozen: true }), _jsx(Column, { field: "clientName", header: "Client", sortable: true }), _jsx(Column, { field: "departmentName", header: "Department", sortable: true }), _jsx(Column, { field: "jobRole", header: "Role", sortable: true }), _jsx(Column, { field: "jobProfileDescription", header: "Description", style: { maxWidth: '200px' } }), _jsx(Column, { field: "techSpecification", header: "Tech Stack", style: { maxWidth: '200px' } }), _jsx(Column, { field: "positions", header: "Positions", sortable: true, style: { width: '8rem' } }), _jsx(Column, { field: "location", header: "Location", sortable: true }), _jsx(Column, { field: "receivedOn", header: "Received On", sortable: true, body: (rowData) => dateBodyTemplate(rowData, 'receivedOn') }), _jsx(Column, { field: "estimatedCloseDate", header: "Close Date", sortable: true, body: (rowData) => dateBodyTemplate(rowData, 'estimatedCloseDate') }), _jsx(Column, { field: "status", header: "Status", body: statusBodyTemplate, sortable: true })] }), _jsx(JobProfileAddEdit, { visible: addEditVisible, onHide: closeDialog, onSave: handleSave, jobProfile: selectedJobProfile, clients: clients, loading: loading }), _jsx(JobProfileDelete, { visible: deleteVisible, onHide: closeDeleteDialog, onDelete: handleDeleteConfirm, jobProfile: selectedJobProfile, clients: clients, loading: loading })] }));
};
export default JobProfileMain;
