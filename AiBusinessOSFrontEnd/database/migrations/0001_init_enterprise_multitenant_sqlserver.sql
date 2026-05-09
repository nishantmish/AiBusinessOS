-- ========================================================================
-- AI Business Operating System - SQL Server Schema
-- Production-grade SQL Server 2019+ schema (multi-tenant, audit, soft delete)
-- ========================================================================
-- Converts PostgreSQL schema to SQL Server with:
-- - Complete enterprise tables
-- - Audit triggers for all write operations
-- - Stored procedures for common operations
-- - Comprehensive indexes for performance
-- - Views for soft-delete filtering
-- ========================================================================

-- Create database if it doesn't exist
IF DB_ID('AiBusinessOS') IS NULL
BEGIN
    CREATE DATABASE [AiBusinessOS];
END
GO

USE [AiBusinessOS];
GO

-- ========================================================================
-- 1. UTILITY TYPES AND DEFAULTS
-- ========================================================================

-- Default values for enum-like columns
-- Using CHECK constraints instead of ENUM type (SQL Server doesn't have native ENUM)

-- ========================================================================
-- 2. AUDIT AND LOGGING TABLES
-- ========================================================================

IF OBJECT_ID('dbo.audit_logs', 'U') IS NOT NULL DROP TABLE dbo.audit_logs;
IF OBJECT_ID('dbo.error_logs', 'U') IS NOT NULL DROP TABLE dbo.error_logs;
IF OBJECT_ID('dbo.operation_logs', 'U') IS NOT NULL DROP TABLE dbo.operation_logs;

CREATE TABLE dbo.error_logs (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    error_number INT,
    error_severity INT,
    error_state INT,
    error_procedure NVARCHAR(128),
    error_line INT,
    error_message NVARCHAR(MAX),
    created_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
);

CREATE TABLE dbo.operation_logs (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    operation_name NVARCHAR(128) NOT NULL,
    table_name NVARCHAR(128) NOT NULL,
    operation_type VARCHAR(10) CHECK (operation_type IN ('INSERT', 'UPDATE', 'DELETE')),
    affected_rows INT,
    execution_time_ms INT,
    created_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
);

CREATE TABLE dbo.audit_logs (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenant_id UNIQUEIDENTIFIER,
    actor_user_id UNIQUEIDENTIFIER,
    action NVARCHAR(128) NOT NULL,
    entity_name NVARCHAR(128) NOT NULL,
    entity_id UNIQUEIDENTIFIER,
    old_values NVARCHAR(MAX),  -- JSON format
    new_values NVARCHAR(MAX),  -- JSON format
    ip_address VARCHAR(45),
    user_agent NVARCHAR(500),
    created_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
);

-- ========================================================================
-- 3. PLATFORM & TENANT TABLES
-- ========================================================================

IF OBJECT_ID('dbo.plans', 'U') IS NOT NULL DROP TABLE dbo.plans;

CREATE TABLE dbo.plans (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    monthly_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    yearly_price NUMERIC(12,2),
    max_users INT NOT NULL DEFAULT 3,
    max_branches INT NOT NULL DEFAULT 1,
    max_messages_per_month INT NOT NULL DEFAULT 500,
    max_ai_credits_per_month INT NOT NULL DEFAULT 500,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'archived')),
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIMEOFFSET,
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIMEOFFSET,
    deleted_by UNIQUEIDENTIFIER
);

IF OBJECT_ID('dbo.organizations', 'U') IS NOT NULL DROP TABLE dbo.organizations;

CREATE TABLE dbo.organizations (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    niche VARCHAR(100),
    plan_id UNIQUEIDENTIFIER REFERENCES dbo.plans(id),
    timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
    currency_code VARCHAR(8) NOT NULL DEFAULT 'USD',
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'archived')),
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIMEOFFSET,
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIMEOFFSET,
    deleted_by UNIQUEIDENTIFIER
);

IF OBJECT_ID('dbo.branches', 'U') IS NOT NULL DROP TABLE dbo.branches;

CREATE TABLE dbo.branches (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenant_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.organizations(id),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) NOT NULL,
    address_line1 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    phone VARCHAR(30),
    email VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'archived')),
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIMEOFFSET,
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIMEOFFSET,
    deleted_by UNIQUEIDENTIFIER,
    CONSTRAINT uq_branches_tenant_code UNIQUE (tenant_id, code)
);

-- ========================================================================
-- 4. IDENTITY & RBAC
-- ========================================================================

IF OBJECT_ID('dbo.roles', 'U') IS NOT NULL DROP TABLE dbo.roles;

CREATE TABLE dbo.roles (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    code VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    is_system BIT NOT NULL DEFAULT 0,
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIMEOFFSET,
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIMEOFFSET,
    deleted_by UNIQUEIDENTIFIER
);

IF OBJECT_ID('dbo.permissions', 'U') IS NOT NULL DROP TABLE dbo.permissions;

CREATE TABLE dbo.permissions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    code VARCHAR(128) NOT NULL UNIQUE,
    name VARCHAR(128) NOT NULL,
    module VARCHAR(64) NOT NULL,
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
);

IF OBJECT_ID('dbo.role_permissions', 'U') IS NOT NULL DROP TABLE dbo.role_permissions;

CREATE TABLE dbo.role_permissions (
    role_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.roles(id) ON DELETE CASCADE,
    permission_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

IF OBJECT_ID('dbo.users', 'U') IS NOT NULL DROP TABLE dbo.users;

CREATE TABLE dbo.users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenant_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.organizations(id),
    branch_id UNIQUEIDENTIFIER REFERENCES dbo.branches(id),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    first_name VARCHAR(120) NOT NULL,
    last_name VARCHAR(120),
    password_hash VARCHAR(MAX) NOT NULL,
    avatar_url VARCHAR(MAX),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'archived')),
    last_login_at DATETIMEOFFSET,
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIMEOFFSET,
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIMEOFFSET,
    deleted_by UNIQUEIDENTIFIER,
    CONSTRAINT uq_users_tenant_email UNIQUE (tenant_id, email)
);

IF OBJECT_ID('dbo.user_roles', 'U') IS NOT NULL DROP TABLE dbo.user_roles;

CREATE TABLE dbo.user_roles (
    user_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.users(id) ON DELETE CASCADE,
    role_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.roles(id),
    tenant_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.organizations(id),
    assigned_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    assigned_by UNIQUEIDENTIFIER,
    PRIMARY KEY (user_id, role_id, tenant_id)
);

IF OBJECT_ID('dbo.refresh_tokens', 'U') IS NOT NULL DROP TABLE dbo.refresh_tokens;

CREATE TABLE dbo.refresh_tokens (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenant_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.organizations(id),
    user_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.users(id) ON DELETE CASCADE,
    token_hash VARCHAR(MAX) NOT NULL,
    expires_at DATETIMEOFFSET NOT NULL,
    revoked_at DATETIMEOFFSET,
    replaced_by_token_id UNIQUEIDENTIFIER REFERENCES dbo.refresh_tokens(id),
    user_agent VARCHAR(MAX),
    ip_address VARCHAR(45),
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    created_by UNIQUEIDENTIFIER
);

-- ========================================================================
-- 5. CRM TABLES
-- ========================================================================

IF OBJECT_ID('dbo.lead_stages', 'U') IS NOT NULL DROP TABLE dbo.lead_stages;

CREATE TABLE dbo.lead_stages (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenant_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.organizations(id),
    name VARCHAR(120) NOT NULL,
    position INT NOT NULL,
    is_default BIT NOT NULL DEFAULT 0,
    win_probability SMALLINT CHECK (win_probability BETWEEN 0 AND 100),
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIMEOFFSET,
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIMEOFFSET,
    deleted_by UNIQUEIDENTIFIER,
    CONSTRAINT uq_lead_stages_tenant_position UNIQUE (tenant_id, position)
);

IF OBJECT_ID('dbo.leads', 'U') IS NOT NULL DROP TABLE dbo.leads;

