using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class Country : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public bool IsActive { get; set; } = true;
}
