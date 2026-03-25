using Microsoft.AspNetCore.Http;
using SchoolERP.Application.Interfaces;
using System.Security.Claims;

namespace SchoolERP.API.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? UserId
    {
        get
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirstValue("id");
            return Guid.TryParse(userIdClaim, out var userId) ? userId : null;
        }
    }
}
