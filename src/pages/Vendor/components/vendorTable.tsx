import React, { useRef, useState, useEffect } from "react";
import { DataTable, type DataTableFilterMeta } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import SearchButton from "../../../shared/SearchButton";
import AddButton from "../../../shared/AddButton";
import EditButton from "../../../shared/EditButton";
import DeleteButton from "../../../shared/DeleteButton";
import 'primereact/resources/themes/saga-blue/theme.css';
import VendorAddEdit from "./vendorAddEdit";
import VendorDelete from "./vendorDelete";
import type { VendorType } from "../types/vendorTypes";
import { FilterMatchMode } from "primereact/api";
import { useVendorService } from "../services/useVendor";

const VendorTable: React.FC = () => {
  const toast = useRef<Toast>(null);
  const { getAllVendors } = useVendorService();
  const [loading, setLoading] = useState(true);

  const [vendors, setVendors] = useState<VendorType[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<VendorType | null>(null);
  const [filters, setFilters] = useState<DataTableFilterMeta>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    vendorName: { value: null, matchMode: FilterMatchMode.EQUALS },
    vendorPhone: { value: null, matchMode: FilterMatchMode.CONTAINS },
    vendorEmail: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editVendor, setEditVendor] = useState<VendorType | null>(null);
// Add at the top with other useState
const [globalFilterValue, setGlobalFilterValue] = useState<string>("");

  // fetch vendors on mount and whenever called by children
  const fetchVendors = async () => {
    try {
      setLoading(true);
      const data = await getAllVendors();
      setVendors(data);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch vendors',
        life: 3000,
      });
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors(); // show data immediately on table open
  }, []);
  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGlobalFilterValue(value); // update input value
    setFilters(prev => ({
      ...prev,
      global: { value, matchMode: FilterMatchMode.CONTAINS } // update datatable filters
    }));
  };
  
 
  return (
    <>
      <Toast ref={toast} />

      <div className="flex justify-content-between align-items-center mb-2">
        <h2>Vendor</h2>
        <div className="flex gap-2">
        <SearchButton
  value={globalFilterValue}   // use state instead of filters.global
  onChange={onGlobalFilterChange} // update both input and datatable filter
  placeholder="Search vendors..."
/>

          <AddButton onClick={() => { setEditVendor(null); setSelectedVendor(null); setShowAddEdit(true); }} />
          <EditButton
            disabled={!selectedVendor}
            onClick={() => { if (selectedVendor) { setEditVendor(selectedVendor); setShowAddEdit(true); } }}
          />
          <DeleteButton
            disabled={!selectedVendor}
            onClick={() => setShowDelete(true)}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        <DataTable
          value={vendors}
          dataKey="vendorId"
          selectionMode="single"
          selection={selectedVendor}
          onSelectionChange={(e: any) => setSelectedVendor(e.value ?? null)}
          filters={filters}
          filterDisplay="menu"
          onFilter={(e) => setFilters(e.filters)}
          globalFilterFields={['vendorName', 'vendorPhone', 'vendorEmail']}
          scrollable
          scrollHeight="flex"
          tableStyle={{ minWidth: "80rem" }}
          loading={loading}
        >
          <Column selectionMode="single" bodyStyle={{ textAlign: 'center' }} />
          <Column
            field="vendorName"
            header="Organization Name"
            sortable
            filter
            filterElement={(options) => (
              <Dropdown
                value={options.value}
                options={vendors.map(v => v.vendorName).filter((v, i, a) => a.indexOf(v) === i)}
                onChange={(e) => options.filterCallback(e.value)}
                placeholder="Select Organization"
                showClear
              />
            )}
          />
          <Column field="vendorPhone" header="Phone" sortable filter filterPlaceholder="Search by phone" />
          <Column field="vendorEmail" header="Email" sortable filter filterPlaceholder="Search by email" />
        </DataTable>
      </div>

      {/* Add / Edit Vendor */}
      <VendorAddEdit
        visible={showAddEdit}
        vendorToEdit={editVendor}
        onHide={() => { setShowAddEdit(false); setEditVendor(null); }}
        onUpdate={fetchVendors} // child handles API, parent refreshes table
      />

      {/* Delete Vendor */}
      <VendorDelete
        visible={showDelete}
        vendorToDelete={selectedVendor}
        onHide={() => setShowDelete(false)}
        onUpdate={fetchVendors} // child handles API, parent refreshes table
      />
    </>
  );
};

export default VendorTable;
