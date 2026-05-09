using AiBusinessOS.Domain.Common;

namespace AiBusinessOS.Domain.Entities;

public sealed class Lead : BaseEntity
{
    public Guid TenantId { get; set; }
    public Guid? OwnerUserId { get; set; }
    public Guid? AssignedBranchId { get; set; }
    public string Source { get; set; } = string.Empty;
    public Guid? StageId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? CompanyName { get; set; }
    public short Score { get; set; }
    public decimal ValueEstimate { get; set; }
    public string Status { get; set; } = "open";
    public string? Notes { get; set; }
}
