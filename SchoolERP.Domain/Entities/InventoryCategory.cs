namespace SchoolERP.Domain.Entities;
using SchoolERP.Domain.Common;

public class InventoryCategory : BaseEntity
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
}
