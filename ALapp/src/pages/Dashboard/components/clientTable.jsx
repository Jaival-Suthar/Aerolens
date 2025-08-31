import React, { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";

const initialClients = [
  { clientId: 1, clientName: "Client One", address: "1234 Main St, City, Country" },
  { clientId: 2, clientName: "Client Two", address: "5678 Second St, City, Country" },
  { clientId: 3, clientName: "Client Three", address: "91011 Third St, City, Country" },
    { clientId: 4, clientName: "Client Four", address: "1213 Fourth St, City, Country" },
    { clientId: 5, clientName: "Client Five", address: "1415 Fifth St, City, Country" },
    { clientId: 6, clientName: "Client Six", address: "1617 Sixth St, City, Country" },

    { clientId: 7, clientName: "Client Seven", address: "1819 Seventh St, City, Country" },
    { clientId: 8, clientName: "Client Eight", address: "2021 Eighth St, City, Country" },
    { clientId: 9, clientName: "Client Nine", address: "2223 Ninth St, City, Country" },
    { clientId: 10, clientName: "Client Ten", address: "2425 Tenth St, City, Country" },
    { clientId: 11, clientName: "Client Eleven", address: "2627 Eleventh St, City, Country" },
    { clientId: 12, clientName: "Client Twelve", address: "2829 Twelfth St, City, Country" },
    { clientId: 13, clientName: "Client Thirteen", address: "3031 Thirteenth St, City, Country" },
    { clientId: 14, clientName: "Client Fourteen", address: "3233 Fourteenth St, City, Country" },
    { clientId: 15, clientName: "Client Fifteen", address: "3435 Fifteenth St, City, Country" },
    { clientId: 16, clientName: "Client Sixteen", address: "3637 Sixteenth St, City, Country" },
    { clientId: 17, clientName: "Client Seventeen", address: "3839 Seventeenth St, City, Country" },
    { clientId: 18, clientName: "Client Eighteen", address: "4041 Eighteenth St, City, Country" },
    { clientId: 19, clientName: "Client Nineteen", address: "4243 Nineteenth St, City, Country" },
    { clientId: 20, clientName: "Client Twenty", address: "4445 Twentieth St, City, Country" },

    { clientId: 21, clientName: "Client Twenty-One", address: "4647 Twenty-First St, City, Country" },
    { clientId: 22, clientName: "Client Twenty-Two", address: "4849 Twenty-Second St, City, Country" },
    { clientId: 23, clientName: "Client Twenty-Three", address: "5051 Twenty-Third St, City, Country" },
    { clientId: 24, clientName: "Client Twenty-Four", address: "5253 Twenty-Fourth St, City, Country" },
    { clientId: 25, clientName: "Client Twenty-Five", address: "5455 Twenty-Fifth St, City, Country" }, 
    { clientId: 26, clientName: "Client Twenty-Six", address: "5657 Twenty-Sixth St, City, Country" },

];

const ClientTable = () => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(initialClients.length);

  // Selection state
  const [selectionMode, setSelectionMode] = useState("checkbox"); // "checkbox" or "single"
  const [selectedClients, setSelectedClients] = useState(selectionMode === "checkbox" ? [] : null);

  // Data to display on current page
  const clientsOnPage = initialClients.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Handler for paginator page change
  const onPageChange = (event) => {
    setCurrentPage(event.page + 1);
    setRowsPerPage(event.rows);
    // TODO: Call API with event.page + 1 and event.rows
  };

  // Handle selection change
  const onSelectionChange = (e) => {
    setSelectedClients(e.value);
  };

  const cellClass = "py-1 px-2";
  const headerClass = "py-1 px-2 font-semibold";

  return (
    <section className="client-table" aria-label="Client data table">
      <DataTable
        value={clientsOnPage}
        responsiveLayout="scroll"
        stripedRows
        className="text-m"
        paginator={false}
        scrollHeight="800px"
        rows={rowsPerPage}
        emptyMessage="No clients to display."
        selectionMode={selectionMode} // enable selection mode
        selection={selectedClients}  // bind selection state
        onSelectionChange={onSelectionChange} // update selection on change
        dataKey="clientId" // unique key field
      >
        {/* Checkbox column for multi-select or radio for single-select */}
        <Column selectionMode={selectionMode} headerStyle={{ width: "3rem" }}></Column>

        <Column
          field="clientId"
          header="Client ID"
          sortable
          bodyClassName={cellClass}
          headerClassName={headerClass}
          style={{ height: "2rem" }}
        />
        <Column
          field="clientName"
          header="Client Name"
          sortable
          bodyClassName={cellClass}
          headerClassName={headerClass}
          style={{ height: "2rem" }}
        />
        <Column
          field="address"
          header="Address"
          bodyClassName={cellClass}
          headerClassName={headerClass}
          style={{ height: "2rem" }}
        />
      </DataTable>

      <Paginator
        first={(currentPage - 1) * rowsPerPage}
        rows={rowsPerPage}
        totalRecords={totalRecords}
        onPageChange={onPageChange}
        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        rowsPerPageOptions={[5, 10, 20, 50]}
        className="mt-3"
      />
    </section>
  );
};

export default ClientTable;
