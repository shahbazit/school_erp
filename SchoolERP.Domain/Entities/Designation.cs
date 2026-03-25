using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class Designation : BaseEntity
{
    public string Name { get; set; } = string.Empty; // Principal, TGT, PGT, Clerk
    public bool IsActive { get; set; } = true;
}
