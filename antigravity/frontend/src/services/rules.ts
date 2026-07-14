import { api } from "@/lib/axios";
import type { Rule } from "@/types";

/**
 * NOTE: The backend does not yet expose a /rules endpoint (checked
 * backend/app/api/ — only detection rules exist as DB rows, no router).
 * This service calls the endpoint documented in AEGILON_UI_Specification.md
 * so the page works automatically once the backend adds it. Until then the
 * Rules page shows an "endpoint not available" empty state instead of dummy data.
 */
export async function getRules(skip = 0, limit = 100): Promise<Rule[]> {
  const { data } = await api.get<Rule[]>("/rules", { params: { skip, limit } });
  return data;
}

export async function getRule(id: string): Promise<Rule> {
  const { data } = await api.get<Rule>(`/rules/${id}`);
  return data;
}
