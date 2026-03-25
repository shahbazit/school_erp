using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class EmployeeSalary : BaseEntity
{
    public Guid EmployeeId { get; set; }
    public Guid SalaryStructureId { get; set; }
    public decimal GrossSalary { get; set; }
    public decimal NetSalary { get; set; }
    
    // Navigation
    public virtual Employee? Employee { get; set; }
    public virtual SalaryStructure? SalaryStructure { get; set; }
}
