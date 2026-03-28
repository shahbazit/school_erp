using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Interfaces;
using SchoolERP.Domain.Common;

namespace SchoolERP.API.Controllers;

[Authorize]
[ApiController]
public abstract class BaseMasterController<TEntity, TDto, TCreateDto, TUpdateDto> : ControllerBase
    where TEntity : BaseEntity, new()
    where TDto : class
    where TCreateDto : class
    where TUpdateDto : class
{
    protected readonly IUnitOfWork _unitOfWork;

    protected BaseMasterController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    protected abstract TDto MapToDto(TEntity entity);
    protected abstract TEntity MapToEntity(TCreateDto dto);
    protected abstract void MapToEntity(TUpdateDto dto, TEntity entity);

    [HttpGet]
    public virtual async Task<ActionResult<IEnumerable<TDto>>> GetAll()
    {
        try
        {
            var entities = await _unitOfWork.Repository<TEntity>().GetAllAsync();
            var dtos = entities.Select(MapToDto);
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            // Log for debugging
            return StatusCode(500, new { message = "Error fetching master data", error = ex.Message, inner = ex.InnerException?.Message });
        }
    }

    [HttpGet("{id}")]
    public virtual async Task<ActionResult<TDto>> Get(Guid id)
    {
        var entity = await _unitOfWork.Repository<TEntity>().GetByIdAsync(id);
        if (entity == null) return NotFound();
        return Ok(MapToDto(entity));
    }

    [HttpPost]
    public virtual async Task<ActionResult<TDto>> Create(TCreateDto dto)
    {
        var entity = MapToEntity(dto);
        await _unitOfWork.Repository<TEntity>().AddAsync(entity);
        await _unitOfWork.CompleteAsync();
        return CreatedAtAction(nameof(Get), new { id = entity.Id }, MapToDto(entity));
    }

    [HttpPost("{id}/update")]
    public virtual async Task<ActionResult> Update(Guid id, TUpdateDto dto)
    {
        var entity = await _unitOfWork.Repository<TEntity>().GetByIdAsync(id);
        if (entity == null) return NotFound();

        MapToEntity(dto, entity);
        _unitOfWork.Repository<TEntity>().Update(entity);
        await _unitOfWork.CompleteAsync();

        return NoContent();
    }

    [HttpPost("{id}/delete")]
    public virtual async Task<ActionResult> Delete(Guid id)
    {
        var entity = await _unitOfWork.Repository<TEntity>().GetByIdAsync(id);
        if (entity == null) return NotFound();

        _unitOfWork.Repository<TEntity>().Delete(entity);
        await _unitOfWork.CompleteAsync();

        return NoContent();
    }
}
