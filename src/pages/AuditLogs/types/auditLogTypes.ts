export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "BULK_CANDIDATE_UPLOAD"
  | "BULK_UPDATE";

export interface AuditActor {
  memberId: number | null;
  name: string | null;
  email: string | null;
}

export interface AuditRequestSnapshot {
  method: string | null;
  path: string | null;
}

export interface AuditClientSnapshot {
  ipAddress: string | null;
  userAgent: string | null;
}

export interface FieldChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface AuditLogItem {
  id: string;
  occurredAt: string;
  action: AuditAction | string;
  verb: string | null;
  summary: string | null;
  resourceType: string | null;
  resourceId: string | null;
  actor: AuditActor;
  request: AuditRequestSnapshot;
  client: AuditClientSnapshot;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  reason: unknown;
  fieldChanges?: FieldChange[];
}

export interface AuditLogsMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AuditLogsListResponse {
  success: boolean;
  message: string;
  data: {
    items: AuditLogItem[];
    meta: AuditLogsMeta;
  };
}

export interface AuditLogsQuery {
  page?: number;
  pageSize?: number;
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
  resourceType?: string;
  resourceId?: string;
  action?: string;
  verb?: string;
  search?: string;
  includeDiff?: boolean;
}
