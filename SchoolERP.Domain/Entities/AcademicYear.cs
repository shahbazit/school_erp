using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class AcademicYear : BaseEntity
{
    public string Name { get; set; } = string.Empty; // e.g., "2024-2025"
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsCurrent { get; set; }
    public bool IsActive { get; set; } = true;
}
