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
        var entities = await _unitOfWork.Repository<TEntity>().GetAllAsync();
        // Since we have IsActive and name, we could default order here if we knew them, but generic is fine
        return Ok(entities.Select(MapToDto));
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

    [HttpPut("{id}")]
    public virtual async Task<ActionResult> Update(Guid id, TUpdateDto dto)
    {
        var entity = await _unitOfWork.Repository<TEntity>().GetByIdAsync(id);
        if (entity == null) return NotFound();

        MapToEntity(dto, entity);
        _unitOfWork.Repository<TEntity>().Update(entity);
        await _unitOfWork.CompleteAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public virtual async Task<ActionResult> Delete(Guid id)
    {
        var entity = await _unitOfWork.Repository<TEntity>().GetByIdAsync(id);
        if (entity == null) return NotFound();

        _unitOfWork.Repository<TEntity>().Delete(entity);
        await _unitOfWork.CompleteAsync();

        return NoContent();
    }
}
