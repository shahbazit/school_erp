using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.DTOs.Masters;
using SchoolERP.Application.Interfaces;
using SchoolERP.Domain.Entities;

namespace SchoolERP.API.Controllers;

[Route("api/masters/classes")]
public class ClassesController : BaseMasterController<AcademicClass, ClassDto, CreateClassDto, UpdateClassDto>
{
    public ClassesController(IUnitOfWork unitOfWork) : base(unitOfWork) { }

    [HttpGet]
    public override async Task<ActionResult<IEnumerable<ClassDto>>> GetAll()
    {
        var classes = await _unitOfWork.Repository<AcademicClass>().GetQueryable()
            .Select(c => new ClassDto
            {
                Id = c.Id,
                Name = c.Name,
                Order = c.Order,
                IsActive = c.IsActive,
                CreatedAt = c.CreatedAt,
                StudentCount = _unitOfWork.Repository<StudentAcademic>().GetQueryable().Count(s => s.ClassId == c.Id && s.IsCurrent)
            })
            .ToListAsync();
        return Ok(classes);
    }

    protected override ClassDto MapToDto(AcademicClass e) => new() { Id = e.Id, Name = e.Name, Order = e.Order, IsActive = e.IsActive, CreatedAt = e.CreatedAt };
    protected override AcademicClass MapToEntity(CreateClassDto d) => new() { Name = d.Name, Order = d.Order, IsActive = d.IsActive };
    protected override void MapToEntity(UpdateClassDto d, AcademicClass e) { e.Name = d.Name; e.Order = d.Order; e.IsActive = d.IsActive; }
}

[Route("api/masters/sections")]
public class SectionsController : BaseMasterController<AcademicSection, MasterDto, CreateMasterDto, UpdateMasterDto>
{
    public SectionsController(IUnitOfWork unitOfWork) : base(unitOfWork) { }
    protected override MasterDto MapToDto(AcademicSection e) => new() { Id = e.Id, Name = e.Name, IsActive = e.IsActive, CreatedAt = e.CreatedAt };
    protected override AcademicSection MapToEntity(CreateMasterDto d) => new() { Name = d.Name, IsActive = d.IsActive };
    protected override void MapToEntity(UpdateMasterDto d, AcademicSection e) { e.Name = d.Name; e.IsActive = d.IsActive; }
}

[Route("api/masters/subjects")]
public class SubjectsController : BaseMasterController<Subject, SubjectDto, CreateSubjectDto, UpdateSubjectDto>
{
    public SubjectsController(IUnitOfWork unitOfWork) : base(unitOfWork) { }
    protected override SubjectDto MapToDto(Subject e) => new() { Id = e.Id, Name = e.Name, Code = e.Code, IsActive = e.IsActive, CreatedAt = e.CreatedAt };
    protected override Subject MapToEntity(CreateSubjectDto d) => new() { Name = d.Name, Code = d.Code, IsActive = d.IsActive };
    protected override void MapToEntity(UpdateSubjectDto d, Subject e) { e.Name = d.Name; e.Code = d.Code; e.IsActive = d.IsActive; }
}

[Route("api/masters/streams")]
public class StreamsController : BaseMasterController<AcademicStream, MasterDto, CreateMasterDto, UpdateMasterDto>
{
    public StreamsController(IUnitOfWork unitOfWork) : base(unitOfWork) { }
    protected override MasterDto MapToDto(AcademicStream e) => new() { Id = e.Id, Name = e.Name, IsActive = e.IsActive, CreatedAt = e.CreatedAt };
    protected override AcademicStream MapToEntity(CreateMasterDto d) => new() { Name = d.Name, IsActive = d.IsActive };
    protected override void MapToEntity(UpdateMasterDto d, AcademicStream e) { e.Name = d.Name; e.IsActive = d.IsActive; }
}