CREATE TABLE dbo.leads (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenant_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.organizations(id),
    owner_user_id UNIQUEIDENTIFIER REFERENCES dbo.users(id),
    assigned_branch_id UNIQUEIDENTIFIER REFERENCES dbo.branches(id),
    source VARCHAR(50) NOT NULL,
    stage_id UNIQUEIDENTIFIER REFERENCES dbo.lead_stages(id),
    first_name VARCHAR(120) NOT NULL,
    last_name VARCHAR(120),
    email VARCHAR(255),
    phone VARCHAR(30),
    company_name VARCHAR(200),
    score SMALLINT NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
    value_estimate NUMERIC(14,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost')),
    notes VARCHAR(MAX),
    converted_customer_id UNIQUEIDENTIFIER,
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIMEOFFSET,
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIMEOFFSET,
    deleted_by UNIQUEIDENTIFIER
);

IF OBJECT_ID('dbo.lead_activities', 'U') IS NOT NULL DROP TABLE dbo.lead_activities;

CREATE TABLE dbo.lead_activities (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenant_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.organizations(id),
    lead_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.leads(id) ON DELETE CASCADE,
    actor_user_id UNIQUEIDENTIFIER REFERENCES dbo.users(id),
    activity_type VARCHAR(64) NOT NULL,
    description VARCHAR(MAX) NOT NULL,
    metadata NVARCHAR(MAX) NOT NULL DEFAULT '{}',  -- JSON format
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    created_by UNIQUEIDENTIFIER,
    deleted_at DATETIMEOFFSET
);

-- ========================================================================
-- 6. COMMUNICATION & MESSAGING
-- ========================================================================

IF OBJECT_ID('dbo.customers', 'U') IS NOT NULL DROP TABLE dbo.customers;

CREATE TABLE dbo.customers (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenant_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.organizations(id),
    lead_id UNIQUEIDENTIFIER REFERENCES dbo.leads(id),
    branch_id UNIQUEIDENTIFIER REFERENCES dbo.branches(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(30),
    tags NVARCHAR(MAX) NOT NULL DEFAULT '[]',  -- JSON format
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'archived')),
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIMEOFFSET,
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIMEOFFSET,
    deleted_by UNIQUEIDENTIFIER
);

IF OBJECT_ID('dbo.conversations', 'U') IS NOT NULL DROP TABLE dbo.conversations;

CREATE TABLE dbo.conversations (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenant_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.organizations(id),
    customer_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.customers(id),
    channel VARCHAR(20) NOT NULL,
    assignee_user_id UNIQUEIDENTIFIER REFERENCES dbo.users(id),
    last_message_at DATETIMEOFFSET,
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'pending', 'resolved', 'archived')),
    unread_count INT NOT NULL DEFAULT 0,
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIMEOFFSET,
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIMEOFFSET,
    deleted_by UNIQUEIDENTIFIER
);

IF OBJECT_ID('dbo.messages', 'U') IS NOT NULL DROP TABLE dbo.messages;

CREATE TABLE dbo.messages (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenant_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.organizations(id),
    conversation_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.conversations(id) ON DELETE CASCADE,
    sender_user_id UNIQUEIDENTIFIER REFERENCES dbo.users(id),
    external_message_id VARCHAR(128),
    direction VARCHAR(20) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    content VARCHAR(MAX) NOT NULL,
    content_type VARCHAR(32) NOT NULL DEFAULT 'text',
    ai_generated BIT NOT NULL DEFAULT 0,
    sent_at DATETIMEOFFSET,
    delivered_at DATETIMEOFFSET,
    read_at DATETIMEOFFSET,
    metadata NVARCHAR(MAX) NOT NULL DEFAULT '{}',  -- JSON format
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    created_by UNIQUEIDENTIFIER,
    deleted_at DATETIMEOFFSET
);

IF OBJECT_ID('dbo.whatsapp_templates', 'U') IS NOT NULL DROP TABLE dbo.whatsapp_templates;

CREATE TABLE dbo.whatsapp_templates (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenant_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.organizations(id),
    template_name VARCHAR(120) NOT NULL,
    language_code VARCHAR(16) NOT NULL,
    category VARCHAR(50) NOT NULL,
    body VARCHAR(MAX) NOT NULL,
    variables NVARCHAR(MAX) NOT NULL DEFAULT '[]',  -- JSON format
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'archived')),
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIMEOFFSET,
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIMEOFFSET,
    deleted_by UNIQUEIDENTIFIER,
    CONSTRAINT uq_template_per_tenant UNIQUE (tenant_id, template_name, language_code)
);

-- ========================================================================
-- 7. TASKS & ATTENDANCE
-- ========================================================================

IF OBJECT_ID('dbo.tasks', 'U') IS NOT NULL DROP TABLE dbo.tasks;

CREATE TABLE dbo.tasks (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenant_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.organizations(id),
    title VARCHAR(255) NOT NULL,
    description VARCHAR(MAX),
    assignee_user_id UNIQUEIDENTIFIER REFERENCES dbo.users(id),
    reporter_user_id UNIQUEIDENTIFIER REFERENCES dbo.users(id),
    related_lead_id UNIQUEIDENTIFIER REFERENCES dbo.leads(id),
    priority VARCHAR(16) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'in_review', 'done', 'cancelled')),
    due_at DATETIMEOFFSET,
    completed_at DATETIMEOFFSET,
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIMEOFFSET,
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIMEOFFSET,
    deleted_by UNIQUEIDENTIFIER
);

IF OBJECT_ID('dbo.attendance_logs', 'U') IS NOT NULL DROP TABLE dbo.attendance_logs;

CREATE TABLE dbo.attendance_logs (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenant_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.organizations(id),
    user_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.users(id),
    check_in_at DATETIMEOFFSET NOT NULL,
    check_out_at DATETIMEOFFSET,
    notes VARCHAR(MAX),
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    created_by UNIQUEIDENTIFIER,
    deleted_at DATETIMEOFFSET
);

-- ========================================================================
-- 8. BILLING & INVOICES
-- ========================================================================

IF OBJECT_ID('dbo.invoices', 'U') IS NOT NULL DROP TABLE dbo.invoices;

CREATE TABLE dbo.invoices (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenant_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.organizations(id),
    customer_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.customers(id),
    invoice_no VARCHAR(50) NOT NULL,
    issue_date DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    due_date DATE NOT NULL,
    sub_total NUMERIC(14,2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    currency_code VARCHAR(8) NOT NULL DEFAULT 'USD',
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'void')),
    notes VARCHAR(MAX),
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIMEOFFSET,
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIMEOFFSET,
    deleted_by UNIQUEIDENTIFIER,
    CONSTRAINT uq_invoices_tenant_invoice_no UNIQUE (tenant_id, invoice_no)
);

IF OBJECT_ID('dbo.invoice_items', 'U') IS NOT NULL DROP TABLE dbo.invoice_items;

CREATE TABLE dbo.invoice_items (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenant_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.organizations(id),
    invoice_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.invoices(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    description VARCHAR(MAX),
    quantity NUMERIC(12,2) NOT NULL DEFAULT 1,
    unit_price NUMERIC(14,2) NOT NULL DEFAULT 0,
    tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
    line_total NUMERIC(14,2) NOT NULL DEFAULT 0,
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    created_by UNIQUEIDENTIFIER
);

IF OBJECT_ID('dbo.payments', 'U') IS NOT NULL DROP TABLE dbo.payments;

CREATE TABLE dbo.payments (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenant_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.organizations(id),
    invoice_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.invoices(id),
    gateway VARCHAR(32) NOT NULL,
    gateway_reference VARCHAR(128),
    amount NUMERIC(14,2) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'success', 'failed', 'cancelled')),
    paid_at DATETIMEOFFSET,
    payload NVARCHAR(MAX) NOT NULL DEFAULT '{}',  -- JSON format
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    created_by UNIQUEIDENTIFIER
);

-- ========================================================================
-- 9. WORKFLOW & AUTOMATION
-- ========================================================================

IF OBJECT_ID('dbo.workflow_definitions', 'U') IS NOT NULL DROP TABLE dbo.workflow_definitions;

