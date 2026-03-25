using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Domain.Entities;
using SchoolERP.Infrastructure.Persistence;

namespace SchoolERP.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class HomeworkController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public HomeworkController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Homework>>> GetHomeworks(Guid? classId, Guid? sectionId, DateTime? date)
    {
        var query = _context.Homeworks
            .Include(h => h.Class)
            .Include(h => h.Section)
            .Include(h => h.Subject)
            .AsQueryable();

        if (classId.HasValue) query = query.Where(h => h.ClassId == classId.Value);
        if (sectionId.HasValue) query = query.Where(h => h.SectionId == sectionId.Value);
        if (date.HasValue) query = query.Where(h => h.AssignDate.Date == date.Value.Date);

        return await query.OrderByDescending(h => h.AssignDate).ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Homework>> Create(Homework homework)
    {
        _context.Homeworks.Add(homework);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = homework.Id }, homework);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Homework>> GetById(Guid id)
    {
        var homework = await _context.Homeworks
            .Include(h => h.Class)
            .Include(h => h.Section)
            .Include(h => h.Subject)
            .FirstOrDefaultAsync(h => h.Id == id);

        if (homework == null) return NotFound();
        return homework;
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, Homework homework)
    {
        if (id != homework.Id) return BadRequest();
        _context.Entry(homework).State = EntityState.Modified;
        
        try {
            await _context.SaveChangesAsync();
        } catch (DbUpdateConcurrencyException) {
            if (!_context.Homeworks.Any(e => e.Id == id)) return NotFound();
            throw;
        }
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var homework = await _context.Homeworks.FindAsync(id);
        if (homework == null) return NotFound();
        
        _context.Homeworks.Remove(homework);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
