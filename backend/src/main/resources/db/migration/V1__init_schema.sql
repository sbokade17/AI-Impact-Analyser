-- V1: Core schema for AI Impact Analyser

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────
-- Projects
-- ─────────────────────────────────────────
CREATE TABLE projects (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    created_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- Source Connections (git, features, db, docs)
-- ─────────────────────────────────────────
CREATE TABLE source_connections (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id      UUID        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    type            VARCHAR(50) NOT NULL,   -- GIT | FEATURE_FILES | DATABASE_SCHEMA | DOCS
    config_json     TEXT,                   -- JSON of connection settings (encrypt in prod)
    status          VARCHAR(50) NOT NULL DEFAULT 'DISCONNECTED',
    last_synced_at  TIMESTAMP,
    metadata_json   TEXT,                   -- JSON: fileCount, tableCount, etc.
    created_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- Analysis Runs
-- ─────────────────────────────────────────
CREATE TABLE analysis_runs (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id      UUID        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    status          VARCHAR(50) NOT NULL DEFAULT 'QUEUED',  -- QUEUED|INGESTING|ANALYZING|COMPLETED|FAILED
    jira_ticket_id  VARCHAR(100),
    jira_content    TEXT,
    feature_content TEXT,
    error_message   TEXT,
    created_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
    started_at      TIMESTAMP,
    completed_at    TIMESTAMP
);

-- ─────────────────────────────────────────
-- Reports (one-to-one with analysis_runs)
-- ─────────────────────────────────────────
CREATE TABLE reports (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_run_id     UUID        NOT NULL UNIQUE REFERENCES analysis_runs(id) ON DELETE CASCADE,
    ticket_id           VARCHAR(100),
    ticket_summary      TEXT,
    risk_level          VARCHAR(10) NOT NULL,   -- High | Medium | Low
    risk_score          INT         NOT NULL,
    score_bd_files      INT         NOT NULL DEFAULT 0,
    score_bd_database   INT         NOT NULL DEFAULT 0,
    score_bd_functional INT         NOT NULL DEFAULT 0,
    score_bd_tests      INT         NOT NULL DEFAULT 0,
    summary             TEXT,
    generated_at        TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- Report sub-tables
-- ─────────────────────────────────────────
CREATE TABLE report_affected_files (
    id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id    UUID        NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    path         TEXT        NOT NULL,
    file_type    VARCHAR(50),   -- service | controller | model | config | test | migration | feature
    change_type  VARCHAR(50),   -- modified | added | deleted
    risk         VARCHAR(20),
    reason       TEXT,
    lines_changed INT
);

CREATE TABLE report_db_changes (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id   UUID        NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    table_name  VARCHAR(255),
    operation   VARCHAR(50),   -- ALTER | CREATE | INDEX | DROP COLUMN
    detail      TEXT,
    risk        VARCHAR(20),
    migration   VARCHAR(255)
);

CREATE TABLE report_functional_areas (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id   UUID        NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    name        VARCHAR(255),
    impact      VARCHAR(20),
    description TEXT
);

CREATE TABLE report_functional_area_flows (
    functional_area_id UUID        NOT NULL REFERENCES report_functional_areas(id) ON DELETE CASCADE,
    flow               VARCHAR(500)
);

CREATE TABLE report_test_cases (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id   UUID        NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    test_id     VARCHAR(50),
    title       TEXT,
    type        VARCHAR(50),   -- regression | new | integration
    status      VARCHAR(50),   -- recommended | required
    feature     VARCHAR(255)
);

CREATE TABLE report_recommendations (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id   UUID        NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    priority    VARCHAR(10),   -- P0 | P1 | P2
    text        TEXT,
    category    VARCHAR(100)
);

CREATE TABLE report_dependencies (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id   UUID        NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    name        VARCHAR(255),
    version     VARCHAR(100),
    reason      TEXT
);

-- ─────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────
CREATE INDEX idx_source_connections_project   ON source_connections(project_id);
CREATE INDEX idx_analysis_runs_project        ON analysis_runs(project_id);
CREATE INDEX idx_analysis_runs_status         ON analysis_runs(status);
CREATE INDEX idx_reports_analysis_run         ON reports(analysis_run_id);
CREATE INDEX idx_affected_files_report        ON report_affected_files(report_id);
CREATE INDEX idx_db_changes_report            ON report_db_changes(report_id);
CREATE INDEX idx_functional_areas_report      ON report_functional_areas(report_id);
CREATE INDEX idx_test_cases_report            ON report_test_cases(report_id);
CREATE INDEX idx_recommendations_report       ON report_recommendations(report_id);
CREATE INDEX idx_dependencies_report          ON report_dependencies(report_id);
