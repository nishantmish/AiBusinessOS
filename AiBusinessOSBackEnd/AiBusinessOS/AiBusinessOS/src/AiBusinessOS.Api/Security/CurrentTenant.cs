using System.Security.Claims;
using AiBusinessOS.Application.Abstractions;

namespace AiBusinessOS.Api.Security;

public sealed class CurrentTenant(IHttpContextAccessor httpContextAccessor) : ICurrentTenant
{
    public Guid TenantId
    {
        get
        {
            var context = httpContextAccessor.HttpContext;
            var tenantClaim = context?.User.FindFirstValue("tenant_id");
            if (Guid.TryParse(tenantClaim, out var tenantId))
            {
                return tenantId;
            }

            var tenantHeader = context?.Request.Headers["X-Tenant-Id"].FirstOrDefault();
            if (Guid.TryParse(tenantHeader, out tenantId))
            {
                return tenantId;
            }

            throw new UnauthorizedAccessException("Tenant context is missing.");
        }
    }

    public Guid? UserId
    {
        get
        {
            var userId = httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(userId, out var parsed) ? parsed : null;
        }
    }
}
