namespace SchoolERP.Application.DTOs.Fees;

public class FeeStructureDto
{
    public Guid Id { get; set; }
    public Guid FeeHeadId { get; set; }
    public string FeeHeadName { get; set; } = string.Empty;
    public Guid ClassId { get; set; }
    public string ClassName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Frequency { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class CreateFeeStructureRequest
{
    public Guid FeeHeadId { get; set; }
    public Guid ClassId { get; set; }
    public decimal Amount { get; set; }
    public string Frequency { get; set; } = "Monthly";
    public string? Description { get; set; }
}
