import { useMemo, useState } from "react";
import { DataTable, type DataTablePageEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { InterviewerReport } from "../types/interviewerReporttypes";
import { useSearchParams } from "react-router-dom";

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

type CoverageRow = {
  interviewerName: string;
  candidateName: string;
  role: string;
  round: string;
  date: string;
  result: string;
  feedback: string | null;
  recruiterName: string;
};

const paginatorTemplate =
  "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown";

const currentPageReportTemplate =
  "Showing {first} to {last} of {totalRecords} entries";

const CoverageReportTable: React.FC<Props> = ({ data, loading }) => {
  const PAGE_PARAM = "coveragePage";
  const SIZE_PARAM = "coverageSize";
  const [searchParams, setSearchParams] = useSearchParams();

  const pageFromUrl = Number(searchParams.get(PAGE_PARAM)) || 1;
  const sizeFromUrl = Number(searchParams.get(SIZE_PARAM)) || 10;
  const [rowsPerPage, setRowsPerPage] = useState(sizeFromUrl);
  const [first, setFirst] = useState((pageFromUrl - 1) * sizeFromUrl);

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

  const rows: CoverageRow[] = useMemo(() => {
    if (!Array.isArray(data)) return [];

    return data.flatMap((interviewer) => {
      if (!Array.isArray(interviewer.interviews)) return [];

      return interviewer.interviews.map((interview) => ({
        interviewerName: interviewer.interviewerName,
        candidateName: interview.candidateName,
        role: interview.role,
        round: interview.round,
        date: interview.date,
        result: interview.result,
        feedback: interview.feedback ?? null,
        recruiterName: interview.recruiterName,
      }));
    });
  }, [data]);

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
      aria-label="Interview coverage table"
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
        value={rows}
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

        emptyMessage={loading ? "Loading..." : "No interviews found"}
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
          field="candidateName"
          header="Candidate"
          headerStyle={headerStyle}
          bodyStyle={cellStyle}
        />
        <Column
          field="role"
          header="Role"
          headerStyle={headerStyle}
          bodyStyle={cellStyle}
        />
        <Column
          field="round"
          header="Round"
          headerStyle={headerStyle}
          bodyStyle={cellStyle}
        />
        <Column
          field="date"
          header="Date"
          headerStyle={headerStyle}
          bodyStyle={cellStyle}
        />
        <Column
          field="result"
          header="Result"
          headerStyle={headerStyle}
          bodyStyle={cellStyle}
        />
        <Column
          header="Feedback"
          headerStyle={headerStyle}
          bodyStyle={cellStyle}
          body={(row: CoverageRow) => row.feedback || "-"}
        />
        <Column
          field="recruiterName"
          header="Recruiter"
          headerStyle={headerStyle}
          bodyStyle={cellStyle}
        />
      </DataTable>
    </section>
  );
};

export default CoverageReportTable;
