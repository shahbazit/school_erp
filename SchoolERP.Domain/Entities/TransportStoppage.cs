using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class TransportStoppage : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public decimal Cost { get; set; }
    public bool IsActive { get; set; } = true;
}
