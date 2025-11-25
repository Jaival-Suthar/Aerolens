import React, { useState, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { LookupEntry } from '../types/lookupTypes';
import AddButton from '../../../shared/AddButton';
import SearchButton from '../../../shared/SearchButton';  // ← ADD
import { AddLookupForm } from './AddLookupForm';
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

  const handleAddClick = () => setShowAddDialog(true);

  const handleAddSuccess = useCallback(() => {
    onDataChange?.();
  }, [onDataChange]);

  return (
    <div className="card">
      <div className="flex justify-content-between align-items-center mb-2">
        <h2>Lookup Data</h2>
        <div className="flex gap-2">
          <SearchButton  
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Search lookups..."
          />
          <AddButton onClick={handleAddClick} />
        </div>
      </div>

      <DataTable
        value={data}
        loading={loading}
        paginator 
        rows={10}  
        rowsPerPageOptions={[5, 10, 25, 50]}
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

      <AddLookupForm
        visible={showAddDialog}
        onHide={() => setShowAddDialog(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
};

export default LookupTable;