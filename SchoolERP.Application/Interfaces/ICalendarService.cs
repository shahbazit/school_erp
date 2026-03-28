using SchoolERP.Application.DTOs.Calendar;

namespace SchoolERP.Application.Interfaces;

public interface ICalendarService
{
    Task<IEnumerable<AcademicCalendarDto>> GetCalendar(Guid academicYearId);
    Task<AcademicCalendarDto?> GetEventById(Guid id);
    Task<Guid> UpsertEvent(UpsertCalendarEventDto dto);
    Task<bool> DeleteEvent(Guid id);
    Task<int> SetupWeeklyOffs(WeeklyOffSetupDto dto);
    Task<IEnumerable<AcademicCalendarDto>> GetMonthlySchedule(Guid academicYearId, int year, int month);
    Task<CalendarSettingsDto> GetSettings();
    Task UpdateSettings(CalendarSettingsDto dto);
}
