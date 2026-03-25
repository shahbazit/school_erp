using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class AcademicStream : BaseEntity
{
    public string Name { get; set; } = string.Empty; // e.g., "Science", "Commerce", "Arts"
    public bool IsActive { get; set; } = true;
}
