using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class AcademicSection : BaseEntity
{
    public string Name { get; set; } = string.Empty; // e.g., "A", "B", "C"
    public bool IsActive { get; set; } = true;
}
