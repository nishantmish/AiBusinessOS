using AiBusinessOS.Application.Abstractions;
using AiBusinessOS.Domain.Entities;
using AiBusinessOS.Shared.Common;
using Microsoft.EntityFrameworkCore;

namespace AiBusinessOS.Infrastructure.Persistence.Repositories;

public sealed class LeadRepository(AiBusinessOSDbContext dbContext) : ILeadRepository
{
    public async Task<Lead?> GetByIdAsync(Guid tenantId, Guid leadId, CancellationToken cancellationToken)
    {
        return await dbContext.Leads
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.TenantId == tenantId && x.Id == leadId, cancellationToken);
    }

    public async Task<PagedResult<Lead>> GetPagedAsync(Guid tenantId, int pageNumber, int pageSize, string? status, string? search, CancellationToken cancellationToken)
    {
        var query = dbContext.Leads.AsNoTracking().Where(x => x.TenantId == tenantId);

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(x => x.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(x => x.FirstName.Contains(search) || (x.LastName != null && x.LastName.Contains(search)) || (x.Email != null && x.Email.Contains(search)));
        }

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Lead>(items, pageNumber, pageSize, total);
    }

    public async Task AddAsync(Lead lead, CancellationToken cancellationToken)
    {
        await dbContext.Leads.AddAsync(lead, cancellationToken);
    }

    public void Update(Lead lead)
    {
        dbContext.Leads.Update(lead);
    }
}
