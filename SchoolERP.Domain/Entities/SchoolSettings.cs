using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class SchoolSettings : BaseEntity
{
    // Comma-separated list of DayOfWeek strings (e.g. "Sunday")
    public string WeeklyOffDays { get; set; } = "Sunday";

    // Comma-separated list of Saturday occurrences (e.g. "2,4")
    public string SaturdayOffOccurrences { get; set; } = "2,4";
}
