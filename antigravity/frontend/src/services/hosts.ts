import { api } from "@/lib/axios";
import type { Host } from "@/types";

export async function getHosts(skip = 0, limit = 100): Promise<Host[]> {
  const { data } = await api.get<Host[]>("/hosts", { params: { skip, limit } });
  return data;
}

export async function getHost(id: string): Promise<Host> {
  const { data } = await api.get<Host>(`/hosts/${id}`);
  return data;
}
