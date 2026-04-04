using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class OrganizationMenu : BaseEntity
{
    public string MenuKey { get; set; } = string.Empty;
    public bool IsEnabled { get; set; } = true;
}
