export interface User {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface Host {
  id: string;
  hostname: string;
  agent_id: string;
  ip_address: string | null;
  operating_system: string | null;
  status: string;
  last_seen: string | null;
  created_at: string;
}

export interface Rule {
  id: string;
  rule_id?: number;
  name: string;
  mitre: string | null;
  severity: string;
  description: string | null;
  enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Alert {
  id: string;
  event_id: string;
  host_id: string;
  rule_id: string;
  wazuh_level: number;
  severity: string;
  title: string;
  description: string | null;
  raw_log: unknown;
  status: string;
  created_at: string;
  host?: Host | null;
  rule?: Rule | null;
}

export interface Incident {
  id: string;
  incident_number: string;
  title: string;
  description: string | null;
  rule_id: string;
  host_id: string;
  severity: string;
  priority: string;
  category: string;
  confidence: number;
  status: string;
  occurrence: number;
  risk_score: number | null;
  first_seen: string;
  last_seen: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  host?: Host | null;
  rule?: Rule | null;
}

export interface IncidentHistory {
  id: string;
  incident_id: string;
  action: string;
  old_value: string | null;
  new_value: string | null;
  performed_by: string;
  created_at: string;
}

export interface IncidentAlertLink {
  id: string;
  incident_id: string;
  alert_id: string;
  created_at: string;
  alert?: Alert | null;
}

export interface IncidentStats {
  total_incidents: number;
  open_incidents: number;
  critical_incidents: number;
  resolved_incidents: number;
  severity_counts: Record<string, number>;
  status_counts: Record<string, number>;
  category_counts: Record<string, number>;
  top_affected_hosts: Array<Record<string, unknown>>;
  most_triggered_rules: Array<Record<string, unknown>>;
  total_hosts?: number;
  active_alerts?: number;
  trend_data?: any;
  database_bytes?: number;
  database_size_mb?: number;
  sla_compliance_pct?: number;
}

export interface ResponseAction {
  id: string;
  incident_id: string;
  action: string;
  status: string;
  message: string | null;
  executed_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource: string;
  ip_address: string | null;
  created_at: string;
  user?: User | null;
}

export interface SCACheck {
  id: number;
  title: string;
  target: string;
  result: "passed" | "failed" | "not_applicable";
  rationale: string;
  remediation: string;
  description: string;
}

export interface SCAPolicy {
  name: string;
  passed: number;
  failed: number;
  not_applicable: number;
  score: number;
  end_scan: string;
  total_checks: number;
  checks: SCACheck[];
}

export interface Paginated<T> {
  items: T[];
  skip: number;
  limit: number;
}
