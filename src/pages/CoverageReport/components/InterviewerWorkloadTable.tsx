import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DataTable, type DataTablePageEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { InterviewerReport } from "../types/interviewerReporttypes";
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";

const theme = {
  primary: "#072844",
  accent: "#55c62c",
  border: "#e5e7eb",
  headerBg: "#f8fafc",
  textMuted: "#475569",
};

interface Props {
  data: InterviewerReport[];
  loading: boolean;
}

const paginatorTemplate =
  "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown";

const currentPageReportTemplate =
  "Showing {first} to {last} of {totalRecords} entries";

const InterviewerWorkloadTable: React.FC<Props> = ({ data, loading }) => {
  const PAGE_PARAM = "workloadPage";
  const SIZE_PARAM = "workloadSize";
  const [searchParams, setSearchParams] = useSearchParams();

  const pageFromUrl = Number(searchParams.get(PAGE_PARAM)) || 1;
  const sizeFromUrl = Number(searchParams.get(SIZE_PARAM)) || 20;
  const [rowsPerPage, setRowsPerPage] = useState(sizeFromUrl);
  const [first, setFirst] = useState((pageFromUrl - 1) * sizeFromUrl);
  const [filters, setFilters] = useState({
  interviewerName: {
    value: null,
    matchMode: FilterMatchMode.CONTAINS,
  },
});
  const interviewerFilterTemplate = (options: any) => {
  return (
    <InputText
      value={options.value || ""}
      onChange={(e) => options.filterApplyCallback(e.target.value)}
      placeholder="Search interviewer"
      className="p-column-filter"
      style={{ width: "100%" }}
    />
  );
};

  const onPageChange = (event: DataTablePageEvent) => {
    const { first, rows } = event;

    setFirst(first);
    setRowsPerPage(rows);

    const newPage = Math.floor(first / rows) + 1;

    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.set(PAGE_PARAM, newPage.toString());
      params.set(SIZE_PARAM, rows.toString());
      return params;
    });
  };

  const onFilterChange = (e: any) => {
    setFilters(prev => ({
      ...prev,
      ...e.filters,
    }));
  };

  const headerStyle: React.CSSProperties = {
    background: theme.headerBg,
    color: theme.primary,
    fontWeight: 600,
    fontSize: 14,
    borderBottom: `1px solid ${theme.border}`,
    textAlign: "left",
  };

  const cellStyle: React.CSSProperties = {
    borderBottom: `1px solid ${theme.border}`,
    color: theme.textMuted,
    fontSize: 14,
    textAlign: "left",
  };

  return (
    <section
      aria-label="Interviewer workload table"
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
        border: `1px solid ${theme.border}`,
        borderRadius: 8,
        borderTop: `3px solid ${theme.accent}`,
      }}
    >
      <DataTable
        value={data}
        loading={loading}
        filters={filters}
        onFilter={onFilterChange}
        filterDisplay="menu"
        stripedRows
        rowHover
        scrollable
        scrollHeight="flex"
        responsiveLayout="scroll"

        paginator
        first={first}
        rows={rowsPerPage}
        onPage={onPageChange}
        rowsPerPageOptions={[20, 50, 100]}

        emptyMessage={loading ? "Loading..." : "No interviewer data found"}
        paginatorTemplate={paginatorTemplate}
        currentPageReportTemplate={currentPageReportTemplate}

        style={{ border: "none" }}
        tableStyle={{ minWidth: "100%" }}
      >
        <Column
          field="interviewerName"
          header="Interviewer"
          sortable
          filter
          filterField="interviewerName"
          filterElement={interviewerFilterTemplate}
          showFilterMatchModes={false}
          headerStyle={headerStyle}
          bodyStyle={{ ...cellStyle, fontWeight: 500 }}
        />
        <Column
          field="statistics.totalInterviews"
          header="Total"
          sortable
          headerStyle={headerStyle}
          bodyStyle={cellStyle}
        />
        <Column
          field="statistics.pending"
          header="Pending"
          sortable
          headerStyle={headerStyle}
          bodyStyle={cellStyle}
        />
        <Column
          field="statistics.selected"
          header="Selected"
          sortable
          headerStyle={headerStyle}
          bodyStyle={cellStyle}
        />
        <Column
          field="statistics.rejected"
          header="Rejected"
          sortable
          headerStyle={headerStyle}
          bodyStyle={cellStyle}
        />
        <Column
          field="statistics.cancelled"
          header="Cancelled"
          sortable
          headerStyle={headerStyle}
          bodyStyle={cellStyle}
        />
      </DataTable>
    </section>
  );
};

export default InterviewerWorkloadTable;