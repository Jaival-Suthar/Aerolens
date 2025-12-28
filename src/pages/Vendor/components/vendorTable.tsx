import React, { useState, useCallback } from "react";
import { DataTable, type DataTableSelectionSingleChangeEvent, type DataTablePageEvent } from "primereact/datatable";
import { Column } from "primereact/column";

import AddButton from "../../../shared/AddButton";
import EditButton from "../../../shared/EditButton";
import DeleteButton from "../../../shared/DeleteButton";

import VendorAddEdit from "./VendorAddEdit"
import VendorDelete from "./VendorDelete";
import type { VendorType } from "../types/vendorTypes";

const VendorTable: React.FC = () => {
  const [vendors, setVendors] = useState<VendorType[]>([
    { vendorId: "v1", organisationName: "Vendor A", phone: "1234567890", email: "a@vendor.com" },
    { vendorId: "v2", organisationName: "Vendor B", phone: "0987654321", email: "b@vendor.com" },
  ]);
  const [selectedVendor, setSelectedVendor] = useState<VendorType | null>(null);
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editVendor, setEditVendor] = useState<VendorType | null>(null);

  // Add or Edit handler
  const handleSave = (vendor: VendorType) => {
    setVendors((prev) => {
      const existingIndex = prev.findIndex(v => v.vendorId === vendor.vendorId);
      if (existingIndex >= 0) {
        // Edit
        const newVendors = [...prev];
        newVendors[existingIndex] = vendor;
        return newVendors;
      } else {
        // Add
        return [...prev, vendor];
      }
    });
  };

  // Delete handler
  const handleDelete = () => {
    if (!selectedVendor) return;
    setVendors((prev) => prev.filter(v => v.vendorId !== selectedVendor.vendorId));
    setSelectedVendor(null);
  };

  const onPageChange = useCallback((e: DataTablePageEvent) => {}, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div className="flex gap-2 mb-2">
        <AddButton onClick={() => { setEditVendor(null); setShowAddEdit(true); }} />
        <EditButton onClick={() => { if (selectedVendor) { setEditVendor(selectedVendor); setShowAddEdit(true); } }} disabled={!selectedVendor} />
        <DeleteButton onClick={() => setShowDelete(true)} disabled={!selectedVendor} />
      </div>

      <DataTable
        value={vendors}
        selectionMode="single"
        selection={selectedVendor}
        onSelectionChange={(e: DataTableSelectionSingleChangeEvent<VendorType[]>) => setSelectedVendor(e.value ?? null)}
        dataKey="vendorId"
        paginator
        rows={10}
        scrollable
        scrollHeight="flex"
        onPage={onPageChange}
      >
        <Column selectionMode="single" style={{ width: "3rem" }} />
        <Column field="organisationName" header="Organisation Name" sortable />
        <Column field="phone" header="Phone" sortable/>
        <Column field="email" header="Email" sortable />
      </DataTable>

      <VendorAddEdit
        visible={showAddEdit}
        vendorToEdit={editVendor}
        onHide={() => setShowAddEdit(false)}
        onSave={handleSave}
      />

      <VendorDelete
        visible={showDelete}
        vendorToDelete={selectedVendor}
        onHide={() => setShowDelete(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default VendorTable;
