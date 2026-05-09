namespace AiBusinessOS.Application.Auth.Dtos;

public sealed record RevokeRequest(string RefreshToken, string? Reason);
