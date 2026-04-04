using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class MenuPermission : BaseEntity
{
    public string? RoleName { get; set; }
    public Guid? UserId { get; set; }
    public string MenuKey { get; set; } = string.Empty;
    public bool CanRead { get; set; } = true;
    public bool CanWrite { get; set; } = false;
}
