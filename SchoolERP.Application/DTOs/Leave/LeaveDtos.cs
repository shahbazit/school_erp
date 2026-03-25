using System.ComponentModel.DataAnnotations;
using SchoolERP.Domain.Enums;

namespace SchoolERP.Application.DTOs.Leave;

public class LeaveTypeDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int MaxDaysPerYear { get; set; }
    public bool IsActive { get; set; }
}

public class CreateLeaveTypeDto
{
    [Required] public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    [Range(1, 365)] public int MaxDaysPerYear { get; set; }
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
    public string? Reason { get; set; }
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
    public decimal TotalDays { get; set; }
    public decimal ConsumedDays { get; set; }
    public decimal RemainingDays { get; set; }
}
