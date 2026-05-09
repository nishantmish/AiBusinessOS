using AiBusinessOS.Application.Leads.Dtos;
using AiBusinessOS.Shared.Common;
using MediatR;

namespace AiBusinessOS.Application.Leads.Queries.GetLeads;

public sealed record GetLeadsQuery(
    int PageNumber = 1,
    int PageSize = 20,
    string? Status = null,
    string? Search = null) : IRequest<PagedResult<LeadDto>>;
