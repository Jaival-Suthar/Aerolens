import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DataTable, type DataTablePageEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { FilterMatchMode } from "primereact/api";
import { Calendar } from "primereact/calendar";
import { InterviewTrackerItem } from "../types/interviewTrackertypes";
import DateRangeFilter from "./DateRangeFilter";
/* -------------------- Theme -------------------- */
const theme = {
  primary: "#072844",
  accent: "#55c62c",
  border: "#e5e7eb",
  headerBg: "#f8fafc",
  textMuted: "#475569",
};

/* -------------------- Types -------------------- */
interface InterviewTrackerColumn {
  field: string;
  header: string;
}

interface Props {
  data: InterviewTrackerItem[];
  loading: boolean;
  visibleColumns: InterviewTrackerColumn[];
}

/* -------------------- Constants -------------------- */
const NON_SORTABLE_FIELDS = new Set([
  "contactInfo",
  "location",
  "interviewerFeedback",
]);

const paginatorTemplate =
  "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown";

const currentPageReportTemplate =
  "Showing {first} to {last} of {totalRecords} entries";

/* -------------------- Utils -------------------- */
const formatDateTimeFromUTC = (utcIso: string) => {
  if (!utcIso) return { date: "-", time: "-" };

  const d = new Date(utcIso);

  return {
    date: d.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

const parseLocation = (
  location: InterviewTrackerItem["expectedJoiningLocation"]
) => {
  if (!location) return null;

  if (typeof location === "string") {
    try {
      return JSON.parse(location);
    } catch {
      return null;
    }
  }

  return location;
};

/* -------------------- Component -------------------- */
const InterviewTrackerTable: React.FC<Props> = ({
  data,
  loading,
  visibleColumns,
}) => {
  const PAGE_PARAM = "trackerPage";
  const SIZE_PARAM = "trackerSize";

  const [searchParams, setSearchParams] = useSearchParams();

  const pageFromUrl = Number(searchParams.get(PAGE_PARAM)) || 1;
  const sizeFromUrl = Number(searchParams.get(SIZE_PARAM)) || 10;

  const [rowsPerPage, setRowsPerPage] = useState(sizeFromUrl);
  const [first, setFirst] = useState((pageFromUrl - 1) * sizeFromUrl);
  const [dateRange, setDateRange] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});
  /* -------------------- Pagination -------------------- */
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

  /* -------------------- Filters -------------------- */
  const [filters, setFilters] = useState({
    interviewerName: { value: null, matchMode: FilterMatchMode.EQUALS },
    recruiterName: { value: null, matchMode: FilterMatchMode.EQUALS },
    jobRole: { value: null, matchMode: FilterMatchMode.EQUALS },

    interviewDateObj: {
      value: null,
      matchMode: FilterMatchMode.DATE_IS,
    },
  });

  const uniqueOptions = useMemo(() => {
  const build = (key: keyof InterviewTrackerItem) => {
    const map = new Map();

    data.forEach(item => {
      const value = item[key];
      if (value && !map.has(value)) {
        map.set(value, {
          label: String(value),
          value
        });
      }
    });

    return Array.from(map.values());
  };

  return {
    interviewerName: build("interviewerName"),
    recruiterName: build("recruiterName"),
    jobRole: build("jobRole"),
  };
}, [data]);

 const transformedData = useMemo(() => {
  let result = data.map(item => ({
    ...item,
    interviewDateObj: item.interviewFromTime
      ? new Date(item.interviewFromTime)
      : null,
  }));

  if (dateRange.startDate && dateRange.endDate) {
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);

    start.setHours(0,0,0,0);
    end.setHours(23,59,59,999);

    result = result.filter(item => {
      if (!item.interviewDateObj) return false;
      return (
        item.interviewDateObj >= start &&
        item.interviewDateObj <= end
      );
    });
  }

  return result;
}, [data, dateRange]);

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

  /* -------------------- Column Body Templates -------------------- */
  const contactInfoBody = (row: InterviewTrackerItem) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span>{row.candidatePhone || "-"}</span>
      <span style={{ fontSize: 12, color: "#64748b" }}>
        {row.candidateEmail || ""}
      </span>
    </div>
  );

  const locationBody = (row: InterviewTrackerItem) => {
    const location = parseLocation(row.expectedJoiningLocation);
    return location ? `${location.city}, ${location.country}` : "-";
  };

  const headerStyle: React.CSSProperties = {
    background: theme.headerBg,
    color: theme.primary,
    fontWeight: 600,
    fontSize: 14,
    borderBottom: `1px solid ${theme.border}`,
  };

  const cellStyle: React.CSSProperties = {
    borderBottom: `1px solid ${theme.border}`,
    color: theme.textMuted,
    fontSize: 14,
  };

  /* -------------------- Render -------------------- */
  return (
    <section
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
        value={transformedData}
        loading={loading}
        stripedRows
        rowHover
        scrollable
        scrollHeight="flex"
        paginator
        first={first}
        rows={rowsPerPage}
        onPage={onPageChange}
        rowsPerPageOptions={[10, 20, 50]}
        emptyMessage={loading ? "Loading..." : "No interview data found"}
        paginatorTemplate={paginatorTemplate}
        currentPageReportTemplate={currentPageReportTemplate}
        filters={filters}
        onFilter={(e) => setFilters(e.filters as typeof filters)}
        filterDisplay="menu"
      >
        {visibleColumns.map(col => {
          let body;
          let sortField;

          switch (col.field) {
            case "date":
              return (
                <Column
                  key="date"
                  field="interviewDateObj"
                  header={
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span>{col.header}</span>

                      <DateRangeFilter
                        initialStartDate={dateRange.startDate}
                        initialEndDate={dateRange.endDate}
                        onApply={(startDate, endDate) => {
                          setDateRange({ startDate, endDate });
                        }}
                        onClear={() => {
                          setDateRange({});
                        }}
                      />
                    </div>
                  }
                  body={(row: InterviewTrackerItem) =>
                    formatDateTimeFromUTC(row.interviewFromTime).date
                  }
                  headerStyle={headerStyle}
                  bodyStyle={cellStyle}
                />
              );

            case "time":
              body = (row: InterviewTrackerItem) =>
                formatDateTimeFromUTC(row.interviewFromTime).time;
              sortField = "interviewFromTime";
              break;

            case "location":
              body = locationBody;
              break;

            case "contactInfo":
              body = contactInfoBody;
              break;

            case "interviewerName":
              return (
                <Column
                  key={col.field}
                  field="interviewerName"
                  header={col.header}
                  sortable
                  filter
                  showFilterMatchModes={false}
                  filterElement={(o) =>
                    dropdownFilterTemplate(o, uniqueOptions.interviewerName)
                  }
                  headerStyle={headerStyle}
                  bodyStyle={cellStyle}
                />
              );

            case "recruiterName":
              return (
                <Column
                  key={col.field}
                  field="recruiterName"
                  header={col.header}
                  sortable
                  filter
                  showFilterMatchModes={false}
                  filterElement={(o) =>
                    dropdownFilterTemplate(o, uniqueOptions.recruiterName)
                  }
                  headerStyle={headerStyle}
                  bodyStyle={cellStyle}
                />
              );

              case "jobRole":
                return (
                  <Column
                    key={col.field}
                    field="jobRole"
                    header={col.header}
                    sortable
                    filter
                    showFilterMatchModes={false}
                    filterElement={(o) =>
                      dropdownFilterTemplate(o, uniqueOptions.jobRole)
                    }
                    headerStyle={headerStyle}
                    bodyStyle={cellStyle}
                  />
                );
          }

          return (
            <Column
              key={col.field}
              field={col.field}
              header={col.header}
              body={body}
              sortField={sortField}
              sortable={!NON_SORTABLE_FIELDS.has(col.field)}
              headerStyle={headerStyle}
              bodyStyle={cellStyle}
            />
          );
        })}
      </DataTable>
    </section>
  );
};

export default InterviewTrackerTable;