using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;

namespace AiBusinessOS.Api.Controllers.V1;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/webhooks")]
public sealed class WebhooksController(ILogger<WebhooksController> logger) : ControllerBase
{
    [HttpPost("ingest")]
    public IActionResult Ingest([FromBody] object payload, [FromHeader(Name = "X-Webhook-Signature")] string? signature)
    {
        if (string.IsNullOrWhiteSpace(signature))
        {
            return Unauthorized(new { message = "Missing webhook signature." });
        }

        logger.LogInformation("Webhook received with trace {TraceId}", HttpContext.TraceIdentifier);
        return Accepted(new { status = "queued", traceId = HttpContext.TraceIdentifier, payload });
    }
}
