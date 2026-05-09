using Microsoft.AspNetCore.RateLimiting;
using Yarp.ReverseProxy.Transforms;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("gateway-limit", config =>
    {
        config.PermitLimit = 200;
        config.Window = TimeSpan.FromMinutes(1);
        config.QueueLimit = 20;
    });
});

builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"))
    .AddTransforms(builderContext =>
    {
        builderContext.AddRequestTransform(transformContext =>
        {
            if (!transformContext.ProxyRequest.Headers.Contains("X-Tenant-Id") &&
                transformContext.HttpContext.Request.Headers.TryGetValue("X-Tenant-Id", out var tenant))
            {
                transformContext.ProxyRequest.Headers.Add("X-Tenant-Id", tenant.ToString());
            }

            return ValueTask.CompletedTask;
        });
    });

var app = builder.Build();
app.UseRateLimiter();
app.MapReverseProxy(proxyPipeline =>
{
    proxyPipeline.Use((context, next) =>
    {
        context.Request.Headers["X-Correlation-Id"] = context.TraceIdentifier;
        return next();
    });
}).RequireRateLimiting("gateway-limit");

app.Run();
