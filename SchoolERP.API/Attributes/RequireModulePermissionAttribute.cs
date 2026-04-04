using Microsoft.AspNetCore.Mvc;

namespace SchoolERP.API.Attributes;

[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, Inherited = false, AllowMultiple = true)]
public class RequireModulePermissionAttribute : TypeFilterAttribute
{
    public RequireModulePermissionAttribute(string menuKey, bool requiresWrite = false)
        : base(typeof(SchoolERP.API.Filters.PermissionAuthorizationFilter))
    {
        Arguments = new object[] { menuKey, requiresWrite };
    }
}
