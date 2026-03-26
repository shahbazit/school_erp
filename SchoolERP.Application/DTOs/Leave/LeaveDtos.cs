using System.ComponentModel.DataAnnotations;
using SchoolERP.Domain.Enums;

namespace SchoolERP.Application.DTOs.Leave;

public class LeavePlanDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public bool IsDefault { get; set; }
    public int EmployeeCount { get; set; }
    public List<LeaveTypeDto> LeaveTypes { get; set; } = new();
}

public class CreateLeavePlanDto
{
    [Required] public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class LeaveTypeDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int MaxDaysPerYear { get; set; }
    public bool IsActive { get; set; }
    
    // Policy Settings
    public bool IsMonthlyAccrual { get; set; }
    public decimal AccrualRatePerMonth { get; set; }
    public bool CanCarryForward { get; set; }
    public decimal MaxCarryForwardDays { get; set; }
    public Guid? LeavePlanId { get; set; }
}

public class CreateLeaveTypeDto
{
    [Required] public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    [Range(1, 365)] public int MaxDaysPerYear { get; set; }
    public Guid? LeavePlanId { get; set; }
    
    // Policy Settings
    public bool IsMonthlyAccrual { get; set; }
    public decimal AccrualRatePerMonth { get; set; }
    public bool CanCarryForward { get; set; }
    public decimal MaxCarryForwardDays { get; set; }
}

public class LeaveApplicationDto
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public Guid LeaveTypeId { get; set; }
    public string LeaveTypeName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal TotalDays { get; set; }
    public Guid AcademicYearId { get; set; }
    public string AcademicYearName { get; set; } = string.Empty;
    public string? Reason { get; set; }
    public LeaveDayType DayType { get; set; }
    public string DayTypeName => DayType.ToString();
    public LeaveStatus Status { get; set; }
    public string StatusName => Status.ToString();
    public Guid? ApprovedById { get; set; }
    public string? ApprovedByName { get; set; }
    public DateTime? ActionDate { get; set; }
    public string? ActionRemarks { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ApplyLeaveDto
{
    [Required] public Guid LeaveTypeId { get; set; }
    [Required] public DateTime StartDate { get; set; }
    [Required] public DateTime EndDate { get; set; }
    public LeaveDayType DayType { get; set; } = LeaveDayType.FullDay;
    public string? Reason { get; set; }
}

public class LeaveActionDto
{
    [Required] public LeaveStatus Status { get; set; }
    public string? Remarks { get; set; }
}

public class LeaveBalanceDto
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public Guid LeaveTypeId { get; set; }
    public string LeaveTypeName { get; set; } = string.Empty;
    public decimal InitialBalance { get; set; }
    public decimal TotalDays { get; set; }
    public decimal ConsumedDays { get; set; }
    public decimal RemainingDays { get; set; }
}
public class UpdateLeaveBalanceDto
{
    [Required] public Guid EmployeeId { get; set; }
    [Required] public Guid LeaveTypeId { get; set; }
    public decimal InitialBalance { get; set; }
    [Range(0, 365)] public decimal TotalDays { get; set; }
}
public class BulkInitializeLeaveBalanceDto
{
    [Required] public Guid LeaveTypeId { get; set; }
    public decimal InitialBalance { get; set; }
    [Range(0, 365)] public decimal TotalDays { get; set; }
}
