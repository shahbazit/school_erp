using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.DTOs.Calendar;
using SchoolERP.Application.Interfaces;

namespace SchoolERP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CalendarController : ControllerBase
{
    private readonly ICalendarService _calendarService;

    public CalendarController(ICalendarService calendarService)
    {
        _calendarService = calendarService;
    }

    [HttpGet("{academicYearId}")]
    public async Task<IActionResult> GetCalendar(Guid academicYearId)
    {
        var events = await _calendarService.GetCalendar(academicYearId);
        return Ok(events);
    }

    [HttpGet("event/{id}")]
    public async Task<IActionResult> GetEvent(Guid id)
    {
        var e = await _calendarService.GetEventById(id);
        if (e == null) return NotFound();
        return Ok(e);
    }

    [HttpPost]
    public async Task<IActionResult> UpsertEvent(UpsertCalendarEventDto dto)
    {
        var id = await _calendarService.UpsertEvent(dto);
        return Ok(new { Id = id });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEvent(Guid id)
    {
        var result = await _calendarService.DeleteEvent(id);
        if (!result) return NotFound();
        return Ok();
    }

    [HttpPost("setup-weekly-offs")]
    public async Task<IActionResult> SetupWeeklyOffs(WeeklyOffSetupDto dto)
    {
        var count = await _calendarService.SetupWeeklyOffs(dto);
        return Ok(new { Count = count });
    }

    [HttpGet("settings")]
    public async Task<IActionResult> GetSettings()
    {
        var settings = await _calendarService.GetSettings();
        return Ok(settings);
    }

    [HttpPost("settings")]
    public async Task<IActionResult> UpdateSettings(CalendarSettingsDto dto)
    {
        await _calendarService.UpdateSettings(dto);
        return Ok();
    }
}
