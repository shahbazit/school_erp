using System.Collections.Generic;
using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class SalaryStructure : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    
    // Navigation
    public virtual ICollection<SalaryComponent> Components { get; set; } = new List<SalaryComponent>();
}
