using SchoolERP.Domain.Common;
using SchoolERP.Domain.Enums;

namespace SchoolERP.Domain.Entities;

public class SalaryComponent : BaseEntity
{
    public Guid SalaryStructureId { get; set; }
    public string Name { get; set; } = string.Empty; // e.g., Basic, HRA, PF
    public SalaryComponentType Type { get; set; }
    
    // Amount can be absolute or a percentage of something else (simplified for now as absolute)
    public decimal Amount { get; set; }
    
    // Navigation
    public virtual SalaryStructure? SalaryStructure { get; set; }
}
