import { useState } from "react";
import { DataTable, type DataTablePageEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { InterviewerReport } from "../types/interviewerReporttypes";

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
  const [first, setFirst] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const onPageChange = (event: DataTablePageEvent) => {
    setFirst(event.first);
    setRowsPerPage(event.rows);
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
        stripedRows
        rowHover
        scrollable
        scrollHeight="flex"
        responsiveLayout="scroll"

        paginator
        first={first}
        rows={rowsPerPage}
        onPage={onPageChange}
        rowsPerPageOptions={[10, 20, 50]}

        emptyMessage={loading ? "Loading..." : "No interviewer data found"}
        paginatorTemplate={paginatorTemplate}
        currentPageReportTemplate={currentPageReportTemplate}

        style={{ border: "none" }}
        tableStyle={{ minWidth: "100%" }}
      >
        <Column
          field="interviewerName"
          header="Interviewer"
          headerStyle={headerStyle}
          bodyStyle={{ ...cellStyle, fontWeight: 500 }}
        />
        <Column
          field="statistics.totalInterviews"
          header="Total"
          headerStyle={headerStyle}
          bodyStyle={cellStyle}
        />
        <Column
          field="statistics.pending"
          header="Pending"
          headerStyle={headerStyle}
          bodyStyle={cellStyle}
        />
        <Column
          field="statistics.selected"
          header="Selected"
          headerStyle={headerStyle}
          bodyStyle={cellStyle}
        />
        <Column
          field="statistics.rejected"
          header="Rejected"
          headerStyle={headerStyle}
          bodyStyle={cellStyle}
        />
        <Column
          field="statistics.cancelled"
          header="Cancelled"
          headerStyle={headerStyle}
          bodyStyle={cellStyle}
        />
      </DataTable>
    </section>
  );
};

export default InterviewerWorkloadTable;