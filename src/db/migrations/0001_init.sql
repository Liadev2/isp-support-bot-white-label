-- Esquema base multi-tenant para ISP Support Bot (PostgreSQL)

CREATE TABLE tenants (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code           TEXT NOT NULL UNIQUE, -- ej: isp_a, isp_b
  name           TEXT NOT NULL,
  api_key_hash   TEXT NOT NULL,        -- hash de la API key del tenant
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tenant_config (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  billing_type      TEXT NOT NULL, -- wispro, splynx, mikrowisp
  billing_base_url  TEXT NOT NULL,
  billing_api_token TEXT NOT NULL,
  network_type      TEXT NOT NULL, -- mikrotik, huawei_olt, zte_olt
  network_host      TEXT NOT NULL,
  network_username  TEXT NOT NULL,
  network_password  TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id)
);

CREATE TABLE tenant_branding (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  bot_name    TEXT NOT NULL,
  logo_url    TEXT,
  primary_color   TEXT,
  secondary_color TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id)
);

CREATE TABLE users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email        TEXT NOT NULL,
  role         TEXT NOT NULL, -- admin, supervisor, agent, system
  password_hash TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, email)
);

CREATE TABLE customers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  external_id  TEXT NOT NULL, -- id del CRM/BSS externo
  full_name    TEXT NOT NULL,
  document_id  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, external_id)
);

CREATE TABLE customer_connections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  access_type     TEXT NOT NULL,  -- fiber, wireless, coax, etc.
  router_hostname TEXT,
  router_ip       INET,
  olt_id          TEXT,
  olt_port        TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, customer_id, router_hostname)
);

CREATE TABLE invoices (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id    UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  external_id    TEXT NOT NULL, -- id de factura en Wispro/Splynx/etc
  amount_cents   BIGINT NOT NULL,
  currency       TEXT NOT NULL DEFAULT 'USD',
  due_date       DATE NOT NULL,
  status         TEXT NOT NULL, -- pending, paid, cancelled
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, external_id)
);

CREATE TABLE audit_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  actor_user_id  UUID,
  actor_type     TEXT NOT NULL,     -- user, system, bot
  action         TEXT NOT NULL,     -- e.g. ROUTER_REBOOT, HEALTH_CHECK, INVOICE_QUERY
  target_type    TEXT NOT NULL,     -- e.g. router, connection, invoice
  target_id      TEXT,
  metadata       JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para enforcement y performance multi-tenant
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_customers_tenant ON customers(tenant_id);
CREATE INDEX idx_connections_tenant ON customer_connections(tenant_id);
CREATE INDEX idx_invoices_tenant ON invoices(tenant_id);
CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);

