namespace SchoolERP.Application.DTOs.Fees;

public class GenerateChargesRequest
{
    public List<Guid> ClassIds { get; set; } = new();
    public string Month { get; set; } = string.Empty;
    public Guid? AcademicYearId { get; set; }
    public List<Guid>? FeeHeadIds { get; set; }
}
