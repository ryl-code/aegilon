import { api } from "@/lib/axios";
import type { Alert } from "@/types";

export async function getAlerts(
  skip = 0,
  limit = 100,
  severity?: string,
  minutes?: number
): Promise<Alert[]> {
  const params: Record<string, any> = { skip, limit };
  if (severity && severity !== "ALL") params.severity = severity;
  if (minutes && minutes > 0) params.minutes = minutes;

  const { data } = await api.get<Alert[]>("/alerts", { params });
  return data;
}

export async function getUnprocessedAlerts(skip = 0, limit = 100): Promise<Alert[]> {
  const { data } = await api.get<Alert[]>("/alerts/unprocessed", { params: { skip, limit } });
  return data;
}

export async function getAlert(id: string): Promise<Alert> {
  const { data } = await api.get<Alert>(`/alerts/${id}`);
  return data;
}
