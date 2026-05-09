using AiBusinessOS.Application.Auth.Dtos;

namespace AiBusinessOS.Application.Abstractions;

public interface IAuthService
{
    Task<AuthTokenResponse?> LoginAsync(LoginRequest request, string? ipAddress, string? userAgent, CancellationToken cancellationToken);
    Task<AuthTokenResponse?> RefreshAsync(RefreshRequest request, string? ipAddress, string? userAgent, CancellationToken cancellationToken);
    Task<bool> RevokeAsync(RevokeRequest request, Guid? requestedByUserId, CancellationToken cancellationToken);
}
