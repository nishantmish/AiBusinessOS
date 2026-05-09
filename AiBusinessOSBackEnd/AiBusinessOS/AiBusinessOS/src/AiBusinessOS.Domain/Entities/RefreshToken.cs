using AiBusinessOS.Domain.Common;

namespace AiBusinessOS.Domain.Entities;

public sealed class RefreshToken : BaseEntity
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string TokenHash { get; set; } = string.Empty;
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? RevokedAt { get; set; }
    public string? RevokeReason { get; set; }
    public Guid? ReplacedByTokenId { get; set; }
    public string? CreatedIp { get; set; }
    public string? UserAgent { get; set; }

    public bool IsActive => RevokedAt is null && ExpiresAt > DateTimeOffset.UtcNow;
}
