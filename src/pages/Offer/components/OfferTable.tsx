import React, { useRef, useState, useEffect, useCallback } from "react";
import { DataTable, type DataTableFilterMeta, type DataTableStateEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { Menu } from "primereact/menu";
import { Toast } from "primereact/toast";
import { FaBan, FaEdit, FaClipboardList } from "react-icons/fa";
import SearchButton from "../../../shared/SearchButton";
import DeleteButton from "../../../shared/DeleteButton";
import CogButton from "../../../shared/CogButton";
import { useAuth } from "../../../shared/auth/AuthContext";
import { getOffers, getOfferFormData } from "../services/offerService";
import type { OfferTableRow, OfferFormDataResponse } from "../types/offerTypes";
import OfferDelete from "./OfferDelete";
import TerminateOfferDialog from "./TerminateOfferDialog";
import ReviseOfferDialog from "./ReviseOfferDialog";
import OfferStatusDialog from "./OfferStatusDialog";
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

/** Format: symbol + amount / compensation short (e.g. "$40/hr", "₹40/yr"). Compensation types: Annual, Monthly, Hourly. */
const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "€",
  USD: "$",
  INR: "₹",
  GBP: "£",
  AED: "د.إ",
};
const COMPENSATION_SHORT: Record<string, string> = {
  Annual: "yr",
  Monthly: "mo",
  Hourly: "hr",
  Yearly: "yr",
};
function toNum(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

function formatOfferedCTC(r: OfferTableRow, formData: OfferFormDataResponse | null): string {
  if (r.offeredCTCAmount == null) return "—";
  const row = r as unknown as Record<string, unknown>;
  // Prefer display-friendly values from GET /offers (backend sends currencyName, compensationTypeName)
  let currencyName = (row.currencyName as string)?.trim() || "";
  let typeName = (row.compensationTypeName as string)?.trim() || "";
  if (!currencyName || !typeName) {
    const currencyId =
      toNum(row.currencyLookupId) ??
      toNum(row.currencyId) ??
      toNum(row.offeredCTCCurrencyLookupId) ??
      toNum(row.offeredCTCCurrencyId) ??
      toNum(row.currency_lookup_id) ??
      toNum(row.expectedCTCCurrencyId);
    const compensationTypeId =
      toNum(row.compensationTypeLookupId) ??
      toNum(row.compensationTypeId) ??
      toNum(row.offeredCompensationTypeLookupId) ??
      toNum(row.offeredCTCTypeId) ??
      toNum(row.compensation_type_lookup_id) ??
      toNum(row.expectedCTCTypeId);
    if (!currencyName && currencyId != null)
      currencyName = formData?.currencies?.find((c) => c.currencyId === currencyId || Number(c.currencyId) === Number(currencyId))?.currencyName ?? "";
    if (!typeName && compensationTypeId != null)
      typeName = formData?.compensationTypes?.find(
        (t) => t.compensationTypeId === compensationTypeId || Number(t.compensationTypeId) === Number(compensationTypeId)
      )?.compensationTypeName ?? "";
  }
  const symbol = (currencyName && (CURRENCY_SYMBOLS[currencyName] || currencyName)) || "";
  const shortType = (typeName && (COMPENSATION_SHORT[typeName] || typeName)) || typeName || "";
  // Column: symbol + amount / short type only (no currency name in words)
  if (symbol && shortType) return `${symbol}${r.offeredCTCAmount}/${shortType}`;
  if (symbol) return `${symbol}${r.offeredCTCAmount}`;
  if (shortType) return `${r.offeredCTCAmount}/${shortType}`;
  return formatNumber(r.offeredCTCAmount);
}

const OfferTable: React.FC = () => {
  const toastRef = useRef<Toast>(null);
  const { accessToken } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [offers, setOffers] = useState<OfferTableRow[]>([]);
  const [offerFormData, setOfferFormData] = useState<OfferFormDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<OfferTableRow | null>(null);
  const actionsMenuRef = useRef<Menu>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showTerminateDialog, setShowTerminateDialog] = useState(false);
  const [showReviseDialog, setShowReviseDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  const [rows, setRows] = useState(() => Number(searchParams.get("rows")) || 20);
  const [first, setFirst] = useState(() => Number(searchParams.get("first")) || 0);

  const [filters, setFilters] = useState<DataTableFilterMeta>({
    global: { value: searchParams.get("q") || null, matchMode: FilterMatchMode.CONTAINS },
    candidateName: { value: null, matchMode: FilterMatchMode.CONTAINS },
    employmentTypeName: { value: null, matchMode: FilterMatchMode.CONTAINS },
    workModeName: { value: null, matchMode: FilterMatchMode.CONTAINS },
    vendorName: { value: null, matchMode: FilterMatchMode.CONTAINS },
    offerStatus: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const loadOffers = useCallback(async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      const [offersData, formData] = await Promise.all([
        getOffers(accessToken),
        getOfferFormData(accessToken).catch(() => null),
      ]);
      setOffers(Array.isArray(offersData) ? offersData : []);
      setOfferFormData((prev) => formData ?? prev);
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
    if (selectedOffer) setShowTerminateDialog(true);
    else toastRef.current?.show({ severity: "warn", summary: "No Selection", detail: "Please select an offer first.", life: 3000 });
  };

  const handleDeleteOffer = () => {
    if (selectedOffer) setShowDeleteDialog(true);
    else toastRef.current?.show({ severity: "warn", summary: "No Selection", detail: "Please select an offer first.", life: 3000 });
  };

  const handleReviseOffer = () => {
    if (selectedOffer) setShowReviseDialog(true);
    else toastRef.current?.show({ severity: "warn", summary: "No Selection", detail: "Please select an offer first.", life: 3000 });
  };

  const handleOfferStatus = () => {
    if (selectedOffer) setShowStatusDialog(true);
    else toastRef.current?.show({ severity: "warn", summary: "No Selection", detail: "Please select an offer first.", life: 3000 });
  };

  const handleActionSuccess = () => {
    loadOffers();
  };

  const actionMenuModel = [
    { label: "Terminate Offer", icon: <FaBan style={{ marginRight: 8 }} />, command: handleTerminateOffer },
    { label: "Revise Offer", icon: <FaEdit style={{ marginRight: 8 }} />, command: handleReviseOffer },
    { label: "Offer Status", icon: <FaClipboardList style={{ marginRight: 8 }} />, command: handleOfferStatus },
  ];

  const globalFilterValue = (filters.global as { value?: string })?.value ?? "";

  const offeredCTCBody = useCallback(
    (r: OfferTableRow) => formatOfferedCTC(r, offerFormData),
    [offerFormData]
  );

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
            <DeleteButton onClick={handleDeleteOffer} disabled={!selectedOffer} tooltip="Delete offer" />
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
            globalFilterFields={[
              "candidateName",
              "employmentTypeName",
              "workModeName",
              "vendorName",
              "offerStatus",
              "offerId",
              "offeredCTCAmount",
              "offerVersion",
              "variablePay",
              "joiningBonus",
            ]}
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
            <Column field="vendorName" header="Vendor" sortable filter />
            <Column field="joiningDate" header="Joining Date" body={(r: OfferTableRow) => formatDate(r.joiningDate)} sortable />
            <Column field="offeredCTCAmount" header="Offered CTC" body={offeredCTCBody} sortable />
            <Column field="offerVersion" header="Offer Version" sortable />
            <Column field="offerStatus" header="Offer Status" sortable filter />
            <Column field="variablePay" header="Variable Pay" body={(r: OfferTableRow) => formatNumber(r.variablePay)} sortable />
            <Column field="joiningBonus" header="Joining Bonus" body={(r: OfferTableRow) => formatNumber(r.joiningBonus)} sortable />
          </DataTable>
        </div>
      </div>

      <OfferDelete
        visible={showDeleteDialog}
        onHide={() => setShowDeleteDialog(false)}
        selectedOffer={selectedOffer}
        onSuccess={handleActionSuccess}
        onClearSelection={() => setSelectedOffer(null)}
      />
      <TerminateOfferDialog
        visible={showTerminateDialog}
        onHide={() => setShowTerminateDialog(false)}
        selectedOffer={selectedOffer}
        onSuccess={handleActionSuccess}
      />
      <ReviseOfferDialog
        visible={showReviseDialog}
        onHide={() => setShowReviseDialog(false)}
        selectedOffer={selectedOffer}
        onSuccess={handleActionSuccess}
      />
      <OfferStatusDialog
        visible={showStatusDialog}
        onHide={() => setShowStatusDialog(false)}
        selectedOffer={selectedOffer}
        onSuccess={handleActionSuccess}
      />
    </>
  );
};

export default OfferTable;
