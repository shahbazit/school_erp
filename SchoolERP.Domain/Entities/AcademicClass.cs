using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class AcademicClass : BaseEntity
{
    public string Name { get; set; } = string.Empty; // e.g., "1", "2", "3", "12"
    public int Order { get; set; } // For sorting classes correctly
    public bool IsActive { get; set; } = true;

    public virtual ICollection<SubjectBook> SubjectBooks { get; set; } = new List<SubjectBook>();
}
