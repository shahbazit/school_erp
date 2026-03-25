using System;

namespace SchoolERP.Application.DTOs.Fees;

public class StudentFeeSubscriptionDto
{
    public Guid Id { get; set; }
    public Guid StudentId { get; set; }
    public Guid FeeHeadId { get; set; }
    public string FeeHeadName { get; set; } = string.Empty;
    public decimal? CustomAmount { get; set; }
    public bool IsActive { get; set; }
}

public class CreateStudentFeeSubscriptionRequest
{
    public Guid StudentId { get; set; }
    public Guid FeeHeadId { get; set; }
    public decimal? CustomAmount { get; set; }
    public bool IsActive { get; set; } = true;
}
