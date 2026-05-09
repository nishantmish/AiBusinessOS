namespace AiBusinessOS.Application.Leads.Dtos;

public sealed record LeadDto(
    Guid Id,
    string FirstName,
    string? LastName,
    string? Email,
    string? Phone,
    string Source,
    string Status,
    decimal ValueEstimate,
    short Score,
    DateTimeOffset CreatedAt);
