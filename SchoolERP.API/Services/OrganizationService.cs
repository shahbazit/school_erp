using Microsoft.AspNetCore.Http;
using SchoolERP.Application.Interfaces;

namespace SchoolERP.API.Services;

public class OrganizationService : IOrganizationService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public OrganizationService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid GetOrganizationId()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null)
            return Guid.Empty;

        // Try getting from Items populated by OrganizationMiddleware
        if (httpContext.Items.TryGetValue("OrganizationId", out var orgIdObj) && orgIdObj is Guid organizationId)
        {
            return organizationId;
        }

        return Guid.Empty; 
    }
}
