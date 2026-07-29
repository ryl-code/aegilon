-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.users (
  id uuid NOT NULL,
  name character varying NOT NULL,
  email character varying NOT NULL,
  password_hash character varying NOT NULL,
  is_active boolean NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.hosts (
  id uuid NOT NULL,
  hostname character varying NOT NULL,
  agent_id character varying NOT NULL UNIQUE,
  ip_address inet,
  operating_system character varying,
  status character varying NOT NULL,
  last_seen timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT hosts_pkey PRIMARY KEY (id)
);
CREATE TABLE public.rules (
  id uuid NOT NULL,
  rule_id integer NOT NULL UNIQUE,
  name character varying NOT NULL,
  mitre character varying,
  severity character varying NOT NULL,
  description character varying,
  enabled boolean NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT rules_pkey PRIMARY KEY (id)
);
CREATE TABLE public.alerts (
  id uuid NOT NULL,
  event_id character varying NOT NULL UNIQUE,
  host_id uuid NOT NULL,
  rule_id uuid NOT NULL,
  wazuh_level integer NOT NULL,
  severity character varying NOT NULL,
  title character varying NOT NULL,
  description character varying,
  raw_log jsonb NOT NULL,
  status character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT alerts_pkey PRIMARY KEY (id),
  CONSTRAINT alerts_host_id_fkey FOREIGN KEY (host_id) REFERENCES public.hosts(id),
  CONSTRAINT alerts_rule_id_fkey FOREIGN KEY (rule_id) REFERENCES public.rules(id)
);
CREATE TABLE public.incidents (
  id uuid NOT NULL,
  incident_number character varying NOT NULL UNIQUE,
  title character varying NOT NULL,
  description character varying,
  rule_id uuid NOT NULL,
  host_id uuid NOT NULL,
  severity character varying NOT NULL,
  priority character varying NOT NULL,
  status character varying NOT NULL,
  category character varying NOT NULL,
  confidence integer NOT NULL,
  risk_score double precision,
  occurrence integer NOT NULL,
  first_seen timestamp with time zone NOT NULL,
  last_seen timestamp with time zone NOT NULL,
  assigned_to character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  closed_at timestamp with time zone,
  CONSTRAINT incidents_pkey PRIMARY KEY (id),
  CONSTRAINT incidents_rule_id_fkey FOREIGN KEY (rule_id) REFERENCES public.rules(id),
  CONSTRAINT incidents_host_id_fkey FOREIGN KEY (host_id) REFERENCES public.hosts(id)
);
CREATE TABLE public.audit_logs (
  id uuid NOT NULL,
  user_id uuid NOT NULL,
  action character varying NOT NULL,
  resource character varying NOT NULL,
  ip_address character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.incident_alerts (
  id uuid NOT NULL,
  incident_id uuid NOT NULL,
  alert_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT incident_alerts_pkey PRIMARY KEY (id),
  CONSTRAINT incident_alerts_incident_id_fkey FOREIGN KEY (incident_id) REFERENCES public.incidents(id),
  CONSTRAINT incident_alerts_alert_id_fkey FOREIGN KEY (alert_id) REFERENCES public.alerts(id)
);
CREATE TABLE public.incident_history (
  id uuid NOT NULL,
  incident_id uuid NOT NULL,
  action character varying NOT NULL,
  old_value character varying,
  new_value character varying,
  performed_by character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT incident_history_pkey PRIMARY KEY (id),
  CONSTRAINT incident_history_incident_id_fkey FOREIGN KEY (incident_id) REFERENCES public.incidents(id)
);
CREATE TABLE public.responses (
  id uuid NOT NULL,
  incident_id uuid NOT NULL,
  action character varying NOT NULL,
  status character varying NOT NULL,
  message character varying,
  executed_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT responses_pkey PRIMARY KEY (id),
  CONSTRAINT responses_incident_id_fkey FOREIGN KEY (incident_id) REFERENCES public.incidents(id)
);