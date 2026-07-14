import { api } from "@/lib/axios";

export interface HealthStatus {
  status: string;
  database: string;
}

export async function getHealth(): Promise<HealthStatus> {
  const { data } = await api.get<HealthStatus>("/health");
  return data;
}