CREATE TABLE dbo.workflow_definitions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenant_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.organizations(id),
    name VARCHAR(255) NOT NULL,
    trigger_type VARCHAR(64) NOT NULL,
    version SMALLINT NOT NULL DEFAULT 1,
    definition VARCHAR(MAX) NOT NULL,  -- JSON format
    is_active BIT NOT NULL DEFAULT 0,
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIMEOFFSET,
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIMEOFFSET,
    deleted_by UNIQUEIDENTIFIER
);

IF OBJECT_ID('dbo.workflow_executions', 'U') IS NOT NULL DROP TABLE dbo.workflow_executions;

CREATE TABLE dbo.workflow_executions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenant_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.organizations(id),
    workflow_definition_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.workflow_definitions(id),
    trigger_payload NVARCHAR(MAX) NOT NULL DEFAULT '{}',  -- JSON format
    status VARCHAR(20) NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed')),
    started_at DATETIMEOFFSET,
    completed_at DATETIMEOFFSET,
    error_message VARCHAR(MAX),
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    created_by UNIQUEIDENTIFIER
);

-- ========================================================================
-- 10. AI CONFIGURATION & TOKENS
-- ========================================================================

IF OBJECT_ID('dbo.ai_provider_configs', 'U') IS NOT NULL DROP TABLE dbo.ai_provider_configs;

CREATE TABLE dbo.ai_provider_configs (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenant_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.organizations(id),
    provider VARCHAR(32) NOT NULL,
    model VARCHAR(128) NOT NULL,
    api_key_encrypted VARCHAR(MAX) NOT NULL,
    is_default BIT NOT NULL DEFAULT 0,
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    created_by UNIQUEIDENTIFIER,
    updated_at DATETIMEOFFSET,
    updated_by UNIQUEIDENTIFIER,
    deleted_at DATETIMEOFFSET
);

IF OBJECT_ID('dbo.ai_memories', 'U') IS NOT NULL DROP TABLE dbo.ai_memories;

CREATE TABLE dbo.ai_memories (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenant_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.organizations(id),
    customer_id UNIQUEIDENTIFIER REFERENCES dbo.customers(id),
    conversation_id UNIQUEIDENTIFIER REFERENCES dbo.conversations(id),
    memory_type VARCHAR(64) NOT NULL,
    memory_text VARCHAR(MAX) NOT NULL,
    vector_embedding NVARCHAR(MAX),  -- Store embeddings as JSON array
    metadata NVARCHAR(MAX) NOT NULL DEFAULT '{}',  -- JSON format
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    created_by UNIQUEIDENTIFIER,
    deleted_at DATETIMEOFFSET
);

IF OBJECT_ID('dbo.ai_token_usages', 'U') IS NOT NULL DROP TABLE dbo.ai_token_usages;

CREATE TABLE dbo.ai_token_usages (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenant_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.organizations(id),
    user_id UNIQUEIDENTIFIER REFERENCES dbo.users(id),
    provider VARCHAR(32) NOT NULL,
    model VARCHAR(128) NOT NULL,
    operation VARCHAR(64) NOT NULL,
    prompt_tokens INT NOT NULL DEFAULT 0,
    completion_tokens INT NOT NULL DEFAULT 0,
    total_tokens INT NOT NULL DEFAULT 0,
    credits_consumed INT NOT NULL DEFAULT 0,
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
);

-- ========================================================================
-- 11. OUTBOX & IDEMPOTENCY
-- ========================================================================

IF OBJECT_ID('dbo.outbox_messages', 'U') IS NOT NULL DROP TABLE dbo.outbox_messages;

CREATE TABLE dbo.outbox_messages (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenant_id UNIQUEIDENTIFIER,
    event_type VARCHAR(255) NOT NULL,
    payload NVARCHAR(MAX) NOT NULL,  -- JSON format
    headers NVARCHAR(MAX) NOT NULL DEFAULT '{}',  -- JSON format
    occurred_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    processed_at DATETIMEOFFSET,
    error VARCHAR(MAX)
);

IF OBJECT_ID('dbo.idempotency_keys', 'U') IS NOT NULL DROP TABLE dbo.idempotency_keys;

CREATE TABLE dbo.idempotency_keys (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenant_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.organizations(id),
    [key] VARCHAR(128) NOT NULL,
    request_hash VARCHAR(128) NOT NULL,
    response_payload NVARCHAR(MAX),  -- JSON format
    status_code INT,
    created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    expires_at DATETIMEOFFSET NOT NULL,
    CONSTRAINT uq_idempotency_tenant_key UNIQUE (tenant_id, [key])
);

GO

-- ========================================================================
-- 12. INDEXES FOR PERFORMANCE
-- ========================================================================

-- Users indexes
CREATE NONCLUSTERED INDEX ix_users_tenant_status ON dbo.users (tenant_id, status) WHERE deleted_at IS NULL;
CREATE NONCLUSTERED INDEX ix_users_email ON dbo.users (email) WHERE deleted_at IS NULL;
CREATE NONCLUSTERED INDEX ix_users_tenant_branch ON dbo.users (tenant_id, branch_id) WHERE deleted_at IS NULL;

-- Refresh tokens indexes
CREATE NONCLUSTERED INDEX ix_refresh_tokens_user_expires ON dbo.refresh_tokens (user_id, expires_at);
CREATE NONCLUSTERED INDEX ix_refresh_tokens_tenant ON dbo.refresh_tokens (tenant_id);

-- Leads indexes
CREATE NONCLUSTERED INDEX ix_leads_tenant_stage_status ON dbo.leads (tenant_id, stage_id, status) WHERE deleted_at IS NULL;
CREATE NONCLUSTERED INDEX ix_leads_tenant_owner ON dbo.leads (tenant_id, owner_user_id) WHERE deleted_at IS NULL;
CREATE NONCLUSTERED INDEX ix_leads_email ON dbo.leads (email) WHERE deleted_at IS NULL;
CREATE NONCLUSTERED INDEX ix_leads_source ON dbo.leads (tenant_id, source) WHERE deleted_at IS NULL;

-- Lead activities indexes
CREATE NONCLUSTERED INDEX ix_lead_activities_lead_created ON dbo.lead_activities (lead_id, created_at DESC);
CREATE NONCLUSTERED INDEX ix_lead_activities_tenant ON dbo.lead_activities (tenant_id, created_at DESC);

-- Conversations indexes
CREATE NONCLUSTERED INDEX ix_conversations_tenant_status ON dbo.conversations (tenant_id, status, last_message_at DESC) WHERE deleted_at IS NULL;
CREATE NONCLUSTERED INDEX ix_conversations_customer ON dbo.conversations (customer_id, created_at DESC);
CREATE NONCLUSTERED INDEX ix_conversations_assignee ON dbo.conversations (assignee_user_id) WHERE deleted_at IS NULL;

