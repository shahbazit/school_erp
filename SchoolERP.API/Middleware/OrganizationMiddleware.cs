using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace SchoolERP.API.Middleware;

public class OrganizationMiddleware
{
    private readonly RequestDelegate _next;

    public OrganizationMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Add OrganizationId from JWT to context items if present
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var orgClaim = context.User.FindFirst("OrganizationId")?.Value;
            if (!string.IsNullOrEmpty(orgClaim) && Guid.TryParse(orgClaim, out var organizationId))
            {
                context.Items["OrganizationId"] = organizationId;
            }
        }
        else
        {
            // For endpoints that don't require auth (Login/Register), parse from header
            var orgHeader = context.Request.Headers["X-Organization-Id"].FirstOrDefault();
            if (!string.IsNullOrEmpty(orgHeader) && Guid.TryParse(orgHeader, out var organizationId))
            {
                context.Items["OrganizationId"] = organizationId;
            }
        }

        await _next(context);
    }
}
