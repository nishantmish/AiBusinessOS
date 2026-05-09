using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using AiBusinessOS.Application.Abstractions;
using AiBusinessOS.Application.Auth.Dtos;
using AiBusinessOS.Domain.Entities;
using AiBusinessOS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace AiBusinessOS.Infrastructure.Security;

public sealed class AuthService(AiBusinessOSDbContext dbContext, IConfiguration configuration) : IAuthService
{
    public async Task<AuthTokenResponse?> LoginAsync(LoginRequest request, string? ipAddress, string? userAgent, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(x =>
                x.Email.ToLower() == normalizedEmail &&
                x.Status == "active" &&
                (!request.TenantId.HasValue || x.TenantId == request.TenantId.Value), cancellationToken);

        if (user is null || !VerifyPassword(request.Password, user.PasswordHash))
        {
            return null;
        }

        var (refreshToken, refreshTokenEntity) = CreateRefreshToken(user, ipAddress, userAgent);
        dbContext.RefreshTokens.Add(refreshTokenEntity);
        await dbContext.SaveChangesAsync(cancellationToken);

        return BuildTokenResponse(user, refreshToken, refreshTokenEntity.ExpiresAt);
    }

    public async Task<AuthTokenResponse?> RefreshAsync(RefreshRequest request, string? ipAddress, string? userAgent, CancellationToken cancellationToken)
    {
        var tokenHash = ComputeSha256(request.RefreshToken);
        var existingToken = await dbContext.RefreshTokens
            .FirstOrDefaultAsync(x => x.TokenHash == tokenHash, cancellationToken);

        if (existingToken is null || !existingToken.IsActive)
        {
            return null;
        }

        var user = await dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == existingToken.UserId && x.Status == "active", cancellationToken);

        if (user is null)
        {
            return null;
        }

        existingToken.RevokedAt = DateTimeOffset.UtcNow;
        existingToken.RevokeReason = "rotated";
        existingToken.UpdatedAt = DateTimeOffset.UtcNow;

        var (newRefreshToken, newRefreshTokenEntity) = CreateRefreshToken(user, ipAddress, userAgent);
        existingToken.ReplacedByTokenId = newRefreshTokenEntity.Id;
        dbContext.RefreshTokens.Add(newRefreshTokenEntity);
        await dbContext.SaveChangesAsync(cancellationToken);

        return BuildTokenResponse(user, newRefreshToken, newRefreshTokenEntity.ExpiresAt);
    }

    public async Task<bool> RevokeAsync(RevokeRequest request, Guid? requestedByUserId, CancellationToken cancellationToken)
    {
        var tokenHash = ComputeSha256(request.RefreshToken);
        var existingToken = await dbContext.RefreshTokens
            .FirstOrDefaultAsync(x => x.TokenHash == tokenHash, cancellationToken);

        if (existingToken is null || !existingToken.IsActive)
        {
            return false;
        }

        if (requestedByUserId.HasValue && existingToken.UserId != requestedByUserId.Value)
        {
            return false;
        }

        existingToken.RevokedAt = DateTimeOffset.UtcNow;
        existingToken.RevokeReason = string.IsNullOrWhiteSpace(request.Reason) ? "manual_revoke" : request.Reason;
        existingToken.UpdatedAt = DateTimeOffset.UtcNow;
        existingToken.UpdatedBy = requestedByUserId;

        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    private AuthTokenResponse BuildTokenResponse(User user, string refreshToken, DateTimeOffset refreshTokenExpiresAt)
    {
        var accessTokenMinutes = int.TryParse(configuration["Jwt:AccessTokenMinutes"], out var configuredMinutes)
            ? configuredMinutes
            : 15;
        var accessTokenExpiresAt = DateTimeOffset.UtcNow.AddMinutes(accessTokenMinutes);
        var accessToken = CreateAccessToken(user, accessTokenExpiresAt.UtcDateTime);
        return new AuthTokenResponse(accessToken, accessTokenExpiresAt, refreshToken, refreshTokenExpiresAt);
    }

    private (string rawToken, RefreshToken entity) CreateRefreshToken(User user, string? ipAddress, string? userAgent)
    {
        var refreshTokenDays = int.TryParse(configuration["Jwt:RefreshTokenDays"], out var configuredDays)
            ? configuredDays
            : 14;
        var rawRefreshToken = CreateSecureToken();
        var refreshTokenEntity = new RefreshToken
        {
            Id = Guid.NewGuid(),
            TenantId = user.TenantId,
            UserId = user.Id,
            TokenHash = ComputeSha256(rawRefreshToken),
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(refreshTokenDays),
            CreatedAt = DateTimeOffset.UtcNow,
            CreatedBy = user.Id,
            CreatedIp = ipAddress,
            UserAgent = userAgent
        };

        return (rawRefreshToken, refreshTokenEntity);
    }

    private string CreateAccessToken(User user, DateTime expiresAtUtc)
    {
        var jwt = configuration.GetSection("Jwt");
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new("tenant_id", user.TenantId.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: jwt["Issuer"],
            audience: jwt["Audience"],
            claims: claims,
            expires: expiresAtUtc,
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string CreateSecureToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(bytes);
    }

    private static string ComputeSha256(string value)
    {
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(value));
        return Convert.ToHexString(hash);
    }

    private static bool VerifyPassword(string providedPassword, string storedHash)
    {
        if (string.IsNullOrWhiteSpace(storedHash))
        {
            return false;
        }

        // Supports bcrypt hashes and allows local/plain values in early bootstrap environments.
        if (storedHash.StartsWith("$2", StringComparison.Ordinal))
        {
            return BCrypt.Net.BCrypt.Verify(providedPassword, storedHash);
        }

        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(providedPassword),
            Encoding.UTF8.GetBytes(storedHash));
    }
}
