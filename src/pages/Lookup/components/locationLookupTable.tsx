import React, { useState, useCallback, useRef, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';

import { LocationEntry } from '../types/locationTypes';

import AddButton from '../../../shared/AddButton';
import EditButton from '../../../shared/EditButton';
import DeleteButton from '../../../shared/DeleteButton';
import SearchButton from '../../../shared/SearchButton';
import CogButton from '../../../shared/CogButton';
import ChangeLogsDialog from '../../../shared/ChangeLogsDialog';
import AddEditLocationForm from './AddEditLocationForm';
import DeleteLocationForm from './DeleteLocationForm';
import LocationDeletedRecordsDialog from './locationDeletedRecordsDialog';

interface LocationLookupTableProps {
  data: LocationEntry[];
  loading?: boolean;
  onDataChange?: () => void;
}

const LocationLookupTable: React.FC<LocationLookupTableProps> = ({
  data,
  loading = false,
  onDataChange
}) => {
  const [selectedLocation, setSelectedLocation] = useState<LocationEntry | null>(null);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCogMenu, setShowCogMenu] = useState(false);
  const [showChangeLogsDialog, setShowChangeLogsDialog] = useState(false);
  const [showDeletedRecordsDialog, setShowDeletedRecordsDialog] = useState(false);
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

  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters, setFilters] = useState<any>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });

  const existingCountries = Array.from(
    new Set(data.map(loc => loc.country).filter(Boolean))
  );

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const _filters = { ...filters };
    _filters['global'].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const onSelectionChangeHandler = useCallback((e: any) => {
    const selected = e?.value && typeof e.value === 'object' ? e.value : null;
    setSelectedLocation(selected);
  }, []);

  const handleAddClick = () => {
    setSelectedLocation(null);
    setShowAddDialog(true);
  };

  const handleEditClick = () => {
    if (selectedLocation) setShowEditDialog(true);
  };

  const handleDeleteClick = () => {
    if (selectedLocation) setShowDeleteDialog(true);
  };

  const handleSuccess = useCallback(() => {
    onDataChange?.();
    setSelectedLocation(null);
    setShowAddDialog(false);
    setShowEditDialog(false);
    setShowDeleteDialog(false);
  }, [onDataChange]);

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "visible" }}>
      <div className="flex justify-content-between align-items-center mb-2" style={{ background: "white", paddingBottom: "0.5rem" }}>
        <h2 style={{ color: "#07253f" }}>Location Lookup</h2>

        <div className="flex gap-2">
          <SearchButton
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Search locations..."
          />
          <AddButton onClick={handleAddClick} />
          <EditButton onClick={handleEditClick} disabled={!selectedLocation} />
          <DeleteButton onClick={handleDeleteClick} disabled={!selectedLocation} />

          <div ref={cogMenuRef} style={{ position: "relative" }}>
            <CogButton
              onClick={() => setShowCogMenu((prev) => !prev)}
              tooltip="Location Activity"
            />
            {showCogMenu && (
              <div
                className="card shadow-3"
                style={{ position: "absolute", right: 0, top: 50, zIndex: 9999, minWidth: 220, backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "0.5rem" }}
              >
                <div
                  className="p-2 border-round"
                  role="button"
                  tabIndex={selectedLocation ? 0 : -1}
                  aria-disabled={!selectedLocation}
                  onClick={() => { if (!selectedLocation) return; setShowCogMenu(false); setShowChangeLogsDialog(true); }}
                  onKeyDown={(e) => { if (!selectedLocation) return; if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setShowCogMenu(false); setShowChangeLogsDialog(true); } }}
                  style={{ display: "flex", alignItems: "center", cursor: selectedLocation ? "pointer" : "not-allowed", opacity: selectedLocation ? 1 : 0.4 }}
                  onMouseEnter={(e) => { if (selectedLocation) e.currentTarget.style.backgroundColor = "#f3f4f6"; }}
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
                    Deleted Locations
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        <DataTable
          value={data}
          loading={loading}
          paginator
          rows={20}
          rowsPerPageOptions={[20, 50, 100]}
          scrollable
          scrollHeight="flex"
          responsiveLayout="scroll"
          className="p-datatable-sm"
          selectionMode="single"
          selection={selectedLocation}
          onSelectionChange={onSelectionChangeHandler}
          dataKey="locationId"
          emptyMessage="No locations found"
          filters={filters}
          globalFilterFields={['city', 'state', 'country']}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
        >
          <Column selectionMode="single" headerStyle={{ width: '3rem' }} frozen />
          <Column field="city" header="City" sortable />
          <Column field="state" header="State" sortable />
          <Column field="country" header="Country" sortable />
        </DataTable>
      </div>

      <AddEditLocationForm
        visible={showAddDialog || showEditDialog}
        locationToEdit={selectedLocation}
        isEdit={showEditDialog}
        existingCountries={existingCountries}
        onHide={() => {
          setShowAddDialog(false);
          setShowEditDialog(false);
          setSelectedLocation(null);
        }}
        onSuccess={handleSuccess}
      />

      <DeleteLocationForm
        visible={showDeleteDialog}
        location={selectedLocation}
        onHide={() => setShowDeleteDialog(false)}
        onSuccess={handleSuccess}
      />

      <LocationDeletedRecordsDialog
        isOpen={showDeletedRecordsDialog}
        onClose={() => setShowDeletedRecordsDialog(false)}
        onRestoreSuccess={onDataChange}
      />

      <ChangeLogsDialog
        isOpen={showChangeLogsDialog}
        onClose={() => setShowChangeLogsDialog(false)}
        title="Location Change Logs"
      />
    </div>
  );
};

export default LocationLookupTable;
