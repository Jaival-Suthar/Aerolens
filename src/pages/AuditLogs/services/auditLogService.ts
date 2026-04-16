import type { AuditLogsListResponse, AuditLogsQuery } from "../types/auditLogTypes";

const API_BASE_URL: string = import.meta.env.VITE_BASE_URL;

const buildQueryString = (query: AuditLogsQuery): string => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.set(key, String(value));
  });
  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

export const AuditLogService = {
  async getAuditLogs(token: string, query: AuditLogsQuery): Promise<AuditLogsListResponse> {
    const response = await fetch(`${API_BASE_URL}/audit-logs${buildQueryString(query)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    const body = await response.json();
    if (!response.ok) {
      throw new Error(body?.message || "Failed to fetch audit logs");
    }
    return body as AuditLogsListResponse;
  },
};
