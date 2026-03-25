namespace SchoolERP.Application.DTOs.Fees;

public class ClassFeeSummaryDto
{
    public Guid ClassId { get; set; }
    public string ClassName { get; set; } = string.Empty;
    public decimal TotalAllocated { get; set; }
    public decimal TotalPaid { get; set; }
    public decimal CurrentBalance { get; set; }
    public int StudentCount { get; set; }
}

public class ClassFeeHistoryDto
{
    public Guid ClassId { get; set; }
    public string ClassName { get; set; } = string.Empty;
    public string Month { get; set; } = string.Empty;
    public string FeeHeadName { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public int StudentCount { get; set; }
    public DateTime LastPostedDate { get; set; }
}
