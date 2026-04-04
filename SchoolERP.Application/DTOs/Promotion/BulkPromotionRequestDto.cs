using System.Collections.Generic;

namespace SchoolERP.Application.DTOs.Promotion;

public class BulkPromotionRequestDto
{
    public Guid? TargetClassId { get; set; }
    public Guid? TargetSectionId { get; set; }
    public string TargetAcademicYear { get; set; } = string.Empty;
    public List<PromoteStudentDto> Students { get; set; } = new List<PromoteStudentDto>();
}