[Route("api/masters/academic-years")]
public class AcademicYearsController : BaseMasterController<AcademicYear, AcademicYearDto, CreateAcademicYearDto, UpdateAcademicYearDto>
{
    public AcademicYearsController(IUnitOfWork unitOfWork) : base(unitOfWork) { }
    protected override AcademicYearDto MapToDto(AcademicYear e) => new() { Id = e.Id, Name = e.Name, StartDate = e.StartDate, EndDate = e.EndDate, IsCurrent = e.IsCurrent, IsActive = e.IsActive, CreatedAt = e.CreatedAt };
    protected override AcademicYear MapToEntity(CreateAcademicYearDto d) => new() { Name = d.Name, StartDate = d.StartDate, EndDate = d.EndDate, IsCurrent = d.IsCurrent, IsActive = d.IsActive };
    protected override void MapToEntity(UpdateAcademicYearDto d, AcademicYear e) { e.Name = d.Name; e.StartDate = d.StartDate; e.EndDate = d.EndDate; e.IsCurrent = d.IsCurrent; e.IsActive = d.IsActive; }
}

[Route("api/masters/departments")]
public class DepartmentsController : BaseMasterController<Department, MasterDto, CreateMasterDto, UpdateMasterDto>
{
    public DepartmentsController(IUnitOfWork unitOfWork) : base(unitOfWork) { }
    protected override MasterDto MapToDto(Department e) => new() { Id = e.Id, Name = e.Name, IsActive = e.IsActive, CreatedAt = e.CreatedAt };
    protected override Department MapToEntity(CreateMasterDto d) => new() { Name = d.Name, IsActive = d.IsActive };
    protected override void MapToEntity(UpdateMasterDto d, Department e) { e.Name = d.Name; e.IsActive = d.IsActive; }
}

[Route("api/masters/designations")]
public class DesignationsController : BaseMasterController<Designation, MasterDto, CreateMasterDto, UpdateMasterDto>
{
    public DesignationsController(IUnitOfWork unitOfWork) : base(unitOfWork) { }
    protected override MasterDto MapToDto(Designation e) => new() { Id = e.Id, Name = e.Name, IsActive = e.IsActive, CreatedAt = e.CreatedAt };
    protected override Designation MapToEntity(CreateMasterDto d) => new() { Name = d.Name, IsActive = d.IsActive };
    protected override void MapToEntity(UpdateMasterDto d, Designation e) { e.Name = d.Name; e.IsActive = d.IsActive; }
}

[Route("api/masters/roles")]
public class EmployeeRolesController : BaseMasterController<EmployeeRole, MasterWithDescDto, CreateMasterWithDescDto, UpdateMasterWithDescDto>
{
    public EmployeeRolesController(IUnitOfWork unitOfWork) : base(unitOfWork) { }
    protected override MasterWithDescDto MapToDto(EmployeeRole e) => new() { Id = e.Id, Name = e.Name, Description = e.Description, IsActive = e.IsActive, CreatedAt = e.CreatedAt };
    protected override EmployeeRole MapToEntity(CreateMasterWithDescDto d) => new() { Name = d.Name, Description = d.Description, IsActive = d.IsActive };
    protected override void MapToEntity(UpdateMasterWithDescDto d, EmployeeRole e) { e.Name = d.Name; e.Description = d.Description; e.IsActive = d.IsActive; }
}

[Route("api/masters/fee-types")]
public class FeeTypesController : BaseMasterController<FeeHead, MasterWithDescDto, CreateMasterWithDescDto, UpdateMasterWithDescDto>
{
    public FeeTypesController(IUnitOfWork unitOfWork) : base(unitOfWork) { }
    protected override MasterWithDescDto MapToDto(FeeHead e) => new() { Id = e.Id, Name = e.Name, Description = e.Description, IsActive = e.IsActive, CreatedAt = e.CreatedAt };
    protected override FeeHead MapToEntity(CreateMasterWithDescDto d) => new() { Name = d.Name, Description = d.Description, IsActive = d.IsActive };
    protected override void MapToEntity(UpdateMasterWithDescDto d, FeeHead e) { e.Name = d.Name; e.Description = d.Description; e.IsActive = d.IsActive; }
}

