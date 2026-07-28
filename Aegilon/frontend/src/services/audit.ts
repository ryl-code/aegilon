import { api } from "@/lib/axios";
import type { AuditLog } from "@/types";

export async function getAuditLogs(skip = 0, limit = 100): Promise<AuditLog[]> {
  const { data } = await api.get<AuditLog[]>("/audit-logs", { params: { skip, limit } });
  return data;
}
