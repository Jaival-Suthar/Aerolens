import React, { useState, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { LookupEntry } from '../types/lookupTypes';
import AddButton from '../../../shared/AddButton';
import EditButton from '../../../shared/EditButton'; 
import DeleteButton from '../../../shared/DeleteButton';
import SearchButton from '../../../shared/SearchButton';  // ← ADD
import { AddLookupForm } from './AddEditLookupForm';
import { DeleteLookupForm } from './DeleteLookupForm';
import { FilterMatchMode } from 'primereact/api';  // ← ADD

// REMOVE PaginationMeta interface - not needed anymore

interface LookupTableProps {
  data: LookupEntry[];
  loading?: boolean;
  onDataChange?: () => void;
  // REMOVE: meta, onPageChange, onSelectionChange
}

const LookupTable: React.FC<LookupTableProps> = ({
  data,
  loading = false,
  onDataChange,
}) => {
  const [selectedLookup, setSelectedLookup] = useState<LookupEntry | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false); 
  const [showEditDialog, setShowEditDialog] = useState(false);

  // ← ADD search state
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters, setFilters] = useState<any>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });

  // ← ADD filter change handler
  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const _filters = { ...filters };
    _filters['global'].value = value;
    
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const onSelectionChangeHandler = useCallback(
    (e: any) => {
      const selected = e?.value && typeof e.value === 'object' && 'lookupKey' in e.value ? e.value : null;
      setSelectedLookup(selected);
    },
    []
  );

  const handleAddClick = () => {
    setSelectedLookup(null); 
    setShowAddDialog(true);
  };
  const handleEditClick = () => { 
    if (selectedLookup) {
      setShowEditDialog(true);
    }
  };
  const handleDeleteClick = () => { 
    if (selectedLookup) {
      setShowDeleteDialog(true);
    }
  };

  const handleSuccess = useCallback(() => { 
    onDataChange?.();
    setSelectedLookup(null); 
    setShowEditDialog(false);
    setShowDeleteDialog(false);
  }, [onDataChange]);

  return (
    <div
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflow: "hidden",
      }}
    >
      <div
        className="flex justify-content-between align-items-center mb-2"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 2,
          background: "white",
          paddingBottom: "0.5rem",
        }}
      >
        <h2 style={{ color: "#07253f" }}>Lookup Data</h2>
        <div className="flex gap-2">
          <SearchButton  
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Search lookups..."
          />
          <AddButton onClick={handleAddClick} />
          <EditButton // <--- ADD Edit Button
            onClick={handleEditClick}
            disabled={!selectedLookup} // Disabled if nothing is selected
          />
          <DeleteButton // <--- ADD Delete Button
            onClick={handleDeleteClick}
            disabled={!selectedLookup} // Disabled if nothing is selected
          />
        </div>
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
      <DataTable
        value={data}
        loading={loading}
        paginator 
        rows={20}  
        rowsPerPageOptions={[20,50,100]}
        scrollable
        scrollHeight="flex"
        responsiveLayout="scroll"
        className="p-datatable-sm"
        selectionMode="single"
        selection={selectedLookup}
        onSelectionChange={onSelectionChangeHandler}
        dataKey="lookupKey"
        emptyMessage="No lookup entries found"
        filters={filters}  
        globalFilterFields={['lookupKey', 'tag', 'value']} 
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
      >
        <Column selectionMode="single" headerStyle={{ width: '3rem' }} frozen />
        <Column field="lookupKey" header="Key" sortable />
        <Column field="tag" header="Tag" sortable />
        <Column field="value" header="Value" sortable />
      </DataTable>
      </div>
      <AddLookupForm
        visible={showAddDialog || showEditDialog} // <--- CHANGE: Use for both Add/Edit
        lookupToEdit={selectedLookup} // <--- PASS SELECTED LOOKUP for editing
        isEdit={!!selectedLookup} // <--- New prop to tell form if it's an edit
        onHide={() => {
            setShowAddDialog(false);
            setShowEditDialog(false);
            setSelectedLookup(null);
        }}
        onSuccess={handleSuccess}
      />
      
      <DeleteLookupForm // <--- ADD Delete Form
        visible={showDeleteDialog}
        lookup={selectedLookup}
        onHide={() => setShowDeleteDialog(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default LookupTable;