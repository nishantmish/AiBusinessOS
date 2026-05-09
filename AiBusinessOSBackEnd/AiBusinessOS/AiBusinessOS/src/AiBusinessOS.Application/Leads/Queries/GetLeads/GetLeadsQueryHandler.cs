using AiBusinessOS.Application.Abstractions;
using AiBusinessOS.Application.Leads.Dtos;
using AiBusinessOS.Shared.Common;
using MediatR;

namespace AiBusinessOS.Application.Leads.Queries.GetLeads;

public sealed class GetLeadsQueryHandler(
    ILeadRepository leadRepository,
    ICurrentTenant currentTenant) : IRequestHandler<GetLeadsQuery, PagedResult<LeadDto>>
{
    public async Task<PagedResult<LeadDto>> Handle(GetLeadsQuery request, CancellationToken cancellationToken)
    {
        var data = await leadRepository.GetPagedAsync(
            currentTenant.TenantId,
            request.PageNumber,
            request.PageSize,
            request.Status,
            request.Search,
            cancellationToken);

        return new PagedResult<LeadDto>(
            data.Items.Select(x => new LeadDto(
                x.Id, x.FirstName, x.LastName, x.Email, x.Phone, x.Source, x.Status, x.ValueEstimate, x.Score, x.CreatedAt)).ToArray(),
            data.PageNumber,
            data.PageSize,
            data.TotalCount);
    }
}
