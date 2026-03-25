using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class Subject : BaseEntity
{
    public string Code { get; set; } = string.Empty; // Math, Science, English
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}
