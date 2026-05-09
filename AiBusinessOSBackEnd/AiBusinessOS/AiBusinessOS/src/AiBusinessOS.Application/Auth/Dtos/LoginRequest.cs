namespace AiBusinessOS.Application.Auth.Dtos;

public sealed record LoginRequest(string Email, string Password, Guid? TenantId);
