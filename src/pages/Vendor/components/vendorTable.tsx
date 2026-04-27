import React, { useRef, useState, useEffect } from "react";
import { DataTable, type DataTableFilterMeta } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import SearchButton from "../../../shared/SearchButton";
import AddButton from "../../../shared/AddButton";
import EditButton from "../../../shared/EditButton";
import DeleteButton from "../../../shared/DeleteButton";
import CogButton from "../../../shared/CogButton";
import ChangeLogsDialog from "../../../shared/ChangeLogsDialog";
import VendorAddEdit from "./vendorAddEdit";
import VendorDelete from "./vendorDelete";
import type { VendorType } from "../types/vendorTypes";
import { FilterMatchMode } from "primereact/api";
import { VendorService } from "../services/useVendor";
import { useAuth } from "../../../shared/auth/AuthContext";
import { useSearchParams } from "react-router-dom";
import VendorDeletedRecordsDialog from "./vendorDeletedRecordsDialog";

const VendorTable: React.FC = () => {
  const toast = useRef<Toast>(null);
  const { accessToken } = useAuth(); // get token from auth context
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // --- URL-aware pagination ---
  const initialFirst = Number(searchParams.get("first")) || 0;
  const initialRows = Number(searchParams.get("rows")) || 20;

  const [rows, setRows] = useState(initialRows);
  const [first, setFirst] = useState(initialFirst);

  const [vendors, setVendors] = useState<VendorType[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<VendorType | null>(null);
  const [filters, setFilters] = useState<DataTableFilterMeta>({
    global: { value: searchParams.get("q") || null, matchMode: FilterMatchMode.CONTAINS },
    vendorName: { value: null, matchMode: FilterMatchMode.EQUALS },
    vendorPhone: { value: null, matchMode: FilterMatchMode.CONTAINS },
    vendorEmail: { value: null, matchMode: FilterMatchMode.CONTAINS },
    contactPersonName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showDeletedRecordsDialog, setShowDeletedRecordsDialog] = useState(false);
  const [showCogMenu, setShowCogMenu] = useState(false);
  const [showChangeLogsDialog, setShowChangeLogsDialog] = useState(false);
  const cogMenuRef = useRef<HTMLDivElement | null>(null);
  const [editVendor, setEditVendor] = useState<VendorType | null>(null);

  // Fetch vendors
  const fetchVendors = async () => {
    if (!accessToken) return; // guard in case token is missing
    try {
      setLoading(true);
      const res = await VendorService.getAllVendors(accessToken);
      setVendors(res.data);
    } catch (error: unknown) {
    let message = "Something went wrong";

    if (error instanceof Error) {
      message = error.message;
    } else if (
      typeof error === "object" &&
      error !== null &&
      "message" in error
    ) {
      message = String((error as any).message);
    }

    toast.current?.show({
      severity: "error",
      summary: "Error",
      detail: message,
    });
  } finally {
      setLoading(false);
    }
  };

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
    fetchVendors();
  }, [accessToken]);
  useEffect(() => {
  setSelectedVendor(null);
}, [vendors]);

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
        <h2 style={{ color: "#07253f" }}>Vendor</h2>
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
          <div ref={cogMenuRef} style={{ position: "relative" }}>
            <CogButton
              onClick={() => setShowCogMenu((prev) => !prev)}
              tooltip="Vendor Activity"
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
                  tabIndex={selectedVendor ? 0 : -1}
                  aria-disabled={!selectedVendor}
                  onClick={() => { if (!selectedVendor) return; setShowCogMenu(false); setShowChangeLogsDialog(true); }}
                  onKeyDown={(e) => { if (!selectedVendor) return; if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setShowCogMenu(false); setShowChangeLogsDialog(true); } }}
                  style={{ display: "flex", alignItems: "center", cursor: selectedVendor ? "pointer" : "not-allowed", opacity: selectedVendor ? 1 : 0.4 }}
                  onMouseEnter={(e) => { if (selectedVendor) e.currentTarget.style.backgroundColor = "#f3f4f6"; }}
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
                    Deleted Vendors
                  </span>
                </div>
              </div>
            )}
          </div>
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
          globalFilterFields={["vendorName", "vendorPhone", "vendorEmail", "contactPersonName"]}
          scrollable
          scrollHeight="flex"
          tableStyle={{ minWidth: "80rem" }}
          loading={loading}
          paginator
          rows={rows}
          first={first}
          onPage={onPageChange}
          rowsPerPageOptions={[20, 50, 100]}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
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
          field="contactPersonName"
          header="Person of Contact"
          sortable
          filter
          filterPlaceholder="Search contact person"
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
      <VendorDeletedRecordsDialog
        isOpen={showDeletedRecordsDialog}
        onClose={() => setShowDeletedRecordsDialog(false)}
      />
      <ChangeLogsDialog
        isOpen={showChangeLogsDialog}
        onClose={() => setShowChangeLogsDialog(false)}
        title="Vendor Change Logs"
      />
    </>
  );
};

export default VendorTable;