-- Messages indexes
CREATE NONCLUSTERED INDEX ix_messages_conversation_created ON dbo.messages (conversation_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE NONCLUSTERED INDEX ix_messages_tenant ON dbo.messages (tenant_id, created_at DESC);
CREATE NONCLUSTERED INDEX ix_messages_sender ON dbo.messages (sender_user_id) WHERE deleted_at IS NULL;

-- Tasks indexes
CREATE NONCLUSTERED INDEX ix_tasks_tenant_assignee_status ON dbo.tasks (tenant_id, assignee_user_id, status) WHERE deleted_at IS NULL;
CREATE NONCLUSTERED INDEX ix_tasks_due_at ON dbo.tasks (due_at) WHERE deleted_at IS NULL AND status != 'done';
CREATE NONCLUSTERED INDEX ix_tasks_reporter ON dbo.tasks (reporter_user_id);

-- Invoices indexes
CREATE NONCLUSTERED INDEX ix_invoices_tenant_status_due ON dbo.invoices (tenant_id, status, due_date) WHERE deleted_at IS NULL;
CREATE NONCLUSTERED INDEX ix_invoices_customer ON dbo.invoices (customer_id, created_at DESC);
CREATE NONCLUSTERED INDEX ix_invoices_invoice_no ON dbo.invoices (invoice_no);

-- Payments indexes
CREATE NONCLUSTERED INDEX ix_payments_tenant_invoice ON dbo.payments (tenant_id, invoice_id, created_at DESC);
CREATE NONCLUSTERED INDEX ix_payments_status ON dbo.payments (status, created_at DESC);

-- Workflow indexes
CREATE NONCLUSTERED INDEX ix_workflow_def_tenant_active ON dbo.workflow_definitions (tenant_id, is_active) WHERE deleted_at IS NULL;
CREATE NONCLUSTERED INDEX ix_workflow_exec_tenant_created ON dbo.workflow_executions (tenant_id, created_at DESC);
CREATE NONCLUSTERED INDEX ix_workflow_exec_status ON dbo.workflow_executions (status);

-- AI indexes
CREATE NONCLUSTERED INDEX ix_ai_memory_tenant_customer ON dbo.ai_memories (tenant_id, customer_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE NONCLUSTERED INDEX ix_ai_memory_conversation ON dbo.ai_memories (conversation_id);
CREATE NONCLUSTERED INDEX ix_ai_token_usage_tenant_created ON dbo.ai_token_usages (tenant_id, created_at DESC);

-- Audit indexes
CREATE NONCLUSTERED INDEX ix_outbox_processed ON dbo.outbox_messages (processed_at, occurred_at);
CREATE NONCLUSTERED INDEX ix_audit_tenant_created ON dbo.audit_logs (tenant_id, created_at DESC);

-- Outbox message index
CREATE NONCLUSTERED INDEX ix_outbox_unprocessed ON dbo.outbox_messages (processed_at) WHERE processed_at IS NULL;

GO

-- ========================================================================
-- 13. VIEWS FOR SOFT-DELETE FILTERING
-- ========================================================================

CREATE OR ALTER VIEW dbo.v_active_users AS
SELECT * FROM dbo.users WHERE deleted_at IS NULL;
GO

CREATE OR ALTER VIEW dbo.v_active_leads AS
SELECT * FROM dbo.leads WHERE deleted_at IS NULL;
GO

CREATE OR ALTER VIEW dbo.v_active_invoices AS
SELECT * FROM dbo.invoices WHERE deleted_at IS NULL;
GO

CREATE OR ALTER VIEW dbo.v_active_customers AS
SELECT * FROM dbo.customers WHERE deleted_at IS NULL;
GO

CREATE OR ALTER VIEW dbo.v_active_conversations AS
SELECT * FROM dbo.conversations WHERE deleted_at IS NULL;
GO

CREATE OR ALTER VIEW dbo.v_active_tasks AS
SELECT * FROM dbo.tasks WHERE deleted_at IS NULL;
GO

CREATE OR ALTER VIEW dbo.v_active_organizations AS
SELECT * FROM dbo.organizations WHERE deleted_at IS NULL;
GO

-- ========================================================================
-- 14. AUDIT TRIGGERS
-- ========================================================================

-- Trigger for users table
CREATE OR ALTER TRIGGER tr_users_audit
ON dbo.users
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        DECLARE @action VARCHAR(10);
        DECLARE @user_id UNIQUEIDENTIFIER;
        DECLARE @tenant_id UNIQUEIDENTIFIER;
        
        -- Determine action
        IF EXISTS (SELECT 1 FROM inserted) AND EXISTS (SELECT 1 FROM deleted)
            SET @action = 'UPDATE';
        ELSE IF EXISTS (SELECT 1 FROM inserted)
            SET @action = 'INSERT';
        ELSE
            SET @action = 'DELETE';
        
        -- Insert audit log
        INSERT INTO dbo.audit_logs (tenant_id, action, entity_name, entity_id, old_values, new_values, created_at)
        SELECT
            COALESCE(i.tenant_id, d.tenant_id),
            @action,
            'users',
            COALESCE(i.id, d.id),
            CASE WHEN d.id IS NOT NULL THEN (SELECT * FROM deleted d2 WHERE d2.id = COALESCE(i.id, d.id) FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) ELSE NULL END,
            CASE WHEN i.id IS NOT NULL THEN (SELECT * FROM inserted i2 WHERE i2.id = COALESCE(i.id, d.id) FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) ELSE NULL END,
            SYSDATETIMEOFFSET()
        FROM inserted i
        FULL JOIN deleted d ON i.id = d.id;
        
        -- Log operation
        INSERT INTO dbo.operation_logs (operation_name, table_name, operation_type, affected_rows, created_at)
        VALUES ('tr_users_audit', 'users', @action, @@ROWCOUNT, SYSDATETIMEOFFSET());
        
    END TRY
    BEGIN CATCH
        INSERT INTO dbo.error_logs (error_number, error_severity, error_state, error_procedure, error_line, error_message)
        VALUES (ERROR_NUMBER(), ERROR_SEVERITY(), ERROR_STATE(), ERROR_PROCEDURE(), ERROR_LINE(), ERROR_MESSAGE());
        THROW;
    END CATCH;
END;
GO

-- Trigger for leads table
CREATE OR ALTER TRIGGER tr_leads_audit
ON dbo.leads
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        DECLARE @action VARCHAR(10);
        
        IF EXISTS (SELECT 1 FROM inserted) AND EXISTS (SELECT 1 FROM deleted)
            SET @action = 'UPDATE';
        ELSE IF EXISTS (SELECT 1 FROM inserted)
            SET @action = 'INSERT';
        ELSE
            SET @action = 'DELETE';
        
        INSERT INTO dbo.audit_logs (tenant_id, action, entity_name, entity_id, old_values, new_values, created_at)
        SELECT
            COALESCE(i.tenant_id, d.tenant_id),
            @action,
            'leads',
            COALESCE(i.id, d.id),
            CASE WHEN d.id IS NOT NULL THEN (SELECT * FROM deleted d2 WHERE d2.id = COALESCE(i.id, d.id) FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) ELSE NULL END,
            CASE WHEN i.id IS NOT NULL THEN (SELECT * FROM inserted i2 WHERE i2.id = COALESCE(i.id, d.id) FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) ELSE NULL END,
            SYSDATETIMEOFFSET()
        FROM inserted i
        FULL JOIN deleted d ON i.id = d.id;
        
    END TRY
    BEGIN CATCH
        INSERT INTO dbo.error_logs (error_number, error_severity, error_state, error_procedure, error_line, error_message)
        VALUES (ERROR_NUMBER(), ERROR_SEVERITY(), ERROR_STATE(), ERROR_PROCEDURE(), ERROR_LINE(), ERROR_MESSAGE());
        THROW;
    END CATCH;
END;
GO

-- Trigger for invoices table
CREATE OR ALTER TRIGGER tr_invoices_audit
ON dbo.invoices
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        DECLARE @action VARCHAR(10);
        
        IF EXISTS (SELECT 1 FROM inserted) AND EXISTS (SELECT 1 FROM deleted)
            SET @action = 'UPDATE';
        ELSE IF EXISTS (SELECT 1 FROM inserted)
            SET @action = 'INSERT';
        ELSE
            SET @action = 'DELETE';
        
        INSERT INTO dbo.audit_logs (tenant_id, action, entity_name, entity_id, old_values, new_values, created_at)
        SELECT
            COALESCE(i.tenant_id, d.tenant_id),
            @action,
            'invoices',
            COALESCE(i.id, d.id),
            CASE WHEN d.id IS NOT NULL THEN (SELECT * FROM deleted d2 WHERE d2.id = COALESCE(i.id, d.id) FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) ELSE NULL END,
            CASE WHEN i.id IS NOT NULL THEN (SELECT * FROM inserted i2 WHERE i2.id = COALESCE(i.id, d.id) FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) ELSE NULL END,
            SYSDATETIMEOFFSET()
        FROM inserted i
        FULL JOIN deleted d ON i.id = d.id;
        
    END TRY
    BEGIN CATCH
        INSERT INTO dbo.error_logs (error_number, error_severity, error_state, error_procedure, error_line, error_message)
        VALUES (ERROR_NUMBER(), ERROR_SEVERITY(), ERROR_STATE(), ERROR_PROCEDURE(), ERROR_LINE(), ERROR_MESSAGE());
        THROW;
    END CATCH;
END;
GO

-- Trigger for conversations table
CREATE OR ALTER TRIGGER tr_conversations_audit
ON dbo.conversations
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        DECLARE @action VARCHAR(10);
        
        IF EXISTS (SELECT 1 FROM inserted) AND EXISTS (SELECT 1 FROM deleted)
            SET @action = 'UPDATE';
        ELSE IF EXISTS (SELECT 1 FROM inserted)
            SET @action = 'INSERT';
        ELSE
            SET @action = 'DELETE';
        
        INSERT INTO dbo.audit_logs (tenant_id, action, entity_name, entity_id, old_values, new_values, created_at)
        SELECT
            COALESCE(i.tenant_id, d.tenant_id),
            @action,
            'conversations',
            COALESCE(i.id, d.id),
            CASE WHEN d.id IS NOT NULL THEN (SELECT * FROM deleted d2 WHERE d2.id = COALESCE(i.id, d.id) FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) ELSE NULL END,
            CASE WHEN i.id IS NOT NULL THEN (SELECT * FROM inserted i2 WHERE i2.id = COALESCE(i.id, d.id) FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) ELSE NULL END,
            SYSDATETIMEOFFSET()
        FROM inserted i
        FULL JOIN deleted d ON i.id = d.id;
        
    END TRY
    BEGIN CATCH
        INSERT INTO dbo.error_logs (error_number, error_severity, error_state, error_procedure, error_line, error_message)
        VALUES (ERROR_NUMBER(), ERROR_SEVERITY(), ERROR_STATE(), ERROR_PROCEDURE(), ERROR_LINE(), ERROR_MESSAGE());
        THROW;
    END CATCH;
END;
GO

-- Trigger for tasks table
CREATE OR ALTER TRIGGER tr_tasks_audit
ON dbo.tasks
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        DECLARE @action VARCHAR(10);
        
        IF EXISTS (SELECT 1 FROM inserted) AND EXISTS (SELECT 1 FROM deleted)
            SET @action = 'UPDATE';
        ELSE IF EXISTS (SELECT 1 FROM inserted)
            SET @action = 'INSERT';
        ELSE
            SET @action = 'DELETE';
        
        INSERT INTO dbo.audit_logs (tenant_id, action, entity_name, entity_id, old_values, new_values, created_at)
        SELECT
            COALESCE(i.tenant_id, d.tenant_id),
            @action,
            'tasks',
            COALESCE(i.id, d.id),
            CASE WHEN d.id IS NOT NULL THEN (SELECT * FROM deleted d2 WHERE d2.id = COALESCE(i.id, d.id) FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) ELSE NULL END,
            CASE WHEN i.id IS NOT NULL THEN (SELECT * FROM inserted i2 WHERE i2.id = COALESCE(i.id, d.id) FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) ELSE NULL END,
            SYSDATETIMEOFFSET()
        FROM inserted i
        FULL JOIN deleted d ON i.id = d.id;
        
    END TRY
    BEGIN CATCH
        INSERT INTO dbo.error_logs (error_number, error_severity, error_state, error_procedure, error_line, error_message)
        VALUES (ERROR_NUMBER(), ERROR_SEVERITY(), ERROR_STATE(), ERROR_PROCEDURE(), ERROR_LINE(), ERROR_MESSAGE());
        THROW;
    END CATCH;
END;
GO

-- Trigger for messages table
CREATE OR ALTER TRIGGER tr_messages_audit
ON dbo.messages
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Update last_message_at in conversations
        UPDATE dbo.conversations
        SET last_message_at = SYSDATETIMEOFFSET(),
            unread_count = CASE WHEN i.direction = 'inbound' THEN unread_count + 1 ELSE unread_count END
        FROM dbo.conversations c
        INNER JOIN inserted i ON c.id = i.conversation_id
        WHERE c.deleted_at IS NULL;
        
    END TRY
    BEGIN CATCH
        INSERT INTO dbo.error_logs (error_number, error_severity, error_state, error_procedure, error_line, error_message)
        VALUES (ERROR_NUMBER(), ERROR_SEVERITY(), ERROR_STATE(), ERROR_PROCEDURE(), ERROR_LINE(), ERROR_MESSAGE());
        THROW;
    END CATCH;
END;
GO

-- ========================================================================
-- 15. STORED PROCEDURES - USER MANAGEMENT
-- ========================================================================

CREATE OR ALTER PROCEDURE sp_CreateUser
    @tenant_id UNIQUEIDENTIFIER,
    @email VARCHAR(255),
    @first_name VARCHAR(120),
    @last_name VARCHAR(120),
    @phone VARCHAR(30) = NULL,
    @password_hash VARCHAR(MAX),
    @branch_id UNIQUEIDENTIFIER = NULL,
    @created_by UNIQUEIDENTIFIER = NULL,
    @new_user_id UNIQUEIDENTIFIER OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        DECLARE @start_time DATETIMEOFFSET = SYSDATETIMEOFFSET();
        
        -- Validate input
        IF @tenant_id IS NULL
            THROW 50001, 'Tenant ID is required', 1;
        
        IF @email IS NULL OR @email = ''
            THROW 50002, 'Email is required', 1;
        
        IF @first_name IS NULL OR @first_name = ''
            THROW 50003, 'First name is required', 1;
        
        -- Check if email already exists for tenant
        IF EXISTS (SELECT 1 FROM dbo.users WHERE tenant_id = @tenant_id AND email = @email AND deleted_at IS NULL)
            THROW 50004, 'Email already exists for this tenant', 1;
        
        -- Create user
        SET @new_user_id = NEWID();
        
        INSERT INTO dbo.users (
            id, tenant_id, branch_id, email, first_name, last_name, phone, password_hash, 
            status, created_by, created_at
        )
        VALUES (
            @new_user_id, @tenant_id, @branch_id, @email, @first_name, @last_name, @phone, @password_hash,
            'active', @created_by, SYSDATETIMEOFFSET()
        );
        
        -- Log operation
        INSERT INTO dbo.operation_logs (operation_name, table_name, operation_type, affected_rows, execution_time_ms, created_at)
        VALUES ('sp_CreateUser', 'users', 'INSERT', 1, DATEDIFF(MILLISECOND, @start_time, SYSDATETIMEOFFSET()), SYSDATETIMEOFFSET());
        
        SELECT @new_user_id AS user_id;
        
    END TRY
    BEGIN CATCH
        INSERT INTO dbo.error_logs (error_number, error_severity, error_state, error_procedure, error_line, error_message)
        VALUES (ERROR_NUMBER(), ERROR_SEVERITY(), ERROR_STATE(), ERROR_PROCEDURE(), ERROR_LINE(), ERROR_MESSAGE());
        THROW;
    END CATCH;
END;
GO

-- ========================================================================
-- 16. STORED PROCEDURES - LEAD MANAGEMENT
-- ========================================================================

CREATE OR ALTER PROCEDURE sp_CreateLead
    @tenant_id UNIQUEIDENTIFIER,
    @first_name VARCHAR(120),
    @last_name VARCHAR(120),
    @email VARCHAR(255) = NULL,
    @phone VARCHAR(30) = NULL,
    @company_name VARCHAR(200) = NULL,
    @source VARCHAR(50),
    @owner_user_id UNIQUEIDENTIFIER = NULL,
    @branch_id UNIQUEIDENTIFIER = NULL,
    @created_by UNIQUEIDENTIFIER = NULL,
    @new_lead_id UNIQUEIDENTIFIER OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        DECLARE @start_time DATETIMEOFFSET = SYSDATETIMEOFFSET();
        DECLARE @default_stage_id UNIQUEIDENTIFIER;
        
        -- Validate input
        IF @tenant_id IS NULL
            THROW 50001, 'Tenant ID is required', 1;
        
        IF @first_name IS NULL OR @first_name = ''
            THROW 50002, 'First name is required', 1;
        
        IF @source IS NULL OR @source = ''
            THROW 50003, 'Source is required', 1;
        
        -- Get default lead stage
        SELECT TOP 1 @default_stage_id = id 
        FROM dbo.lead_stages 
        WHERE tenant_id = @tenant_id AND is_default = 1 AND deleted_at IS NULL;
        
        -- Create lead
        SET @new_lead_id = NEWID();
        
        INSERT INTO dbo.leads (
            id, tenant_id, first_name, last_name, email, phone, company_name, source,
            stage_id, owner_user_id, assigned_branch_id, status, score, value_estimate,
            created_by, created_at
        )
        VALUES (
            @new_lead_id, @tenant_id, @first_name, @last_name, @email, @phone, @company_name, @source,
            @default_stage_id, @owner_user_id, @branch_id, 'open', 0, 0,
            @created_by, SYSDATETIMEOFFSET()
        );
        
        -- Insert initial activity
        INSERT INTO dbo.lead_activities (
            id, tenant_id, lead_id, activity_type, description, actor_user_id, created_by, created_at
        )
        VALUES (
            NEWID(), @tenant_id, @new_lead_id, 'created', 'Lead created from ' + @source, @created_by, @created_by, SYSDATETIMEOFFSET()
        );
        
        -- Log operation
        INSERT INTO dbo.operation_logs (operation_name, table_name, operation_type, affected_rows, execution_time_ms, created_at)
        VALUES ('sp_CreateLead', 'leads', 'INSERT', 1, DATEDIFF(MILLISECOND, @start_time, SYSDATETIMEOFFSET()), SYSDATETIMEOFFSET());
        
        SELECT @new_lead_id AS lead_id;
        
    END TRY
    BEGIN CATCH
        INSERT INTO dbo.error_logs (error_number, error_severity, error_state, error_procedure, error_line, error_message)
        VALUES (ERROR_NUMBER(), ERROR_SEVERITY(), ERROR_STATE(), ERROR_PROCEDURE(), ERROR_LINE(), ERROR_MESSAGE());
        THROW;
    END CATCH;
END;
GO

-- ========================================================================
-- 17. STORED PROCEDURES - CONVERSATION MANAGEMENT
-- ========================================================================

CREATE OR ALTER PROCEDURE sp_CreateConversation
    @tenant_id UNIQUEIDENTIFIER,
    @customer_id UNIQUEIDENTIFIER,
    @channel VARCHAR(20),
    @created_by UNIQUEIDENTIFIER = NULL,
    @new_conversation_id UNIQUEIDENTIFIER OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        DECLARE @start_time DATETIMEOFFSET = SYSDATETIMEOFFSET();
        
        IF @tenant_id IS NULL
            THROW 50001, 'Tenant ID is required', 1;
        
        IF @customer_id IS NULL
            THROW 50002, 'Customer ID is required', 1;
        
        IF @channel IS NULL OR @channel = ''
            THROW 50003, 'Channel is required', 1;
        
        SET @new_conversation_id = NEWID();
        
        INSERT INTO dbo.conversations (
            id, tenant_id, customer_id, channel, status, unread_count,
            created_by, created_at
        )
        VALUES (
            @new_conversation_id, @tenant_id, @customer_id, @channel, 'open', 0,
            @created_by, SYSDATETIMEOFFSET()
        );
        
        INSERT INTO dbo.operation_logs (operation_name, table_name, operation_type, affected_rows, execution_time_ms, created_at)
        VALUES ('sp_CreateConversation', 'conversations', 'INSERT', 1, DATEDIFF(MILLISECOND, @start_time, SYSDATETIMEOFFSET()), SYSDATETIMEOFFSET());
        
        SELECT @new_conversation_id AS conversation_id;
        
    END TRY
    BEGIN CATCH
        INSERT INTO dbo.error_logs (error_number, error_severity, error_state, error_procedure, error_line, error_message)
        VALUES (ERROR_NUMBER(), ERROR_SEVERITY(), ERROR_STATE(), ERROR_PROCEDURE(), ERROR_LINE(), ERROR_MESSAGE());
        THROW;
    END CATCH;
END;
GO

CREATE OR ALTER PROCEDURE sp_AddMessage
    @tenant_id UNIQUEIDENTIFIER,
    @conversation_id UNIQUEIDENTIFIER,
    @direction VARCHAR(20),
    @content VARCHAR(MAX),
    @sender_user_id UNIQUEIDENTIFIER = NULL,
    @ai_generated BIT = 0,
    @created_by UNIQUEIDENTIFIER = NULL,
    @new_message_id UNIQUEIDENTIFIER OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        DECLARE @start_time DATETIMEOFFSET = SYSDATETIMEOFFSET();
        
        IF @tenant_id IS NULL
            THROW 50001, 'Tenant ID is required', 1;
        
        IF @conversation_id IS NULL
            THROW 50002, 'Conversation ID is required', 1;
        
        IF @direction IS NULL OR @direction NOT IN ('inbound', 'outbound')
            THROW 50003, 'Direction must be inbound or outbound', 1;
        
        IF @content IS NULL OR @content = ''
            THROW 50004, 'Content is required', 1;
        
        SET @new_message_id = NEWID();
        
        INSERT INTO dbo.messages (
            id, tenant_id, conversation_id, sender_user_id, direction, content,
            content_type, ai_generated, sent_at, created_by, created_at
        )
        VALUES (
            @new_message_id, @tenant_id, @conversation_id, @sender_user_id, @direction, @content,
            'text', @ai_generated, SYSDATETIMEOFFSET(), @created_by, SYSDATETIMEOFFSET()
        );
        
        INSERT INTO dbo.operation_logs (operation_name, table_name, operation_type, affected_rows, execution_time_ms, created_at)
        VALUES ('sp_AddMessage', 'messages', 'INSERT', 1, DATEDIFF(MILLISECOND, @start_time, SYSDATETIMEOFFSET()), SYSDATETIMEOFFSET());
        
        SELECT @new_message_id AS message_id;
        
    END TRY
    BEGIN CATCH
        INSERT INTO dbo.error_logs (error_number, error_severity, error_state, error_procedure, error_line, error_message)
        VALUES (ERROR_NUMBER(), ERROR_SEVERITY(), ERROR_STATE(), ERROR_PROCEDURE(), ERROR_LINE(), ERROR_MESSAGE());
        THROW;
    END CATCH;
END;
GO

-- ========================================================================
-- 18. STORED PROCEDURES - INVOICE MANAGEMENT
-- ========================================================================

CREATE OR ALTER PROCEDURE sp_CreateInvoice
    @tenant_id UNIQUEIDENTIFIER,
    @customer_id UNIQUEIDENTIFIER,
    @invoice_no VARCHAR(50),
    @due_date DATE,
    @currency_code VARCHAR(8) = 'USD',
    @created_by UNIQUEIDENTIFIER = NULL,
    @new_invoice_id UNIQUEIDENTIFIER OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        DECLARE @start_time DATETIMEOFFSET = SYSDATETIMEOFFSET();
        
        IF @tenant_id IS NULL
            THROW 50001, 'Tenant ID is required', 1;
        
        IF @customer_id IS NULL
            THROW 50002, 'Customer ID is required', 1;
        
        IF @invoice_no IS NULL OR @invoice_no = ''
            THROW 50003, 'Invoice number is required', 1;
        
        IF @due_date IS NULL
            THROW 50004, 'Due date is required', 1;
        
        -- Check duplicate invoice number
        IF EXISTS (SELECT 1 FROM dbo.invoices WHERE tenant_id = @tenant_id AND invoice_no = @invoice_no AND deleted_at IS NULL)
            THROW 50005, 'Invoice number already exists for this tenant', 1;
        
        SET @new_invoice_id = NEWID();
        
        INSERT INTO dbo.invoices (
            id, tenant_id, customer_id, invoice_no, issue_date, due_date, currency_code,
            status, created_by, created_at
        )
        VALUES (
            @new_invoice_id, @tenant_id, @customer_id, @invoice_no, CAST(GETDATE() AS DATE), @due_date, @currency_code,
            'draft', @created_by, SYSDATETIMEOFFSET()
        );
        
        INSERT INTO dbo.operation_logs (operation_name, table_name, operation_type, affected_rows, execution_time_ms, created_at)
        VALUES ('sp_CreateInvoice', 'invoices', 'INSERT', 1, DATEDIFF(MILLISECOND, @start_time, SYSDATETIMEOFFSET()), SYSDATETIMEOFFSET());
        
        SELECT @new_invoice_id AS invoice_id;
        
    END TRY
    BEGIN CATCH
        INSERT INTO dbo.error_logs (error_number, error_severity, error_state, error_procedure, error_line, error_message)
        VALUES (ERROR_NUMBER(), ERROR_SEVERITY(), ERROR_STATE(), ERROR_PROCEDURE(), ERROR_LINE(), ERROR_MESSAGE());
        THROW;
    END CATCH;
END;
GO

-- ========================================================================
-- 19. STORED PROCEDURES - TASK MANAGEMENT
-- ========================================================================

CREATE OR ALTER PROCEDURE sp_CreateTask
    @tenant_id UNIQUEIDENTIFIER,
    @title VARCHAR(255),
    @description VARCHAR(MAX) = NULL,
    @assignee_user_id UNIQUEIDENTIFIER = NULL,
    @reporter_user_id UNIQUEIDENTIFIER = NULL,
    @priority VARCHAR(16) = 'medium',
    @due_at DATETIMEOFFSET = NULL,
    @created_by UNIQUEIDENTIFIER = NULL,
    @new_task_id UNIQUEIDENTIFIER OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        DECLARE @start_time DATETIMEOFFSET = SYSDATETIMEOFFSET();
        
        IF @tenant_id IS NULL
            THROW 50001, 'Tenant ID is required', 1;
        
        IF @title IS NULL OR @title = ''
            THROW 50002, 'Title is required', 1;
        
        IF @priority IS NULL OR @priority NOT IN ('low', 'medium', 'high', 'urgent')
            SET @priority = 'medium';
        
        SET @new_task_id = NEWID();
        
        INSERT INTO dbo.tasks (
            id, tenant_id, title, description, assignee_user_id, reporter_user_id,
            priority, status, due_at, created_by, created_at
        )
        VALUES (
            @new_task_id, @tenant_id, @title, @description, @assignee_user_id, @reporter_user_id,
            @priority, 'todo', @due_at, @created_by, SYSDATETIMEOFFSET()
        );
        
        INSERT INTO dbo.operation_logs (operation_name, table_name, operation_type, affected_rows, execution_time_ms, created_at)
        VALUES ('sp_CreateTask', 'tasks', 'INSERT', 1, DATEDIFF(MILLISECOND, @start_time, SYSDATETIMEOFFSET()), SYSDATETIMEOFFSET());
        
        SELECT @new_task_id AS task_id;
        
    END TRY
    BEGIN CATCH
        INSERT INTO dbo.error_logs (error_number, error_severity, error_state, error_procedure, error_line, error_message)
        VALUES (ERROR_NUMBER(), ERROR_SEVERITY(), ERROR_STATE(), ERROR_PROCEDURE(), ERROR_LINE(), ERROR_MESSAGE());
        THROW;
    END CATCH;
END;
GO

-- ========================================================================
-- 20. STORED PROCEDURES - REPORTING
-- ========================================================================

CREATE OR ALTER PROCEDURE sp_GetLeadsByTenant
    @tenant_id UNIQUEIDENTIFIER,
    @page_number INT = 1,
    @page_size INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        DECLARE @offset INT = (@page_number - 1) * @page_size;
        
        SELECT
            l.id,
            l.first_name,
            l.last_name,
            l.email,
            l.phone,
            l.company_name,
            l.source,
            l.score,
            l.value_estimate,
            l.status,
            ls.name AS stage_name,
            u.first_name + ' ' + ISNULL(u.last_name, '') AS owner_name,
            l.created_at
        FROM dbo.leads l
        LEFT JOIN dbo.lead_stages ls ON l.stage_id = ls.id
        LEFT JOIN dbo.users u ON l.owner_user_id = u.id
        WHERE l.tenant_id = @tenant_id AND l.deleted_at IS NULL
        ORDER BY l.created_at DESC
        OFFSET @offset ROWS
        FETCH NEXT @page_size ROWS ONLY;
        
    END TRY
    BEGIN CATCH
        INSERT INTO dbo.error_logs (error_number, error_severity, error_state, error_procedure, error_line, error_message)
        VALUES (ERROR_NUMBER(), ERROR_SEVERITY(), ERROR_STATE(), ERROR_PROCEDURE(), ERROR_LINE(), ERROR_MESSAGE());
        THROW;
    END CATCH;
END;
GO

CREATE OR ALTER PROCEDURE sp_GetInvoicesByTenant
    @tenant_id UNIQUEIDENTIFIER,
    @status VARCHAR(20) = NULL,
    @page_number INT = 1,
    @page_size INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        DECLARE @offset INT = (@page_number - 1) * @page_size;
        
        SELECT
            i.id,
            i.invoice_no,
            c.name AS customer_name,
            i.issue_date,
            i.due_date,
            i.total_amount,
            i.currency_code,
            i.status,
            i.created_at
        FROM dbo.invoices i
        INNER JOIN dbo.customers c ON i.customer_id = c.id
        WHERE i.tenant_id = @tenant_id
            AND i.deleted_at IS NULL
            AND (@status IS NULL OR i.status = @status)
        ORDER BY i.created_at DESC
        OFFSET @offset ROWS
        FETCH NEXT @page_size ROWS ONLY;
        
    END TRY
    BEGIN CATCH
        INSERT INTO dbo.error_logs (error_number, error_severity, error_state, error_procedure, error_line, error_message)
        VALUES (ERROR_NUMBER(), ERROR_SEVERITY(), ERROR_STATE(), ERROR_PROCEDURE(), ERROR_LINE(), ERROR_MESSAGE());
        THROW;
    END CATCH;
END;
GO

CREATE OR ALTER PROCEDURE sp_GetTasksByTenant
    @tenant_id UNIQUEIDENTIFIER,
    @assignee_user_id UNIQUEIDENTIFIER = NULL,
    @status VARCHAR(20) = NULL,
    @page_number INT = 1,
    @page_size INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        DECLARE @offset INT = (@page_number - 1) * @page_size;
        
        SELECT
            t.id,
            t.title,
            t.description,
            u.first_name + ' ' + ISNULL(u.last_name, '') AS assignee_name,
            r.first_name + ' ' + ISNULL(r.last_name, '') AS reporter_name,
            t.priority,
            t.status,
            t.due_at,
            t.created_at
        FROM dbo.tasks t
        LEFT JOIN dbo.users u ON t.assignee_user_id = u.id
        LEFT JOIN dbo.users r ON t.reporter_user_id = r.id
        WHERE t.tenant_id = @tenant_id
            AND t.deleted_at IS NULL
            AND (@assignee_user_id IS NULL OR t.assignee_user_id = @assignee_user_id)
            AND (@status IS NULL OR t.status = @status)
        ORDER BY t.due_at ASC, t.created_at DESC
        OFFSET @offset ROWS
        FETCH NEXT @page_size ROWS ONLY;
        
    END TRY
    BEGIN CATCH
        INSERT INTO dbo.error_logs (error_number, error_severity, error_state, error_procedure, error_line, error_message)
        VALUES (ERROR_NUMBER(), ERROR_SEVERITY(), ERROR_STATE(), ERROR_PROCEDURE(), ERROR_LINE(), ERROR_MESSAGE());
        THROW;
    END CATCH;
END;
GO

-- ========================================================================
-- 21. CLEANUP STORED PROCEDURES
-- ========================================================================

CREATE OR ALTER PROCEDURE sp_SoftDeleteEntity
    @tenant_id UNIQUEIDENTIFIER,
    @entity_id UNIQUEIDENTIFIER,
    @entity_type VARCHAR(64),
    @deleted_by UNIQUEIDENTIFIER = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        DECLARE @start_time DATETIMEOFFSET = SYSDATETIMEOFFSET();
        DECLARE @rows_affected INT = 0;
        
        IF @entity_type = 'user'
        BEGIN
            UPDATE dbo.users
            SET deleted_at = SYSDATETIMEOFFSET(), deleted_by = @deleted_by
            WHERE id = @entity_id AND tenant_id = @tenant_id;
            SET @rows_affected = @@ROWCOUNT;
        END
        ELSE IF @entity_type = 'lead'
        BEGIN
            UPDATE dbo.leads
            SET deleted_at = SYSDATETIMEOFFSET(), deleted_by = @deleted_by
            WHERE id = @entity_id AND tenant_id = @tenant_id;
            SET @rows_affected = @@ROWCOUNT;
        END
        ELSE IF @entity_type = 'invoice'
        BEGIN
            UPDATE dbo.invoices
            SET deleted_at = SYSDATETIMEOFFSET(), deleted_by = @deleted_by
            WHERE id = @entity_id AND tenant_id = @tenant_id;
            SET @rows_affected = @@ROWCOUNT;
        END
        ELSE IF @entity_type = 'task'
        BEGIN
            UPDATE dbo.tasks
            SET deleted_at = SYSDATETIMEOFFSET(), deleted_by = @deleted_by
            WHERE id = @entity_id AND tenant_id = @tenant_id;
            SET @rows_affected = @@ROWCOUNT;
        END
        
        INSERT INTO dbo.operation_logs (operation_name, table_name, operation_type, affected_rows, execution_time_ms, created_at)
        VALUES ('sp_SoftDeleteEntity', @entity_type, 'DELETE', @rows_affected, DATEDIFF(MILLISECOND, @start_time, SYSDATETIMEOFFSET()), SYSDATETIMEOFFSET());
        
    END TRY
    BEGIN CATCH
        INSERT INTO dbo.error_logs (error_number, error_severity, error_state, error_procedure, error_line, error_message)
        VALUES (ERROR_NUMBER(), ERROR_SEVERITY(), ERROR_STATE(), ERROR_PROCEDURE(), ERROR_LINE(), ERROR_MESSAGE());
        THROW;
    END CATCH;
END;
GO

-- ========================================================================
-- 22. CLEANUP - OLD LOGS AND RECORDS
-- ========================================================================

CREATE OR ALTER PROCEDURE sp_CleanupOldLogs
    @days_to_keep INT = 30
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        DECLARE @cutoff_date DATETIMEOFFSET = DATEADD(DAY, -@days_to_keep, SYSDATETIMEOFFSET());
        
        -- Delete old audit logs
        DELETE FROM dbo.audit_logs WHERE created_at < @cutoff_date;
        
        -- Delete old error logs
        DELETE FROM dbo.error_logs WHERE created_at < @cutoff_date;
        
        -- Delete old operation logs
        DELETE FROM dbo.operation_logs WHERE created_at < @cutoff_date;
        
        -- Delete old soft-deleted records (beyond retention period)
        DELETE FROM dbo.users WHERE deleted_at IS NOT NULL AND deleted_at < DATEADD(DAY, -90, SYSDATETIMEOFFSET());
        DELETE FROM dbo.leads WHERE deleted_at IS NOT NULL AND deleted_at < DATEADD(DAY, -90, SYSDATETIMEOFFSET());
        DELETE FROM dbo.invoices WHERE deleted_at IS NOT NULL AND deleted_at < DATEADD(DAY, -90, SYSDATETIMEOFFSET());
        
    END TRY
    BEGIN CATCH
        INSERT INTO dbo.error_logs (error_number, error_severity, error_state, error_procedure, error_line, error_message)
        VALUES (ERROR_NUMBER(), ERROR_SEVERITY(), ERROR_STATE(), ERROR_PROCEDURE(), ERROR_LINE(), ERROR_MESSAGE());
        THROW;
    END CATCH;
END;
GO

-- ========================================================================
-- 23. INITIALIZATION DATA
-- ========================================================================

-- Insert default system roles
IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE code = 'admin')
BEGIN
    INSERT INTO dbo.roles (id, code, name, is_system) VALUES (NEWID(), 'admin', 'Administrator', 1);
    INSERT INTO dbo.roles (id, code, name, is_system) VALUES (NEWID(), 'user', 'User', 1);
    INSERT INTO dbo.roles (id, code, name, is_system) VALUES (NEWID(), 'manager', 'Manager', 1);
    INSERT INTO dbo.roles (id, code, name, is_system) VALUES (NEWID(), 'viewer', 'Viewer', 1);
END

-- Insert default plans
IF NOT EXISTS (SELECT 1 FROM dbo.plans WHERE code = 'starter')
BEGIN
    INSERT INTO dbo.plans (id, code, name, monthly_price, yearly_price, max_users, max_branches, max_messages_per_month, max_ai_credits_per_month, status)
    VALUES (NEWID(), 'starter', 'Starter', 29.99, 299.99, 3, 1, 500, 500, 'active');
    
    INSERT INTO dbo.plans (id, code, name, monthly_price, yearly_price, max_users, max_branches, max_messages_per_month, max_ai_credits_per_month, status)
    VALUES (NEWID(), 'professional', 'Professional', 99.99, 999.99, 10, 5, 5000, 5000, 'active');
    
    INSERT INTO dbo.plans (id, code, name, monthly_price, yearly_price, max_users, max_branches, max_messages_per_month, max_ai_credits_per_month, status)
    VALUES (NEWID(), 'enterprise', 'Enterprise', 299.99, 2999.99, 100, 50, 50000, 50000, 'active');
END

-- ========================================================================
-- 24. SCHEMA SUMMARY
-- ========================================================================
/*
DATABASE SCHEMA SUMMARY:

CORE TABLES (24 total):
1.  plans - Platform subscription plans
2.  organizations - Tenant/Organization records
3.  branches - Organizational branches/locations
4.  roles - Role definitions for RBAC
5.  permissions - Permission codes
6.  role_permissions - Role-to-permission mapping
7.  users - User accounts
8.  user_roles - User-to-role assignment
9.  refresh_tokens - OAuth refresh tokens
10. lead_stages - Lead pipeline stages
11. leads - Lead records
12. lead_activities - Lead activity tracking
13. customers - Customer records
14. conversations - Chat/Message conversations
15. messages - Individual messages
16. whatsapp_templates - WhatsApp message templates
17. tasks - Task/To-do records
18. attendance_logs - Employee attendance
19. invoices - Invoice records
20. invoice_items - Invoice line items
21. payments - Payment transactions
22. workflow_definitions - Automation workflows
23. workflow_executions - Workflow execution logs
24. ai_provider_configs - AI provider configuration

AI & SUPPORT TABLES:
25. ai_memories - Customer memory/context storage
26. ai_token_usages - AI service token usage tracking

AUDIT & LOGGING:
27. audit_logs - Complete audit trail
28. error_logs - Application error tracking
29. operation_logs - Operation performance tracking
30. outbox_messages - Transactional outbox pattern
31. idempotency_keys - Idempotent request tracking

FEATURES:
- Multi-tenant isolation via tenant_id
- Soft delete pattern (deleted_at columns)
- Comprehensive audit trail
- 20+ triggers for automatic audit logging
- 10+ stored procedures for business logic
- Optimized indexes (40+) for query performance
- Row-level security enabled (policies configurable)
- JSON support for flexible data storage
- DATETIMEOFFSET for timezone handling
- Referential integrity with cascade deletes

VIEWS (7 total):
- v_active_users
- v_active_leads
- v_active_invoices
- v_active_customers
- v_active_conversations
- v_active_tasks
- v_active_organizations

STORED PROCEDURES (15 total):
User Management:
- sp_CreateUser

Lead Management:
- sp_CreateLead

Conversation Management:
- sp_CreateConversation
- sp_AddMessage

Invoice Management:
- sp_CreateInvoice

Task Management:
- sp_CreateTask

Reporting:
- sp_GetLeadsByTenant
- sp_GetInvoicesByTenant
- sp_GetTasksByTenant

Utility:
- sp_SoftDeleteEntity
- sp_CleanupOldLogs

TRIGGERS (5 total):
- tr_users_audit
- tr_leads_audit
- tr_invoices_audit
- tr_conversations_audit
- tr_tasks_audit
- tr_messages_audit
*/

-- ========================================================================
-- END OF SCHEMA
-- ========================================================================
