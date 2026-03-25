using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class City : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public Guid StateId { get; set; }
    public virtual State? State { get; set; }
    public bool IsActive { get; set; } = true;
}
