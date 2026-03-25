namespace SchoolERP.Application.DTOs.Promotion;

public class PromoteStudentDto
{
    public Guid StudentId { get; set; }
    public bool IsPromoted { get; set; } // True = Promote to next class, False = Detain (stay in current class)
    public string? NewRollNumber { get; set; }
}
