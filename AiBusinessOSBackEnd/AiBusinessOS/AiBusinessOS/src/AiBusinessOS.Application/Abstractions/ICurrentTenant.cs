namespace AiBusinessOS.Application.Abstractions;

public interface ICurrentTenant
{
    Guid TenantId { get; }
    Guid? UserId { get; }
}
