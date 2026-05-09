using MediatR;

namespace AiBusinessOS.Application.Leads.Commands.CreateLead;

public sealed record CreateLeadCommand(
    string FirstName,
    string? LastName,
    string? Email,
    string? Phone,
    string Source,
    string? CompanyName) : IRequest<Guid>;
