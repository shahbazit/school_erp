using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class State : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public Guid CountryId { get; set; }
    public virtual Country? Country { get; set; }
    public bool IsActive { get; set; } = true;
}
