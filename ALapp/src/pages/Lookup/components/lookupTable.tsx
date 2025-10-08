import React, { useState, useCallback } from 'react';
import {
  DataTable,
  type DataTablePageEvent,
} from 'primereact/datatable';
import { Column } from 'primereact/column';
import { LookupEntry } from '../types/lookupTypes';
import AddButton from '../../../shared/AddButton';
//import DeleteButton from '../../../shared/DeleteButton';
import { AddLookupForm } from './AddLookupForm';
import { DeleteLookupForm } from './DeleteLookupForm';

interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

interface LookupTableProps {
  data: LookupEntry[];
  meta: PaginationMeta | null;
  loading?: boolean;
  onPageChange: (page: number, limit: number) => void;
  onSelectionChange?: (selected: LookupEntry | null) => void;
  onDataChange?: () => void;
}

const LookupTable: React.FC<LookupTableProps> = ({
  data,
  meta,
  loading = false,
  onPageChange,
  onSelectionChange,
  onDataChange,
}) => {
  const [selectedLookup, setSelectedLookup] = useState<LookupEntry | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Memoized selection handler with strict typing
  const onSelectionChangeHandler = useCallback(
    (e: any) => {
      // Defensive check and normalization
      const selected = e?.value && typeof e.value === 'object' && 'lookupKey' in e.value ? e.value : null;
      setSelectedLookup(selected);
      onSelectionChange?.(selected);
    },
    [onSelectionChange]
  );


  // Page change handler, calculates new page and limit correctly
  const handlePageChange = useCallback(
    (event: DataTablePageEvent) => {
      const newPage = Math.floor(event.first / event.rows) + 1;
      const newLimit = event.rows;
      onPageChange(newPage, newLimit);
    },
    [onPageChange]
  );

  const handleAddClick = () => setShowAddDialog(true);

  // Add success callback resets relevant data
  const handleAddSuccess = useCallback(() => {
    onDataChange?.();
  }, [onDataChange]);

  // Delete success callback clears selection and refreshes data
  const handleDeleteSuccess = useCallback(() => {
    setSelectedLookup(null);
    onSelectionChange?.(null);
    onDataChange?.();
  }, [onSelectionChange, onDataChange]);

  // Calculate index of first record for paginator
  const first = meta ? (meta.currentPage - 1) * meta.limit : 0;

  return (
    <div className="card">
      <div className="flex justify-content-between align-items-center mb-2">
        <h2>Lookup Data</h2>
        <div className="flex gap-2">
          <AddButton onClick={handleAddClick} />
          {/* 
            Uncomment when Delete functionality is ready
            <DeleteButton
              onClick={() => showDeleteDialog && setShowDeleteDialog(true)}
              disabled={!selectedLookup}
            /> 
          */}
        </div>
      </div>

      <DataTable
        value={data}
        loading={loading}
        paginator
        first={first}
        rows={meta?.limit || 10}
        totalRecords={meta?.totalRecords || 0}
        lazy
        onPage={handlePageChange}
        responsiveLayout="scroll"
        className="p-datatable-sm"
        selectionMode="single"
        selection={selectedLookup}
        onSelectionChange={onSelectionChangeHandler}
        dataKey="lookupKey"
        emptyMessage="No lookup entries found"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
        rowsPerPageOptions={[5, 10, 25, 50]}
      >
        <Column selectionMode="single" headerStyle={{ width: '3rem' }} frozen />
        <Column field="lookupKey" header="Key" sortable />
        <Column field="tag" header="Tag" sortable />
        <Column field="value" header="Value" />
      </DataTable>

      <AddLookupForm
        visible={showAddDialog}
        onHide={() => setShowAddDialog(false)}
        onSuccess={handleAddSuccess}
      />

      <DeleteLookupForm
        visible={showDeleteDialog}
        lookup={selectedLookup}
        onHide={() => setShowDeleteDialog(false)}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default LookupTable;
