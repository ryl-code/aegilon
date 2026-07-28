import { api } from "@/lib/axios";
import type { Incident, IncidentHistory, IncidentAlertLink, IncidentStats } from "@/types";

export interface IncidentFilters {
  skip?: number;
  limit?: number;
  severity?: string;
  priority?: string;
  status?: string;
  category?: string;
  host_name?: string;
  rule_name?: string;
  incident_number?: string;
}

export async function getIncidents(filters: IncidentFilters = {}): Promise<Incident[]> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== "")
  );
  const { data } = await api.get<Incident[]>("/incidents", { params });
  return data;
}

export async function getIncident(id: string): Promise<Incident> {
  const { data } = await api.get<Incident>(`/incidents/${id}`);
  return data;
}

export async function getIncidentHistory(id: string): Promise<IncidentHistory[]> {
  const { data } = await api.get<IncidentHistory[]>(`/incidents/${id}/history`);
  return data;
}

export async function getIncidentAlerts(id: string): Promise<IncidentAlertLink[]> {
  const { data } = await api.get<IncidentAlertLink[]>(`/incidents/${id}/alerts`);
  return data;
}

export async function getIncidentStats(): Promise<IncidentStats> {
  const { data } = await api.get<IncidentStats>("/incidents/stats");
  return data;
}

export async function updateIncident(
  id: string,
  payload: Partial<{ priority: string; status: string; assigned_to: string; description: string }>
): Promise<Incident> {
  const { data } = await api.patch<Incident>(`/incidents/${id}`, payload);
  return data;
}

export async function updateIncidentStatus(id: string, status: string): Promise<Incident> {
  const { data } = await api.patch<Incident>(`/incidents/${id}/status`, { status });
  return data;
}
