using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class Department : BaseEntity
{
    public string Name { get; set; } = string.Empty; // Science, Admin, Accounts
    public bool IsActive { get; set; } = true;
}
