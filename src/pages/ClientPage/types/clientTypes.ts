// src/types/client.ts
import type { DataTableValue } from "primereact/datatable";
import { DataTable } from "primereact/datatable";
// Core client shape - extends DataTableValue for PrimeReact compatibility
export type ClientType = DataTableValue & {
  clientId: number;
  clientName: string;
  address: string;
};
export type ClientAddType = Omit<ClientType, "clientId">;


// Props for Add/Edit dialog
export type ClientAddEditProps = {
  visible: boolean;
  onHide: () => void;
  onSave: (client: ClientAddType | ClientType) => void;
  mode?: "add" | "edit";
  client?: ClientAddType | ClientType | null;
  loading?: boolean;
};



// Props for Delete dialog
export type ClientDeleteProps = {
  visible: boolean;
  onHide: () => void;
  onDelete: (client?: ClientType | null) => void | Promise<void>;
  client?: ClientType | null;
  loading?: boolean;
};

// Props for Table
export type ClientTableProps = {
   dtRef?: React.RefObject<React.ElementRef<typeof DataTable>>;
  onEdit: (client: ClientType) => void;
  refreshTrigger?: number;
  selectedClient: ClientType | null;
  onSelectionChange: (client: ClientType | null) => void;
  loading?: boolean;
  preSelectClientId?: number;
  filters?: any;
  globalFilterValue?: string;
};

export type ClientsApiResponse = {
  data: ClientType[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    limit: number;
  } | null;
};

export type Pagination = {
  currentPage: number;
  limit: number;
  totalPages: number;
  totalRecords: number;
};

export type ApiResponseWithPagination<T = unknown> = {
  data: T[];
  pagination?: Partial<Pagination>;
};