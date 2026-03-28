using SchoolERP.Application.DTOs.Calendar;
using SchoolERP.Application.Interfaces;
using SchoolERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace SchoolERP.Infrastructure.Services;

public class CalendarService : ICalendarService
{
    private readonly IUnitOfWork _unitOfWork;

    public CalendarService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<AcademicCalendarDto>> GetCalendar(Guid academicYearId)
    {
        return await _unitOfWork.Repository<AcademicCalendar>().GetQueryable()
            .Include(e => e.TargetClasses)
            .Include(e => e.TargetDepartments)
            .Where(e => e.AcademicYearId == academicYearId)
            .OrderBy(e => e.Date)
            .Select(e => new AcademicCalendarDto
            {
                Id = e.Id,
                Date = e.Date,
                Name = e.Name,
                Description = e.Description,
                Category = e.Category,
                IsHolidayForStudents = e.IsHolidayForStudents,
                IsHolidayForStaff = e.IsHolidayForStaff,
                AcademicYearId = e.AcademicYearId,
                IsAllClasses = e.IsAllClasses,
                TargetClassIds = e.TargetClasses.Select(tc => tc.Id).ToList(),
                TargetClassNames = e.TargetClasses.Select(tc => tc.Name).ToList(),
                IsAllStaff = e.IsAllStaff,
                TargetDepartmentIds = e.TargetDepartments.Select(td => td.Id).ToList(),
                TargetDepartmentNames = e.TargetDepartments.Select(td => td.Name).ToList()
            }).ToListAsync();
    }

    public async Task<AcademicCalendarDto?> GetEventById(Guid id)
    {
        var e = await _unitOfWork.Repository<AcademicCalendar>().GetQueryable()
            .Include(x => x.TargetClasses)
            .Include(x => x.TargetDepartments)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (e == null) return null;

        return new AcademicCalendarDto
        {
            Id = e.Id,
            Date = e.Date,
            Name = e.Name,
            Description = e.Description,
            Category = e.Category,
            IsHolidayForStudents = e.IsHolidayForStudents,
            IsHolidayForStaff = e.IsHolidayForStaff,
            AcademicYearId = e.AcademicYearId,
            IsAllClasses = e.IsAllClasses,
            TargetClassIds = e.TargetClasses.Select(tc => tc.Id).ToList(),
            TargetClassNames = e.TargetClasses.Select(tc => tc.Name).ToList(),
            IsAllStaff = e.IsAllStaff,
            TargetDepartmentIds = e.TargetDepartments.Select(td => td.Id).ToList(),
            TargetDepartmentNames = e.TargetDepartments.Select(td => td.Name).ToList()
        };
    }

