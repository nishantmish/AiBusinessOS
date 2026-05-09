using AiBusinessOS.Domain.Entities;
using AiBusinessOS.Shared.Common;

namespace AiBusinessOS.Application.Abstractions;

public interface ILeadRepository
{
    Task<Lead?> GetByIdAsync(Guid tenantId, Guid leadId, CancellationToken cancellationToken);
    Task<PagedResult<Lead>> GetPagedAsync(Guid tenantId, int pageNumber, int pageSize, string? status, string? search, CancellationToken cancellationToken);
    Task AddAsync(Lead lead, CancellationToken cancellationToken);
    void Update(Lead lead);
}
