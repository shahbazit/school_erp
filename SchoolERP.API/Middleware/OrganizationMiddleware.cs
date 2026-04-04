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
        Guid? organizationId = null;

        // 1. Try getting from JWT Claims
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var orgClaim = context.User.FindFirst("OrganizationId")?.Value;
            if (!string.IsNullOrEmpty(orgClaim) && Guid.TryParse(orgClaim, out var parsedOrgId))
            {
                organizationId = parsedOrgId;
            }
        }

        // 2. Fallback to Header (X-Organization-Id) if claim not found OR even if found (header can override for multi-tenant switching)
        var orgHeader = context.Request.Headers["X-Organization-Id"].FirstOrDefault();
        if (!string.IsNullOrEmpty(orgHeader) && Guid.TryParse(orgHeader, out var headerOrgId))
        {
            // If we have both, we can decide priority. Usually Claim is more secure, Header is more flexible.
            // For now, let's use Header if it's there, as it's explicitly sent by our frontend interceptor.
            organizationId = headerOrgId;
        }

        if (organizationId.HasValue && organizationId.Value != Guid.Empty)
        {
            context.Items["OrganizationId"] = organizationId.Value;
            Serilog.Log.Information("OrganizationMiddleware: Resolved OrgId {OrgId} for path {Path}", organizationId.Value, context.Request.Path);
        }
        else 
        {
            Serilog.Log.Warning("OrganizationMiddleware: Could not resolve OrganizationId for path {Path}", context.Request.Path);
        }

        await _next(context);
    }
}
