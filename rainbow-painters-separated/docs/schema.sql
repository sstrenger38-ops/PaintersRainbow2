-- Rainbow Painters — PostgreSQL schema for the future admin dashboard
-- Covers: enquiries, site inspections, quotes, projects, customers, testimonials, gallery, services, contact requests.

CREATE TABLE customers (
  id            BIGSERIAL PRIMARY KEY,
  full_name     TEXT NOT NULL,
  phone         TEXT NOT NULL,
  whatsapp      TEXT,
  email         TEXT,
  location      TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE services (
  id            SERIAL PRIMARY KEY,
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  short_desc    TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  sort_order    INT NOT NULL DEFAULT 0
);

-- Every form submission becomes a lead
CREATE TYPE lead_type   AS ENUM ('estimate', 'inspection', 'contact', 'whatsapp', 'call');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'inspection_booked', 'quote_sent', 'won', 'lost');

CREATE TABLE leads (
  id               BIGSERIAL PRIMARY KEY,
  customer_id      BIGINT REFERENCES customers(id),
  type             lead_type NOT NULL,
  status           lead_status NOT NULL DEFAULT 'new',
  service_id       INT REFERENCES services(id),
  property_type    TEXT,
  scope            TEXT,                -- interior / exterior / both
  approx_area      TEXT,
  floors           INT,
  preferred_start  DATE,
  preferred_date   DATE,                -- site inspection
  preferred_time   TEXT,
  budget_range     TEXT,
  message          TEXT,
  photo_urls       TEXT[] DEFAULT '{}',
  source           TEXT,                -- website, whatsapp, phone ...
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX leads_status_idx ON leads(status);
CREATE INDEX leads_created_idx ON leads(created_at DESC);

CREATE TABLE quotes (
  id            BIGSERIAL PRIMARY KEY,
  lead_id       BIGINT NOT NULL REFERENCES leads(id),
  amount_inr    NUMERIC(12,2) NOT NULL,
  scope_notes   TEXT,
  status        TEXT NOT NULL DEFAULT 'sent',   -- draft / sent / accepted / rejected
  sent_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE projects (
  id            BIGSERIAL PRIMARY KEY,
  customer_id   BIGINT REFERENCES customers(id),
  quote_id      BIGINT REFERENCES quotes(id),
  service_id    INT REFERENCES services(id),
  title         TEXT NOT NULL,
  location      TEXT,
  categories    TEXT[] DEFAULT '{}',   -- residential, commercial, industrial, ...
  description   TEXT,
  status        TEXT NOT NULL DEFAULT 'active',  -- active / completed
  contract_value_inr NUMERIC(12,2),
  start_date    DATE,
  end_date      DATE,
  show_on_site  BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE payments (            -- payment tracking (future)
  id            BIGSERIAL PRIMARY KEY,
  project_id    BIGINT NOT NULL REFERENCES projects(id),
  amount_inr    NUMERIC(12,2) NOT NULL,
  paid_on       DATE NOT NULL,
  method        TEXT,
  note          TEXT
);

CREATE TABLE gallery_images (
  id            BIGSERIAL PRIMARY KEY,
  project_id    BIGINT REFERENCES projects(id),
  url           TEXT NOT NULL,
  kind          TEXT NOT NULL DEFAULT 'after',   -- before / after / gallery
  alt_text      TEXT,
  sort_order    INT NOT NULL DEFAULT 0
);

CREATE TABLE testimonials (
  id            BIGSERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  project_type  TEXT,
  location      TEXT,
  rating        SMALLINT CHECK (rating BETWEEN 1 AND 5),
  review        TEXT NOT NULL,
  is_verified   BOOLEAN NOT NULL DEFAULT false,   -- only show as genuine when true
  is_published  BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE admin_users (
  id            SERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'admin'
);

-- Dashboard statistics
CREATE VIEW dashboard_stats AS
SELECT
  (SELECT count(*) FROM leads)                                        AS total_leads,
  (SELECT count(*) FROM leads WHERE type = 'inspection')              AS site_inspections,
  (SELECT count(*) FROM quotes WHERE status IN ('sent','accepted'))   AS quotes_sent,
  (SELECT count(*) FROM projects WHERE status = 'active')             AS active_projects,
  (SELECT count(*) FROM projects WHERE status = 'completed')          AS completed_projects,
  (SELECT COALESCE(sum(contract_value_inr),0) FROM projects)          AS estimated_revenue_inr;
