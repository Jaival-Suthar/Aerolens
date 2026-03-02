import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DataTable, type DataTablePageEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { InterviewerReport } from "../types/interviewerReporttypes";
import { FilterMatchMode } from "primereact/api";
import { Dropdown } from "primereact/dropdown";
import DateRangeFilter from "./DateRangeFilter";
const formatDate = (dateString: string) => {
  if (!dateString) return "-";

  const date = new Date(dateString);

  const day = date.getDate().toString().padStart(2, "0");

  const month = date.toLocaleString("en-US", {
    month: "short",
  });

  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};
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
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);
  const [filters, setFilters] = useState({
    interviewerName: { value: null, matchMode: FilterMatchMode.EQUALS },
    role: { value: null, matchMode: FilterMatchMode.EQUALS },
    round: { value: null, matchMode: FilterMatchMode.EQUALS },
    result: { value: null, matchMode: FilterMatchMode.EQUALS },
    recruiterName: { value: null, matchMode: FilterMatchMode.EQUALS },
    // date: { value: null, matchMode: FilterMatchMode.CUSTOM }, // 👈 ADD THIS LINE

  });

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

  /* 🔥 Unique dropdown values from backend data */
  const uniqueOptions = useMemo(() => {
    const unique = <T extends keyof CoverageRow>(key: T) =>
      Array.from(new Set(rows.map(r => r[key]).filter(Boolean))).map(v => ({
        label: String(v),
        value: v,
      }));

    const sortRounds = (rounds: { label: string; value: string }[]) =>
      rounds.sort((a, b) => {
        const getNum = (r: string) => {
          const match = r.match(/\d+/);
          return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER;
        };
        return getNum(a.value) - getNum(b.value);
      });

    return {
      interviewerName: unique("interviewerName"),
      round: sortRounds(unique("round")),
      result: unique("result"),
      role: unique("role"),
      recruiterName: unique("recruiterName"),
    };
  }, [rows]);

  const dropdownFilterTemplate = (options: any, list: any[]) => (
    <Dropdown
      value={options.value}
      options={list}
      onChange={(e) => options.filterApplyCallback(e.value)}
      placeholder="Select"
      showClear
      style={{ minWidth: "12rem" }}
    />
  );

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
  const filterCoverageByDate = (
    rows: CoverageRow[],
    dateRange: { start?: string; end?: string } | null
  ) => {
    return rows.filter((row) => {
      if (!dateRange?.start && !dateRange?.end) return true;
      if (!row.date) return false;
  
      const rowDate = new Date(row.date);
      const startDate = dateRange?.start ? new Date(dateRange.start) : null;
      const endDate = dateRange?.end ? new Date(dateRange.end) : null;
  
      if (startDate && rowDate < startDate) return false;
  
      if (endDate) {
        endDate.setHours(23, 59, 59, 999);
        if (rowDate > endDate) return false;
      }
  
      return true;
    });
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
        value={filterCoverageByDate(rows, dateRange)}
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

        filters={filters}
        onFilter={(e) => setFilters(e.filters as typeof filters)}
        filterDisplay="menu"

        emptyMessage={loading ? "Loading..." : "No interviews found"}
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
          showFilterMatchModes={false}
          filterElement={(o) =>
            dropdownFilterTemplate(o, uniqueOptions.interviewerName)
          }
          headerStyle={headerStyle}
          bodyStyle={{ ...cellStyle, fontWeight: 500 }}
        />

        <Column
          field="candidateName"
          header="Candidate"
          sortable
          headerStyle={headerStyle}
          bodyStyle={cellStyle}
        />

        <Column
          field="role"
          header="Role"
          sortable
          filter
          showFilterMatchModes={false}
          filterElement={(o) =>
            dropdownFilterTemplate(o, uniqueOptions.role)
          }
          headerStyle={headerStyle}
          bodyStyle={cellStyle}
        />

        <Column
          field="round"
          header="Round"
          sortable
          filter
          showFilterMatchModes={false}
          filterElement={(o) =>
            dropdownFilterTemplate(o, uniqueOptions.round)
          }
          headerStyle={headerStyle}
          bodyStyle={cellStyle}
        />
<Column
  field="date"
  style={{ minWidth: "280px" }}
  header={
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span>Date</span>

      <DateRangeFilter
        initialStartDate={dateRange?.start}
        initialEndDate={dateRange?.end}
        onApply={(start, end) => {
          setDateRange({ start, end });
          setFirst(0); // reset pagination
        }}
        onClear={() => {
          setDateRange(null);
          setFirst(0); // reset pagination
        }}
      />
    </div>
  }
  body={(row: CoverageRow) => formatDate(row.date)}
  // sortable
/>
  
        <Column
          field="result"
          header="Result"
          sortable
          filter
          showFilterMatchModes={false}
          filterElement={(o) =>
            dropdownFilterTemplate(o, uniqueOptions.result)
          }
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
          sortable
          filter
          showFilterMatchModes={false}
          filterElement={(o) =>
            dropdownFilterTemplate(o, uniqueOptions.recruiterName)
          }
          headerStyle={headerStyle}
          bodyStyle={cellStyle}
        />
      </DataTable>
    </section>
  );
};

export default CoverageReportTable;
