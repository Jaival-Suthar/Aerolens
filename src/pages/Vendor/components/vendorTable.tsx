import React, { useRef, useState, useEffect } from "react";
import { DataTable, type DataTableFilterMeta } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import SearchButton from "../../../shared/SearchButton";
import AddButton from "../../../shared/AddButton";
import EditButton from "../../../shared/EditButton";
import DeleteButton from "../../../shared/DeleteButton";
import VendorAddEdit from "./vendorAddEdit";
import VendorDelete from "./vendorDelete";
import type { VendorType } from "../types/vendorTypes";
import { FilterMatchMode } from "primereact/api";
import { VendorService } from "../services/useVendor";
import { useAuth } from "../../../shared/auth/AuthContext";
import { useSearchParams } from "react-router-dom";

const VendorTable: React.FC = () => {
  const toast = useRef<Toast>(null);
  const { accessToken } = useAuth(); // get token from auth context
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // --- URL-aware pagination ---
  const initialFirst = Number(searchParams.get("first")) || 0;
  const initialRows = Number(searchParams.get("rows")) || 10;

  const [rows, setRows] = useState(initialRows);
  const [first, setFirst] = useState(initialFirst);

  const [vendors, setVendors] = useState<VendorType[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<VendorType | null>(null);
  const [filters, setFilters] = useState<DataTableFilterMeta>({
    global: { value: searchParams.get("q") || null, matchMode: FilterMatchMode.CONTAINS },
    vendorName: { value: null, matchMode: FilterMatchMode.EQUALS },
    vendorPhone: { value: null, matchMode: FilterMatchMode.CONTAINS },
    vendorEmail: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editVendor, setEditVendor] = useState<VendorType | null>(null);

  // Fetch vendors
  const fetchVendors = async () => {
    if (!accessToken) return; // guard in case token is missing
    try {
      setLoading(true);
      const data = await VendorService.getAllVendors(accessToken);
      setVendors(data);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch vendors",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors(); // fetch immediately on mount
  }, [accessToken]);

  // --- Pagination handler (updates URL) ---
  const onPageChange = (event: any) => {
    setFirst(event.first);
    setRows(event.rows);

    setSearchParams({
      ...Object.fromEntries(searchParams.entries()),
      first: event.first.toString(),
      rows: event.rows.toString(),
      q: (filters.global as any)?.value || "",
    });
  };

  // --- Global filter handler (updates URL) ---
  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters((prev) => ({
      ...prev,
      global: { value, matchMode: FilterMatchMode.CONTAINS },
    }));

    setSearchParams({
      ...Object.fromEntries(searchParams.entries()),
      q: value,
      first: "0", // reset to first page when searching
      rows: rows.toString(),
    });
    setFirst(0);
  };

  return (
    <>
      <Toast ref={toast} />

      <div className="flex justify-content-between align-items-center mb-2">
        <h2>Vendor</h2>
        <div className="flex gap-2">
          <SearchButton
            value={(filters.global as any)?.value || ""}
            onChange={onGlobalFilterChange}
            placeholder="Search vendors..."
          />
          <AddButton
            onClick={() => {
              setEditVendor(null);
              setSelectedVendor(null);
              setShowAddEdit(true);
            }}
          />
          <EditButton
            disabled={!selectedVendor}
            onClick={() => {
              if (selectedVendor) {
                setEditVendor(selectedVendor);
                setShowAddEdit(true);
              }
            }}
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
          globalFilterFields={["vendorName", "vendorPhone", "vendorEmail"]}
          scrollable
          scrollHeight="flex"
          tableStyle={{ minWidth: "80rem" }}
          loading={loading}
          paginator
          rows={rows}
          first={first}
          onPage={onPageChange}
          rowsPerPageOptions={[10, 20, 50]}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Vendors"
        >
          <Column selectionMode="single" bodyStyle={{ textAlign: "center" }} />
          <Column
            field="vendorName"
            header="Organization Name"
            sortable
            filter
            filterElement={(options) => (
              <Dropdown
                value={options.value}
                options={vendors
                  .map((v) => v.vendorName)
                  .filter((v, i, a) => a.indexOf(v) === i)}
                onChange={(e) => options.filterCallback(e.value)}
                placeholder="Select Organization"
                showClear
              />
            )}
          />
          <Column
            field="vendorPhone"
            header="Phone"
            sortable
            filter
            filterPlaceholder="Search by phone"
          />
          <Column
            field="vendorEmail"
            header="Email"
            sortable
            filter
            filterPlaceholder="Search by email"
          />
        </DataTable>
      </div>

      {/* Add / Edit Vendor */}
      <VendorAddEdit
        visible={showAddEdit}
        vendorToEdit={editVendor}
        onHide={() => {
          setShowAddEdit(false);
          setEditVendor(null);
        }}
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