    public async Task<Guid> UpsertEvent(UpsertCalendarEventDto dto)
    {
        var year = await _unitOfWork.Repository<AcademicYear>().GetByIdAsync(dto.AcademicYearId);
        if (year == null) throw new Exception("Academic Year not found");

        if (dto.Date.Date < year.StartDate.Date || dto.Date.Date > year.EndDate.Date)
            throw new Exception($"Event date ({dto.Date:yyyy-MM-dd}) is outside the academic year range ({year.StartDate:yyyy-MM-dd} to {year.EndDate:yyyy-MM-dd})");

        if (dto.EndDate.HasValue && (dto.EndDate.Value.Date < year.StartDate.Date || dto.EndDate.Value.Date > year.EndDate.Date))
            throw new Exception($"End date ({dto.EndDate:yyyy-MM-dd}) is outside the academic year range");

        var targetClasses = await GetTargetClasses(dto.TargetClassIds);
        var targetDepts = await GetTargetDepartments(dto.TargetDepartmentIds);

        if (dto.EndDate.HasValue && dto.EndDate.Value.Date > dto.Date.Date && !dto.Id.HasValue)
        {
            var createdId = Guid.Empty;
            for (var d = dto.Date.Date; d <= dto.EndDate.Value.Date; d = d.AddDays(1))
            {
                var ev = new AcademicCalendar
                {
                    Date = d,
                    Name = dto.Name,
                    Description = dto.Description,
                    Category = dto.Category,
                    IsHolidayForStudents = dto.IsHolidayForStudents,
                    IsHolidayForStaff = dto.IsHolidayForStaff,
                    AcademicYearId = dto.AcademicYearId,
                    IsAllClasses = dto.IsAllClasses,
                    TargetClasses = targetClasses,
                    IsAllStaff = dto.IsAllStaff,
                    TargetDepartments = targetDepts
                };
                await _unitOfWork.Repository<AcademicCalendar>().AddAsync(ev);
                if (d == dto.Date.Date) createdId = ev.Id;
            }
            await _unitOfWork.CompleteAsync();
            return createdId;
        }

        var repo = _unitOfWork.Repository<AcademicCalendar>();
        AcademicCalendar? entity;

        if (dto.Id.HasValue && dto.Id.Value != Guid.Empty)
        {
            entity = await repo.GetQueryable()
                .Include(e => e.TargetClasses)
                .Include(e => e.TargetDepartments)
                .FirstOrDefaultAsync(e => e.Id == dto.Id);

            if (entity == null) throw new Exception("Event not found");

            entity.Date = dto.Date;
            entity.Name = dto.Name;
            entity.Description = dto.Description;
            entity.Category = dto.Category;
            entity.IsHolidayForStudents = dto.IsHolidayForStudents;
            entity.IsHolidayForStaff = dto.IsHolidayForStaff;
            entity.AcademicYearId = dto.AcademicYearId;
            entity.IsAllClasses = dto.IsAllClasses;
            entity.IsAllStaff = dto.IsAllStaff;

            // Sync Collections
            entity.TargetClasses.Clear();
            foreach (var c in targetClasses) entity.TargetClasses.Add(c);
            
            entity.TargetDepartments.Clear();
            foreach (var d in targetDepts) entity.TargetDepartments.Add(d);

            repo.Update(entity);
        }
        else
        {
            entity = new AcademicCalendar
            {
                Date = dto.Date,
                Name = dto.Name,
                Description = dto.Description,
                Category = dto.Category,
                IsHolidayForStudents = dto.IsHolidayForStudents,
                IsHolidayForStaff = dto.IsHolidayForStaff,
                AcademicYearId = dto.AcademicYearId,
                IsAllClasses = dto.IsAllClasses,
                TargetClasses = targetClasses,
                IsAllStaff = dto.IsAllStaff,
                TargetDepartments = targetDepts
            };
            await repo.AddAsync(entity);
        }

        await _unitOfWork.CompleteAsync();
        return entity.Id;
    }

    private async Task<List<AcademicClass>> GetTargetClasses(List<Guid> ids)
    {
        if (ids == null || !ids.Any()) return new List<AcademicClass>();
        return await _unitOfWork.Repository<AcademicClass>().GetQueryable()
            .Where(c => ids.Contains(c.Id))
            .ToListAsync();
    }

    private async Task<List<Department>> GetTargetDepartments(List<Guid> ids)
    {
        if (ids == null || !ids.Any()) return new List<Department>();
        return await _unitOfWork.Repository<Department>().GetQueryable()
            .Where(d => ids.Contains(d.Id))
            .ToListAsync();
    }

    public async Task<bool> DeleteEvent(Guid id)
    {
        var repo = _unitOfWork.Repository<AcademicCalendar>();
        var entity = await repo.GetByIdAsync(id);
        if (entity == null) return false;

        repo.Delete(entity);
        await _unitOfWork.CompleteAsync();
        return true;
    }

