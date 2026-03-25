using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class PayrollDetail : BaseEntity
{
    public Guid PayrollRunId { get; set; }
    public Guid EmployeeId { get; set; }
    public decimal GrossSalary { get; set; }
    public decimal TotalDeductions { get; set; }
    public decimal NetSalary { get; set; }
    
    // JSON snapshot of components at the time of run, so changes to structure don't break history.
    public string ComponentBreakdownDetails { get; set; } = "[]"; 

    // Navigation
    public virtual PayrollRun? PayrollRun { get; set; }
    public virtual Employee? Employee { get; set; }
}
