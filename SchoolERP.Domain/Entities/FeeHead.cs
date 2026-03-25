using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class FeeHead : BaseEntity
{
    public string Name { get; set; } = string.Empty; // e.g., Tuition Fee, Bus Fee, Library Fee
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsSelective { get; set; } // If True, only students subscribed to this head will be charged
}