    public async Task<int> SetupWeeklyOffs(WeeklyOffSetupDto dto)
    {
        var year = await _unitOfWork.Repository<AcademicYear>().GetByIdAsync(dto.AcademicYearId);
        if (year == null) throw new Exception("Academic Year not found");

        var repo = _unitOfWork.Repository<AcademicCalendar>();
        
        // Remove existing weekly offs for this year to avoid duplicates if re-running
        var existing = await repo.GetQueryable()
            .Where(e => e.AcademicYearId == dto.AcademicYearId && e.Category == CalendarEventType.WeeklyOff)
            .ToListAsync();
        
        foreach (var e in existing) repo.Delete(e);

        int count = 0;
        for (var date = year.StartDate.Date; date <= year.EndDate.Date; date = date.AddDays(1))
        {
            bool isOffDay = dto.DaysToOff.Contains(date.DayOfWeek);

            if (!isOffDay && date.DayOfWeek == DayOfWeek.Saturday)
            {
                int occurrence = (date.Day - 1) / 7 + 1;
                if (dto.SaturdaysToOff.Contains(occurrence))
                {
                    isOffDay = true;
                }
            }

            if (isOffDay)
            {
                string eventName = date.DayOfWeek.ToString();
                if (date.DayOfWeek == DayOfWeek.Saturday && !dto.DaysToOff.Contains(DayOfWeek.Saturday))
                {
                    int occurrence = (date.Day - 1) / 7 + 1;
                    string suffix = occurrence switch { 1 => "1st", 2 => "2nd", 3 => "3rd", 4 => "4th", 5 => "5th", _ => "" };
                    eventName += $" ({suffix})";
                }

                await repo.AddAsync(new AcademicCalendar
                {
                    Date = date,
                    Name = eventName,
                    Category = CalendarEventType.WeeklyOff,
                    IsHolidayForStudents = dto.IsHolidayForStudents,
                    IsHolidayForStaff = dto.IsHolidayForStaff,
                    AcademicYearId = dto.AcademicYearId
                });
                count++;
            }
        }

        await _unitOfWork.CompleteAsync();
        return count;
    }

    public async Task<IEnumerable<AcademicCalendarDto>> GetMonthlySchedule(Guid academicYearId, int year, int month)
    {
        var startDate = new DateTime(year, month, 1);
        var endDate = startDate.AddMonths(1).AddDays(-1);

        var events = await _unitOfWork.Repository<AcademicCalendar>().GetQueryable()
            .Where(e => e.AcademicYearId == academicYearId && e.Date >= startDate && e.Date <= endDate)
            .OrderBy(e => e.Date)
            .ToListAsync();

        return events.Select(e => new AcademicCalendarDto
        {
            Id = e.Id,
            Date = e.Date,
            Name = e.Name,
            Category = e.Category,
            IsHolidayForStaff = e.IsHolidayForStaff,
            IsHolidayForStudents = e.IsHolidayForStudents,
            AcademicYearId = e.AcademicYearId
        });
    }

    public async Task<CalendarSettingsDto> GetSettings()
    {
        var settings = await _unitOfWork.Repository<SchoolSettings>().GetQueryable().FirstOrDefaultAsync();
        if (settings == null)
        {
            return new CalendarSettingsDto
            {
                WeeklyOffDays = new List<DayOfWeek> { DayOfWeek.Sunday },
                SaturdayOffOccurrences = new List<int> { 2, 4 }
            };
        }

        return new CalendarSettingsDto
        {
            WeeklyOffDays = settings.WeeklyOffDays.Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(d => Enum.Parse<DayOfWeek>(d))
                .ToList(),
            SaturdayOffOccurrences = settings.SaturdayOffOccurrences.Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(o => int.Parse(o))
                .ToList()
        };
    }

    public async Task UpdateSettings(CalendarSettingsDto dto)
    {
        var settings = await _unitOfWork.Repository<SchoolSettings>().GetQueryable().FirstOrDefaultAsync();
        if (settings == null)
        {
            settings = new SchoolSettings();
            await _unitOfWork.Repository<SchoolSettings>().AddAsync(settings);
        }

        settings.WeeklyOffDays = string.Join(",", dto.WeeklyOffDays);
        settings.SaturdayOffOccurrences = string.Join(",", dto.SaturdayOffOccurrences);

        await _unitOfWork.CompleteAsync();
    }
}
