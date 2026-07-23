import { api } from "@/lib/axios";
import type { ResponseAction } from "@/types";

export async function getResponses(skip = 0, limit = 100): Promise<ResponseAction[]> {
  const { data } = await api.get<ResponseAction[]>("/responses", { params: { skip, limit } });
  return data;
}

export async function getResponse(id: string): Promise<ResponseAction> {
  const { data } = await api.get<ResponseAction>(`/responses/${id}`);
  return data;
}

export async function createResponse(payload: {
  incident_id: string;
  action: string;
  status?: string;
  message?: string;
}): Promise<ResponseAction> {
  const { data } = await api.post<ResponseAction>("/responses", payload);
  return data;
}
