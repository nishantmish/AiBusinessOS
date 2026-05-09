using AiBusinessOS.Domain.Common;

namespace AiBusinessOS.Domain.Entities;

public sealed class User : BaseEntity
{
    public Guid TenantId { get; set; }
    public Guid? BranchId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string? LastName { get; set; }
    public string PasswordHash { get; set; } = string.Empty;
    public string Status { get; set; } = "active";
}
