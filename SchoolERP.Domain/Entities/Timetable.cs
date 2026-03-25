using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class Timetable : BaseEntity
{
    public Guid AcademicYearId { get; set; }
    public Guid ClassId { get; set; }
    public Guid SectionId { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public virtual AcademicYear? AcademicYear { get; set; }
    public virtual AcademicClass? Class { get; set; }
    public virtual AcademicSection? Section { get; set; }
    public virtual ICollection<TimetableDetail> Periods { get; set; } = new List<TimetableDetail>();
}
