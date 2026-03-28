using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class HostelAssignment : BaseEntity
{
    public Guid StudentId { get; set; }
    public Guid? EmployeeId { get; set; }
    public Guid RoomId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsActive { get; set; } = true;

    public virtual Student Student { get; set; } = null!;
    public virtual Employee? Employee { get; set; }
    public virtual HostelRoom Room { get; set; } = null!;
}
