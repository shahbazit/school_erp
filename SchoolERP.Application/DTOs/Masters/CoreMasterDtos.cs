using System.ComponentModel.DataAnnotations;

namespace SchoolERP.Application.DTOs.Masters;

// AcademicClass
public class CreateClassDto : CreateMasterDto { public int Order { get; set; } }
public class UpdateClassDto : UpdateMasterDto { public int Order { get; set; } }
public class ClassDto : MasterDto { public int Order { get; set; } }

// Subject
public class CreateSubjectDto : CreateMasterDto { public string Code { get; set; } = string.Empty; }
public class UpdateSubjectDto : UpdateMasterDto { public string Code { get; set; } = string.Empty; }
public class SubjectDto : MasterDto { public string Code { get; set; } = string.Empty; }

// AcademicYear
public class CreateAcademicYearDto : CreateMasterDto 
{ 
    public DateTime StartDate { get; set; } 
    public DateTime EndDate { get; set; } 
    public bool IsCurrent { get; set; } 
}
public class UpdateAcademicYearDto : UpdateMasterDto 
{ 
    public DateTime StartDate { get; set; } 
    public DateTime EndDate { get; set; } 
    public bool IsCurrent { get; set; } 
}
public class AcademicYearDto : MasterDto 
{ 
    public DateTime StartDate { get; set; } 
    public DateTime EndDate { get; set; } 
    public bool IsCurrent { get; set; } 
}

// Room
public class CreateRoomDto { public string RoomNo { get; set; } = string.Empty; public string? Type { get; set; } public int Capacity { get; set; } public bool IsActive { get; set; } = true; }
public class UpdateRoomDto { public string RoomNo { get; set; } = string.Empty; public string? Type { get; set; } public int Capacity { get; set; } public bool IsActive { get; set; } }
public class RoomDto { public Guid Id { get; set; } public string RoomNo { get; set; } = string.Empty; public string? Type { get; set; } public int Capacity { get; set; } public bool IsActive { get; set; } }

// Lab & EmployeeRole & Department & Designation & Stream & Section & FeeType
// All these just use GenericMasterDto since they only have Name and maybe Description.

public class CreateMasterWithDescDto : CreateMasterDto { public string? Description { get; set; } }
public class UpdateMasterWithDescDto : UpdateMasterDto { public string? Description { get; set; } }
public class MasterWithDescDto : MasterDto { public string? Description { get; set; } }

// Countries, States, Cities
public class CreateCountryDto : CreateMasterDto { public string? Code { get; set; } }
public class UpdateCountryDto : UpdateMasterDto { public string? Code { get; set; } }
public class CountryDto : MasterDto { public string? Code { get; set; } }

public class CreateStateDto : CreateMasterDto { public Guid CountryId { get; set; } }
public class UpdateStateDto : UpdateMasterDto { public Guid CountryId { get; set; } }
public class StateDto : MasterDto { public Guid CountryId { get; set; } }

public class CreateCityDto : CreateMasterDto { public Guid StateId { get; set; } }
public class UpdateCityDto : UpdateMasterDto { public Guid StateId { get; set; } }
public class CityDto : MasterDto { public Guid StateId { get; set; } }
