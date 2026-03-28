using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class Hostel : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // Boys, Girls, Staff
    public string? WardenName { get; set; }
    public string? WardenPhone { get; set; }
    public string? Address { get; set; }
    public bool IsActive { get; set; } = true;

    public virtual ICollection<HostelRoom> Rooms { get; set; } = new List<HostelRoom>();
}