[Route("api/masters/rooms")]
public class RoomsController : BaseMasterController<Room, RoomDto, CreateRoomDto, UpdateRoomDto>
{
    public RoomsController(IUnitOfWork unitOfWork) : base(unitOfWork) { }
    protected override RoomDto MapToDto(Room e) => new() { Id = e.Id, RoomNo = e.RoomNo, Type = e.Type, Capacity = e.Capacity, IsActive = e.IsActive };
    protected override Room MapToEntity(CreateRoomDto d) => new() { RoomNo = d.RoomNo, Type = d.Type, Capacity = d.Capacity, IsActive = d.IsActive };
    protected override void MapToEntity(UpdateRoomDto d, Room e) { e.RoomNo = d.RoomNo; e.Type = d.Type; e.Capacity = d.Capacity; e.IsActive = d.IsActive; }
}

[Route("api/masters/labs")]
public class LabsController : BaseMasterController<Lab, MasterWithDescDto, CreateMasterWithDescDto, UpdateMasterWithDescDto>
{
    public LabsController(IUnitOfWork unitOfWork) : base(unitOfWork) { }
    protected override MasterWithDescDto MapToDto(Lab e) => new() { Id = e.Id, Name = e.Name, Description = e.Description, IsActive = e.IsActive, CreatedAt = e.CreatedAt };
    protected override Lab MapToEntity(CreateMasterWithDescDto d) => new() { Name = d.Name, Description = d.Description, IsActive = d.IsActive };
    protected override void MapToEntity(UpdateMasterWithDescDto d, Lab e) { e.Name = d.Name; e.Description = d.Description; e.IsActive = d.IsActive; }
}

[Route("api/masters/countries")]
public class CountriesController : BaseMasterController<Country, CountryDto, CreateCountryDto, UpdateCountryDto>
{
    public CountriesController(IUnitOfWork unitOfWork) : base(unitOfWork) { }
    protected override CountryDto MapToDto(Country e) => new() { Id = e.Id, Name = e.Name, Code = e.Code, IsActive = e.IsActive, CreatedAt = e.CreatedAt };
    protected override Country MapToEntity(CreateCountryDto d) => new() { Name = d.Name, Code = d.Code, IsActive = d.IsActive };
    protected override void MapToEntity(UpdateCountryDto d, Country e) { e.Name = d.Name; e.Code = d.Code; e.IsActive = d.IsActive; }
}

[Route("api/masters/states")]
public class StatesController : BaseMasterController<State, StateDto, CreateStateDto, UpdateStateDto>
{
    public StatesController(IUnitOfWork unitOfWork) : base(unitOfWork) { }
    protected override StateDto MapToDto(State e) => new() { Id = e.Id, Name = e.Name, CountryId = e.CountryId, IsActive = e.IsActive, CreatedAt = e.CreatedAt };
    protected override State MapToEntity(CreateStateDto d) => new() { Name = d.Name, CountryId = d.CountryId, IsActive = d.IsActive };
    protected override void MapToEntity(UpdateStateDto d, State e) { e.Name = d.Name; e.CountryId = d.CountryId; e.IsActive = d.IsActive; }
}

[Route("api/masters/cities")]
public class CitiesController : BaseMasterController<City, CityDto, CreateCityDto, UpdateCityDto>
{
    public CitiesController(IUnitOfWork unitOfWork) : base(unitOfWork) { }
    protected override CityDto MapToDto(City e) => new() { Id = e.Id, Name = e.Name, StateId = e.StateId, IsActive = e.IsActive, CreatedAt = e.CreatedAt };
    protected override City MapToEntity(CreateCityDto d) => new() { Name = d.Name, StateId = d.StateId, IsActive = d.IsActive };
    protected override void MapToEntity(UpdateCityDto d, City e) { e.Name = d.Name; e.StateId = d.StateId; e.IsActive = d.IsActive; }
}
