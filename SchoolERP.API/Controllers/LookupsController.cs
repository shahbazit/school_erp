using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.DTOs.Lookup;
using SchoolERP.Application.Interfaces;
using SchoolERP.Domain.Entities;
using SchoolERP.Domain.Enums;

namespace SchoolERP.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class LookupsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public LookupsController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LookupDto>>> GetLookups([FromQuery] LookupType? type)
    {
        var query = _unitOfWork.Repository<Lookup>().GetQueryable();

        if (type.HasValue)
        {
            query = query.Where(l => l.Type == type.Value);
        }

        var lookups = await query
            .Select(l => new LookupDto
            {
                Id = l.Id,
                Type = l.Type,
                Code = l.Code,
                Name = l.Name,
                Description = l.Description,
                IsActive = l.IsActive,
                CreatedAt = l.CreatedAt
            })
            .ToListAsync();

        return Ok(lookups);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<LookupDto>> GetLookup(Guid id)
    {
        var lookup = await _unitOfWork.Repository<Lookup>().GetByIdAsync(id);

        if (lookup == null)
            return NotFound();

        return Ok(new LookupDto
        {
            Id = lookup.Id,
            Type = lookup.Type,
            Code = lookup.Code,
            Name = lookup.Name,
            Description = lookup.Description,
            IsActive = lookup.IsActive,
            CreatedAt = lookup.CreatedAt
        });
    }

    [HttpPost]
    public async Task<ActionResult<LookupDto>> CreateLookup(CreateLookupDto dto)
    {
        var query = _unitOfWork.Repository<Lookup>().GetQueryable();
        // optionally check for duplicates based on Type and Code
        var exists = await query.AnyAsync(l => l.Type == dto.Type && l.Code == dto.Code);
        if (exists)
            return BadRequest("A lookup with the same Type and Code already exists.");

        var lookup = new Lookup
        {
            Type = dto.Type,
            Code = dto.Code,
            Name = dto.Name,
            Description = dto.Description,
            IsActive = dto.IsActive
        };

        await _unitOfWork.Repository<Lookup>().AddAsync(lookup);
        await _unitOfWork.CompleteAsync();

        var createdDto = new LookupDto
        {
            Id = lookup.Id,
            Type = lookup.Type,
            Code = lookup.Code,
            Name = lookup.Name,
            Description = lookup.Description,
            IsActive = lookup.IsActive,
            CreatedAt = lookup.CreatedAt
        };

        return CreatedAtAction(nameof(GetLookup), new { id = lookup.Id }, createdDto);
    }

    [HttpPost("{id}/update")]
    public async Task<ActionResult> UpdateLookup(Guid id, UpdateLookupDto dto)
    {
        var lookup = await _unitOfWork.Repository<Lookup>().GetByIdAsync(id);

        if (lookup == null)
            return NotFound();

        // Check duplicates if code changes
        if (lookup.Code != dto.Code || lookup.Type != dto.Type)
        {
            var exists = await _unitOfWork.Repository<Lookup>().GetQueryable()
                .AnyAsync(l => l.Type == dto.Type && l.Code == dto.Code && l.Id != id);
            if (exists)
                return BadRequest("A lookup with the same Type and Code already exists.");
        }

        lookup.Type = dto.Type;
        lookup.Code = dto.Code;
        lookup.Name = dto.Name;
        lookup.Description = dto.Description;
        lookup.IsActive = dto.IsActive;

        _unitOfWork.Repository<Lookup>().Update(lookup);
        await _unitOfWork.CompleteAsync();

        return NoContent();
    }

    [HttpPost("{id}/delete")]
    public async Task<IActionResult> DeleteLookup(Guid id)
    {
        var lookup = await _unitOfWork.Repository<Lookup>().GetByIdAsync(id);

        if (lookup == null)
            return NotFound();

        // Soft delete could also be implemented if needed, but for now we physically delete or maybe physically delete is fine.
        _unitOfWork.Repository<Lookup>().Delete(lookup);
        await _unitOfWork.CompleteAsync();

        return NoContent();
    }
}
