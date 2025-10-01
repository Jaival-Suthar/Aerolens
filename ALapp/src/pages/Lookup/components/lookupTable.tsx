import React, { useState } from 'react';
import { DataTable, DataTablePageEvent } from 'primereact/datatable';
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

  const handleSelectionChange = (e: { value: LookupEntry | null }) => {
    setSelectedLookup(e.value);
    onSelectionChange?.(e.value);
  };

  const handlePageChange = (event: DataTablePageEvent) => {
  const newPage = (event.first / event.rows) + 1;
  const newLimit = event.rows;
  onPageChange(newPage, newLimit); // This now updates URL + localStorage
};

  const handleAddClick = () => {
    setShowAddDialog(true);
  };

  // const handleDeleteClick = () => {
  //   if (selectedLookup) {
  //     setShowDeleteDialog(true);
  //   }
  // };

  const handleAddSuccess = () => {
    onDataChange?.();
  };

  const handleDeleteSuccess = () => {
    setSelectedLookup(null);
    onSelectionChange?.(null);
    onDataChange?.();
  };

  // Calculate first record index for PrimeReact DataTable
  const first = meta ? (meta.currentPage - 1) * meta.limit : 0;
  // const totalRecords = meta?.totalRecords || 0;
  // Add right before the return statement
//console.log('🔍 Pagination Debug:', { first, totalRecords, limit: meta?.limit, meta });
  return (
    <div className="card">
      <div className="flex justify-content-between align-items-center mb-2">
        <h2>Job Profiles Requirements</h2>
        <div className="flex gap-2">
          <AddButton onClick={handleAddClick} />
          {/* <DeleteButton
            onClick={handleDeleteClick}
            disabled={!selectedLookup}
          /> */}
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
        onSelectionChange={handleSelectionChange}
        dataKey="lookupKey"
        emptyMessage="No lookup entries found"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
        rowsPerPageOptions={[5, 10, 25, 50]}
      >
        <Column
          selectionMode="single"
          headerStyle={{ width: '3rem' }}
          frozen
        />
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