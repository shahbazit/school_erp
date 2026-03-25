using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class StudentFeeSubscription : BaseEntity
{
    public Guid StudentId { get; set; }
    public virtual Student Student { get; set; } = null!;

    public Guid FeeHeadId { get; set; }
    public virtual FeeHead FeeHead { get; set; } = null!;

    public decimal? CustomAmount { get; set; } // If we want to override the standard amount for a student
    public bool IsActive { get; set; } = true;
}
