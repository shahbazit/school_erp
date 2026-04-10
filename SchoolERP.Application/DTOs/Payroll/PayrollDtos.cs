using System.ComponentModel.DataAnnotations;
using SchoolERP.Domain.Enums;

namespace SchoolERP.Application.DTOs.Payroll;

public class SalaryComponentDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public SalaryComponentType Type { get; set; }
    public string TypeName => Type.ToString();
    public decimal Amount { get; set; }
}

public class SalaryStructureDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public decimal TotalEarnings { get; set; }
    public decimal TotalDeductions { get; set; }
    public decimal NetTotal => TotalEarnings - TotalDeductions;
    public List<SalaryComponentDto> Components { get; set; } = new();
}

public class UpsertSalaryStructureDto
{
    [Required] public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public List<UpsertSalaryComponentDto> Components { get; set; } = new();
}

public class UpsertSalaryComponentDto
{
    [Required] public string Name { get; set; } = string.Empty;
    [Required] public SalaryComponentType Type { get; set; }
    [Required] public decimal Amount { get; set; }
}

public class EmployeeSalaryDto
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public Guid SalaryStructureId { get; set; }
    public string SalaryStructureName { get; set; } = string.Empty;
    public decimal GrossSalary { get; set; }
    public decimal NetSalary { get; set; }
}

public class AssignSalaryDto
{
    [Required] public Guid EmployeeId { get; set; }
    [Required] public Guid SalaryStructureId { get; set; }
}

public class PayrollDetailDto
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public decimal GrossSalary { get; set; }
    public decimal TotalDeductions { get; set; }
    public decimal AdjustmentEarnings { get; set; }
    public decimal AdjustmentDeductions { get; set; }
    public string? AdjustmentRemarks { get; set; }
    public decimal NetSalary { get; set; }
    public string ComponentBreakdownDetails { get; set; } = "[]";
}

public class PayrollRunDto
{
    public Guid Id { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
    public DateTime ProcessedDate { get; set; }
    public string ProcessedByName { get; set; } = string.Empty;
    public PayrollStatus Status { get; set; }
    public string StatusName => Status.ToString();
    public decimal TotalAmount { get; set; }
    public int EmployeeCount { get; set; }
    public string? Remarks { get; set; }
    public List<PayrollDetailDto> Details { get; set; } = new();
}

public class ProcessPayrollDto
{
    [Required] public int Year { get; set; }
    [Required] public int Month { get; set; }
    public string? Remarks { get; set; }
    public bool ForceProcess { get; set; } = false;
}

public class PayrollValidationResultDto
{
    public bool IsValid { get; set; }
    public List<string> Errors { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
    public List<EmployeeMissingDataDto> MissingData { get; set; } = new();
    public List<string> MissingSalaries { get; set; } = new();
}

public class EmployeeMissingDataDto
{
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public List<DateTime> MissingDates { get; set; } = new();
    public List<DateTime> AbsentDates { get; set; } = new();
}
