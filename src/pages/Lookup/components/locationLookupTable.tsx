import React, { useState, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';

import { LocationEntry } from '../types/locationTypes';  // <-- Update path if needed

import AddButton from '../../../shared/AddButton';
import EditButton from '../../../shared/EditButton';
import DeleteButton from '../../../shared/DeleteButton';
import SearchButton from '../../../shared/SearchButton';

 import AddEditLocationForm  from './AddEditLocationForm';
 import  DeleteLocationForm  from './DeleteLocationForm';

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

  // Search State
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
    if (selectedLocation) {
      setShowEditDialog(true);
    }
  };

  const handleDeleteClick = () => {
    if (selectedLocation) {
      setShowDeleteDialog(true);
    }
  };

  const handleSuccess = useCallback(() => {
    onDataChange?.();
    setSelectedLocation(null);
    setShowAddDialog(false);
    setShowEditDialog(false);
    setShowDeleteDialog(false);
  }, [onDataChange]);

  return (
     <div className="card" style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div className="flex justify-content-between align-items-center mb-2" style={{position: "sticky", top: 0, zIndex: 2, background: "white", paddingBottom: "0.5rem"}}>
        <h2 style={{ color: "#07253f" }}>Location Lookup</h2>

        <div className="flex gap-2">
          <SearchButton
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Search locations..."
          />

          <AddButton onClick={handleAddClick} />

          <EditButton
            onClick={handleEditClick}
            disabled={!selectedLocation}
          />

          <DeleteButton
            onClick={handleDeleteClick}
            disabled={!selectedLocation}
          />
        </div>
      </div>
      <div style={{ flex: 1, overflow: "auto" }}>
      <DataTable
        value={data}
        loading={loading}
        paginator
        rows={20}
        rowsPerPageOptions={[20 ,50, 100]}
        scrollable
        scrollHeight="flex"
        responsiveLayout="scroll"
        className="p-datatable-sm"
        selectionMode="single"
        selection={selectedLocation}
        onSelectionChange={onSelectionChangeHandler}
        dataKey="locationId"     // <-- Make sure this exists in your LocationEntry
        emptyMessage="No locations found"
        filters={filters}
        globalFilterFields={[ 'city', 'state', 'country']}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
      >
        <Column selectionMode="single" headerStyle={{ width: '3rem' }} frozen />
        <Column field="city" header="City" sortable />
        <Column field="state" header="State" sortable />
        <Column field="country" header="Country" sortable />
      </DataTable>
      </div>
      {/* ADD/EDIT */}
      <AddEditLocationForm
        visible={showAddDialog || showEditDialog}
        locationToEdit={selectedLocation}
        isEdit={showEditDialog}
        existingCountries={existingCountries}  // ← Pass this
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
    </div>
  );
};

export default LocationLookupTable;
