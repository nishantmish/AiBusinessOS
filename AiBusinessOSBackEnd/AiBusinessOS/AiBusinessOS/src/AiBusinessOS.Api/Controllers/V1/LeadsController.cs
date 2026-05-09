using AiBusinessOS.Application.Leads.Commands.CreateLead;
using AiBusinessOS.Application.Leads.Queries.GetLeads;
using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AiBusinessOS.Api.Controllers.V1;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/leads")]
[Authorize]
public sealed class LeadsController(ISender sender) : ControllerBase
{
    [HttpGet]
    [Authorize(Policy = "Permission:leads.read")]
    public async Task<IActionResult> GetLeads([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20, [FromQuery] string? status = null, [FromQuery] string? search = null)
    {
        var result = await sender.Send(new GetLeadsQuery(pageNumber, pageSize, status, search));
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = "Permission:leads.write")]
    public async Task<IActionResult> CreateLead([FromBody] CreateLeadCommand command)
    {
        var leadId = await sender.Send(command);
        return CreatedAtAction(nameof(GetLeads), new { id = leadId }, new { id = leadId });
    }
}
