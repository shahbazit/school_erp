using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class Course : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal OptionalFee { get; set; }
    
    // Navigation
    public virtual ICollection<StudentCourse> EnrolledStudents { get; set; } = new List<StudentCourse>();
}
