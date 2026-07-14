import { api } from "@/lib/axios";
import type { Alert } from "@/types";

export async function getAlerts(skip = 0, limit = 100): Promise<Alert[]> {
  const { data } = await api.get<Alert[]>("/alerts", { params: { skip, limit } });
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
