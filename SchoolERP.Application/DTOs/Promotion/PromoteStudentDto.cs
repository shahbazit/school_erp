namespace SchoolERP.Application.DTOs.Promotion;

public class PromoteStudentDto
{
    public Guid StudentId { get; set; }
    public string Action { get; set; } = "Promote"; // Promote, Detain, PassOut, Withdraw
    public string? NewRollNumber { get; set; }
}
