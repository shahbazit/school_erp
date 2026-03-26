using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class LeaveType : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int MaxDaysPerYear { get; set; }
    public bool IsActive { get; set; } = true;
    
    // Policy Settings
    public bool IsMonthlyAccrual { get; set; }
    public decimal AccrualRatePerMonth { get; set; }
    public bool CanCarryForward { get; set; }
    public decimal MaxCarryForwardDays { get; set; }

    public Guid? LeavePlanId { get; set; }
    public virtual LeavePlan? LeavePlan { get; set; }
}
