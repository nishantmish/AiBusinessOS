# AiBusinessOS Clean Architecture (SQL Server)

## Folder Structure

- `src/AiBusinessOS.Gateway` - API gateway, routing, throttling, tenant header propagation
- `src/AiBusinessOS.Api` - presentation layer (controllers, middleware, auth, swagger)
- `src/AiBusinessOS.Application` - CQRS, validation, use-cases, contracts
- `src/AiBusinessOS.Domain` - entities, domain rules, domain events
- `src/AiBusinessOS.Infrastructure` - EF Core SQL Server, repositories, outbox processors
- `src/AiBusinessOS.Shared` - common response/paging/contracts
- `docs` - architecture and operational guidelines

## Request Flow

1. Client sends request to gateway with JWT and `X-Tenant-Id`.
2. Gateway applies rate limit, adds correlation id, forwards to API.
3. API authenticates JWT, resolves tenant/user context, applies permission policy.
4. Controller sends command/query to MediatR.
5. Validation pipeline runs FluentValidation.
6. Handler calls repository/unit of work.
7. EF Core runs SQL Server transaction and writes data.
8. Response returns with normalized payload and status code.

## Security

- JWT bearer auth with issuer, audience, symmetric signing key
- Permission policy checks using claim-based authorization
- Tenant scoping from claim or header (`ICurrentTenant`)
- Global exception middleware avoids leaking internals
- Parameterized SQL via EF Core/Dapper to prevent SQL injection

## Database and Performance

- Maintain existing filtered indexes for `deleted_at IS NULL`
- Keep write-heavy tables (`messages`, `lead_activities`) with composite indexes by tenant + time
- Add covering indexes for top reporting procedures where scan rate is high
- Use stored procedures for high-volume writes and invoice posting workflows
- Add EF Core migrations only for application-owned delta changes
- Keep outbox table polled by background worker with batch locking

## Next Implementation Steps

1. Add full authentication module (`login`, `refresh`, `revoke`) using `refresh_tokens`.
2. Add RBAC administration module for roles/permissions.
3. Implement domain events + outbox publisher for lead/conversation/task events.
4. Add webhook ingestion endpoints with signature validation and idempotency keys.
5. Add background worker for outbox dispatch and cleanup procedures.
