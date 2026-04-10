namespace SchoolERP.Application.DTOs.Fees;

public class FeeDiscountDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = "Other";
    public string CalculationType { get; set; } = "Fixed";
    public decimal Value { get; set; }
    public string Frequency { get; set; } = "Monthly";
    public Guid? DefaultFeeHeadId { get; set; }
}

public class AssignDiscountRequest
{
    public Guid StudentId { get; set; }
    public Guid FeeDiscountId { get; set; }
    public Guid AcademicYearId { get; set; }
    public Guid? RestrictedFeeHeadId { get; set; }
    public List<Guid>? FeeHeadIds { get; set; }
    public string Remarks { get; set; } = string.Empty;
}
