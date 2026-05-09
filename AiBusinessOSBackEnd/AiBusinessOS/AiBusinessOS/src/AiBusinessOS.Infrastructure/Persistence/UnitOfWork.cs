using AiBusinessOS.Application.Abstractions;

namespace AiBusinessOS.Infrastructure.Persistence;

public sealed class UnitOfWork(AiBusinessOSDbContext dbContext) : IUnitOfWork
{
    public Task<int> SaveChangesAsync(CancellationToken cancellationToken) => dbContext.SaveChangesAsync(cancellationToken);
}
