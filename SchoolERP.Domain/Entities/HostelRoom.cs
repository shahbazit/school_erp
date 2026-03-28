using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class HostelRoom : BaseEntity
{
    public Guid HostelId { get; set; }
    public string RoomNo { get; set; } = string.Empty;
    public string? RoomType { get; set; } // Single, Double, Triple
    public int Capacity { get; set; }
    public decimal CostPerMonth { get; set; }
    public bool IsActive { get; set; } = true;

    public virtual Hostel Hostel { get; set; } = null!;
}
