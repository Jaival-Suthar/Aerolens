import React, { useRef, useState, useEffect, useCallback } from "react";
import { DataTable, type DataTableFilterMeta, type DataTableStateEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { Menu } from "primereact/menu";
import { Toast } from "primereact/toast";
import SearchButton from "../../../shared/SearchButton";
import CogButton from "../../../shared/CogButton";
import { useAuth } from "../../../shared/auth/AuthContext";
import { getOffers } from "../services/offerService";
import type { OfferTableRow } from "../types/offerTypes";
import { FilterMatchMode } from "primereact/api";
import { useSearchParams } from "react-router-dom";

const formatDate = (value: string | null) => {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const formatNumber = (value: number | null | undefined) => {
  if (value == null) return "—";
  return value.toLocaleString();
};

const OfferTable: React.FC = () => {
  const toastRef = useRef<Toast>(null);
  const { accessToken } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [offers, setOffers] = useState<OfferTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<OfferTableRow | null>(null);
  const actionsMenuRef = useRef<Menu>(null);

  const [rows, setRows] = useState(() => Number(searchParams.get("rows")) || 20);
  const [first, setFirst] = useState(() => Number(searchParams.get("first")) || 0);

  const [filters, setFilters] = useState<DataTableFilterMeta>({
    global: { value: searchParams.get("q") || null, matchMode: FilterMatchMode.CONTAINS },
    candidateName: { value: null, matchMode: FilterMatchMode.CONTAINS },
    employmentTypeName: { value: null, matchMode: FilterMatchMode.CONTAINS },
    workModeName: { value: null, matchMode: FilterMatchMode.CONTAINS },
    offerStatus: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const loadOffers = useCallback(async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      const data = await getOffers(accessToken);
      setOffers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load offers:", e);
      const message = e && typeof e === "object" && "message" in e ? String((e as { message: unknown }).message) : "Failed to load offers";
      toastRef.current?.show({ severity: "error", summary: "Error", detail: message, life: 5000 });
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  // Sync pagination from URL when searchParams change (e.g. browser back/forward)
  useEffect(() => {
    const urlFirst = Number(searchParams.get("first")) || 0;
    const urlRows = Number(searchParams.get("rows")) || 20;
    setFirst(urlFirst);
    setRows(urlRows);
  }, [searchParams]);

  // Clamp first when data length is less than current page start (avoid empty page)
  useEffect(() => {
    if (offers.length > 0 && first >= offers.length) {
      setFirst(0);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("first", "0");
        return next;
      });
    }
  }, [offers.length, first, setSearchParams]);

  const onPageChange = (event: DataTableStateEvent) => {
    setFirst(event.first ?? 0);
    setRows(event.rows ?? 20);
    setSearchParams({
      ...Object.fromEntries(searchParams.entries()),
      first: String(event.first ?? 0),
      rows: String(event.rows ?? 20),
    });
  };

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters((prev) => ({
      ...prev,
      global: { value, matchMode: FilterMatchMode.CONTAINS },
    }));
    setSearchParams({
      ...Object.fromEntries(searchParams.entries()),
      q: value,
      first: "0",
      rows: rows.toString(),
    });
    setFirst(0);
  };

  const handleTerminateOffer = () => {
    if (!selectedOffer) {
      toastRef.current?.show({ severity: "warn", summary: "No Selection", detail: "Please select an offer first.", life: 3000 });
      return;
    }
    toastRef.current?.show({ severity: "info", summary: "Terminate Offer", detail: "Coming soon.", life: 3000 });
  };

  const handleDeleteOffer = () => {
    if (!selectedOffer) {
      toastRef.current?.show({ severity: "warn", summary: "No Selection", detail: "Please select an offer first.", life: 3000 });
      return;
    }
    toastRef.current?.show({ severity: "info", summary: "Delete Offer", detail: "Coming soon.", life: 3000 });
  };

  const handleReviseOffer = () => {
    if (!selectedOffer) {
      toastRef.current?.show({ severity: "warn", summary: "No Selection", detail: "Please select an offer first.", life: 3000 });
      return;
    }
    toastRef.current?.show({ severity: "info", summary: "Revise Offer", detail: "Coming soon.", life: 3000 });
  };

  const handleOfferStatus = () => {
    if (!selectedOffer) {
      toastRef.current?.show({ severity: "warn", summary: "No Selection", detail: "Please select an offer first.", life: 3000 });
      return;
    }
    toastRef.current?.show({ severity: "info", summary: "Offer Status", detail: "Coming soon.", life: 3000 });
  };

  const actionMenuModel = [
    { label: "Terminate Offer", command: handleTerminateOffer },
    { label: "Delete Offer", command: handleDeleteOffer },
    { label: "Revise Offer", command: handleReviseOffer },
    { label: "Offer Status", command: handleOfferStatus },
  ];

  const globalFilterValue = (filters.global as { value?: string })?.value ?? "";

  return (
    <>
      <Toast ref={toastRef} position="top-right" />
      <div className="p-2" style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
        <div className="flex justify-content-between align-items-center mb-2">
          <h2 style={{ color: "#07253f" }}>Onboarding</h2>
          <div className="flex gap-2">
            <SearchButton
              value={globalFilterValue}
              onChange={onGlobalFilterChange}
              placeholder="Search offers..."
            />
            <div>
              <Menu model={actionMenuModel} popup ref={actionsMenuRef} />
              <CogButton
                onClick={(e) => actionsMenuRef.current?.toggle(e)}
                disabled={!selectedOffer}
                tooltip="Offer actions (select a row first)"
              />
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflow: "auto" }}>
          <DataTable
            value={offers}
            dataKey="offerId"
            selectionMode="single"
            selection={selectedOffer}
            onSelectionChange={(e) => setSelectedOffer((e.value as OfferTableRow) ?? null)}
            filters={filters}
            filterDisplay="menu"
            onFilter={(e) => setFilters(e.filters)}
            globalFilterFields={["candidateName", "employmentTypeName", "workModeName", "offerStatus"]}
            scrollable
            scrollHeight="flex"
            tableStyle={{ minWidth: "80rem" }}
            loading={loading}
            emptyMessage="No offers yet. Create one from Resume → Initiate Onboarding."
            paginator
            rows={rows}
            first={first}
            onPage={onPageChange}
            rowsPerPageOptions={[20, 50, 100]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Offers"
          >
            <Column selectionMode="single" headerStyle={{ width: "3rem" }} />
            <Column field="createdAt" header="Created Date" body={(r: OfferTableRow) => formatDate(r.createdAt)} sortable />
            <Column field="candidateName" header="Candidate Name" sortable filter />
            <Column field="employmentTypeName" header="Employment Type" sortable filter />
            <Column field="workModeName" header="Mode of Working" sortable filter />
            <Column field="joiningDate" header="Joining Date" body={(r: OfferTableRow) => formatDate(r.joiningDate)} sortable />
            <Column field="offeredCTCAmount" header="Offered CTC" body={(r: OfferTableRow) => formatNumber(r.offeredCTCAmount)} sortable />
            <Column field="offerVersion" header="Offer Version" sortable />
            <Column field="offerStatus" header="Offer Status" sortable filter />
            <Column field="variablePay" header="Variable Pay" body={(r: OfferTableRow) => formatNumber(r.variablePay)} sortable />
            <Column field="joiningBonus" header="Joining Bonus" body={(r: OfferTableRow) => formatNumber(r.joiningBonus)} sortable />
          </DataTable>
        </div>
      </div>
    </>
  );
};

export default OfferTable;
