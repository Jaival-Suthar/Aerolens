import React, { useEffect, useMemo, useState } from "react";
import { DataTable, type DataTableFilterMeta } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { FilterMatchMode } from "primereact/api";
import { useAuth } from "../../shared/auth/AuthContext";
import SearchButton from "../../shared/SearchButton";
import { AuditLogService } from "./services/auditLogService";
import type { AuditAction, AuditLogItem } from "./types/auditLogTypes";
import DetailsSection from "../../shared/DetailsSection";

const actionOptions: { label: string; value: AuditAction }[] = [
  { label: "CREATE", value: "CREATE" },
  { label: "UPDATE", value: "UPDATE" },
  { label: "DELETE", value: "DELETE" },
  { label: "BULK_CANDIDATE_UPLOAD", value: "BULK_CANDIDATE_UPLOAD" },
  { label: "BULK_UPDATE", value: "BULK_UPDATE" },
];

const AuditLogsPage: React.FC = () => {
  const { accessToken } = useAuth();
  const [items, setItems] = useState<AuditLogItem[]>([]);
  const [expandedRows, setExpandedRows] = useState<AuditLogItem[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(25);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [action, setAction] = useState<AuditAction | null>(null);
  const [filters, setFilters] = useState<DataTableFilterMeta>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    occurredAt: { value: null, matchMode: FilterMatchMode.CONTAINS },
    action: { value: null, matchMode: FilterMatchMode.EQUALS },
    verb: { value: null, matchMode: FilterMatchMode.CONTAINS },
    summary: { value: null, matchMode: FilterMatchMode.CONTAINS },
    resourceType: { value: null, matchMode: FilterMatchMode.CONTAINS },
    resourceId: { value: null, matchMode: FilterMatchMode.CONTAINS },
    "actor.name": { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const fetchLogs = async () => {
    if (!accessToken) return;
    try {
      const response = await AuditLogService.getAuditLogs(accessToken, {
        page,
        pageSize: rows,
        action: action || undefined,
        search: search || undefined,
        includeDiff: true,
      });
      setItems(response.data.items || []);
      setTotalRecords(response.data.meta?.total || 0);
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
      setItems([]);
      setTotalRecords(0);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [accessToken, page, rows, action, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const occurredAtBody = (row: AuditLogItem) =>
    row.occurredAt ? new Date(row.occurredAt).toLocaleString() : "-";

  const actorBody = (row: AuditLogItem) =>
    row.actor?.name || row.actor?.email || (row.actor?.memberId != null ? String(row.actor.memberId) : "-");

  const actionHeader = useMemo(
    () => (
      <Dropdown
        value={action}
        options={actionOptions}
        onChange={(e) => {
          setPage(1);
          setAction(e.value || null);
        }}
        placeholder="Action"
        showClear
        className="w-full"
      />
    ),
    [action]
  );

  const formatJson = (v: unknown) => {
    if (v == null) return "-";
    try {
      return JSON.stringify(v, null, 2);
    } catch {
      return String(v);
    }
  };

  const rowExpansionTemplate = (row: AuditLogItem) => {
    const actionUpper = String(row.action ?? "").toUpperCase();
    const showDiff =
      actionUpper === "UPDATE" &&
      Array.isArray(row.fieldChanges) &&
      row.fieldChanges.length > 0;

    return (
      <div style={{ padding: "1rem" }}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 320px", minWidth: 320 }}>
            <DetailsSection title="Field changes">
              {showDiff ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {row.fieldChanges!.map((c, idx) => (
                    <div key={`${c.field}-${idx}`} style={{ fontSize: "0.95rem" }}>
                      <div style={{ fontWeight: 700, color: "#072844" }}>
                        {c.field}
                      </div>
                      <pre
                        style={{
                          margin: 0,
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                          background: "#ffffff",
                          border: "1px solid #e5e7eb",
                          padding: "0.5rem",
                          borderRadius: 10,
                          maxHeight: 240,
                          overflow: "auto",
                        }}
                      >
                        {`${formatJson(c.oldValue)}  ->  ${formatJson(c.newValue)}`}
                      </pre>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: "#6b7280" }}>
                  {actionUpper === "UPDATE" ? "No diff available." : "Diff only for UPDATE actions."}
                </div>
              )}
            </DetailsSection>
          </div>

          <div style={{ flex: "1 1 320px", minWidth: 320 }}>
            <DetailsSection title="Old values">
              <pre
                style={{
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  padding: "0.5rem",
                  borderRadius: 10,
                  maxHeight: 320,
                  overflow: "auto",
                }}
              >
                {formatJson(row.oldValues)}
              </pre>
            </DetailsSection>
          </div>

          <div style={{ flex: "1 1 320px", minWidth: 320 }}>
            <DetailsSection title="New values">
              <pre
                style={{
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  padding: "0.5rem",
                  borderRadius: 10,
                  maxHeight: 320,
                  overflow: "auto",
                }}
              >
                {formatJson(row.newValues)}
              </pre>
            </DetailsSection>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="dashboard-container shadow-3 p-2"
      style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", width: "100%", minHeight: 0 }}
    >
      <div className="flex justify-content-between align-items-center mb-2 w-full">
        <h2 style={{ color: "#07253f" }}>Audit Logs</h2>
        <div className="flex align-items-center gap-2">
          <SearchButton
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
            }}
            placeholder="Search summary / values..."
          />
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        <DataTable
          value={items}
          dataKey="id"
          expandedRows={expandedRows}
          onRowToggle={(e: any) => setExpandedRows(e.data)}
          rowExpansionTemplate={rowExpansionTemplate}
          paginator
          lazy
          first={(page - 1) * rows}
          rows={rows}
          totalRecords={totalRecords}
          onPage={(e) => {
            setPage((e.page ?? 0) + 1);
            setRows(e.rows);
          }}
          rowsPerPageOptions={[25, 50, 100]}
          scrollable
          scrollHeight="flex"
          tableStyle={{ minWidth: "100rem" }}
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} logs"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          sortField="occurredAt"
          sortOrder={-1}
          filters={filters}
          filterDisplay="menu"
          onFilter={(e) => setFilters(e.filters)}
          globalFilterFields={["action", "verb", "summary", "resourceType", "resourceId", "actor.name"]}
        >
          <Column expander style={{ width: "3rem" }} />
          <Column field="occurredAt" header="Occurred At" body={occurredAtBody} style={{ minWidth: "12rem" }} sortable filter filterPlaceholder="Search timestamp" />
          <Column field="action" header={actionHeader} style={{ minWidth: "10rem" }} sortable filter filterPlaceholder="Select action" />
          <Column field="verb" header="Verb" style={{ minWidth: "14rem" }} sortable filter filterPlaceholder="Search verb" />
          <Column field="summary" header="Summary" style={{ minWidth: "18rem" }} sortable filter filterPlaceholder="Search summary" />
          <Column field="resourceType" header="Resource Type" style={{ minWidth: "10rem" }} sortable filter filterPlaceholder="Search type" />
          <Column field="resourceId" header="Resource ID" style={{ minWidth: "10rem" }} sortable filter filterPlaceholder="Search resource id" />
          <Column field="actor.name" header="Actor" body={actorBody} style={{ minWidth: "12rem" }} sortable filter filterPlaceholder="Search actor" />
        </DataTable>
      </div>
    </div>
  );
};

export default AuditLogsPage;
