using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class StudentAttendance : BaseEntity
{
    public Guid StudentId { get; set; }
    public Guid ClassId { get; set; }
    public Guid SectionId { get; set; }
    public DateTime AttendanceDate { get; set; }
    public string Status { get; set; } = string.Empty; // Present, Absent, HalfDay, Leave
    public string? Remarks { get; set; }
    
    public virtual Student Student { get; set; } = null!;
}
