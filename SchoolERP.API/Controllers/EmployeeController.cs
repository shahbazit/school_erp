using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.DTOs.Employee;
using SchoolERP.Application.Interfaces;
using SchoolERP.Domain.Entities;
using SchoolERP.Domain.Enums;
using SchoolERP.Application.DTOs.Teacher;

namespace SchoolERP.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class EmployeeController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAuthService _authService;
    private readonly IOrganizationService _organizationService;

    public EmployeeController(IUnitOfWork unitOfWork, IAuthService authService, IOrganizationService organizationService)
    {
        _unitOfWork = unitOfWork;
        _authService = authService;
        _organizationService = organizationService;
    }

    // ─────────────────────────────────────────────────────
    // GET /api/employee/me – Get current user's employee profile
    // ─────────────────────────────────────────────────────
    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile()
    {
        var userIdClaim = User.FindFirst("id")?.Value;
        if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

        var userId = Guid.Parse(userIdClaim);
        var employee = await _unitOfWork.Repository<Employee>().GetQueryable()
            .Include(e => e.Department)
            .Include(e => e.Designation)
            .Include(e => e.EmployeeRole)
            .Include(e => e.Documents)
            .Include(e => e.TeacherProfile)
            .FirstOrDefaultAsync(e => e.UserId == userId);

        if (employee == null) return NotFound("Employee profile not found for this user.");

        return Ok(MapToDetailedDto(employee));
    }

    // ─────────────────────────────────────────────────────
    // GET /api/employee  – Paginated list with search & filters
    // ─────────────────────────────────────────────────────
    [HttpGet]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> GetAll(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] Guid? departmentId = null,
        [FromQuery] Guid? designationId = null,
        [FromQuery] Guid? employeeRoleId = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] EmploymentType? employmentType = null,
        [FromQuery] string sortBy = "Name"
    )
    {
        var query = _unitOfWork.Repository<Employee>().GetQueryable()
            .Include(e => e.Department)
            .Include(e => e.Designation)
            .Include(e => e.EmployeeRole)
            .Include(e => e.Documents)
            .Include(e => e.TeacherProfile)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(e =>
                (e.FirstName + " " + e.LastName).Contains(search) ||
                e.EmployeeCode.Contains(search) ||
                e.WorkEmail.Contains(search) ||
                e.MobileNumber.Contains(search));
        }

        if (departmentId.HasValue)    query = query.Where(e => e.DepartmentId == departmentId.Value);
        if (designationId.HasValue)   query = query.Where(e => e.DesignationId == designationId.Value);
        if (employeeRoleId.HasValue)  query = query.Where(e => e.EmployeeRoleId == employeeRoleId.Value);
        if (isActive.HasValue)        query = query.Where(e => e.IsActive == isActive.Value);
        if (employmentType.HasValue)  query = query.Where(e => e.EmploymentType == employmentType.Value);

        query = sortBy.ToLower() switch
        {
            "code"        => query.OrderBy(e => e.EmployeeCode),
            "joining"     => query.OrderBy(e => e.DateOfJoining),
            "department"  => query.OrderBy(e => e.Department != null ? e.Department.Name : string.Empty),
            _             => query.OrderBy(e => e.FirstName).ThenBy(e => e.LastName)
        };

        var totalRecords = await query.CountAsync();
        var employees = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new
        {
            data = employees.Select(MapToDto),
            totalRecords,
            pageNumber,
            pageSize
        });
    }

    // ─────────────────────────────────────────────────────
    // GET /api/employee/{id}
    // ─────────────────────────────────────────────────────
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var employee = await _unitOfWork.Repository<Employee>().GetQueryable()
            .Include(e => e.Department)
            .Include(e => e.Designation)
            .Include(e => e.EmployeeRole)
            .Include(e => e.Documents)
            .Include(e => e.TeacherProfile)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (employee == null) return NotFound();

        return Ok(MapToDto(employee));
    }

    // ─────────────────────────────────────────────────────
    // POST /api/employee
    // ─────────────────────────────────────────────────────
    [HttpPost]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> Create([FromBody] CreateEmployeeDto dto)
    {
        // Check for duplicate work email within tenant (global query filter handles tenant scope)
        var existingEmail = await _unitOfWork.Repository<Employee>().GetQueryable()
            .AnyAsync(e => e.WorkEmail == dto.WorkEmail);
        if (existingEmail)
            return Conflict(new { message = "An employee with this work email already exists." });

        var employee = new Employee
        {
            EmployeeCode    = await GenerateEmployeeCodeAsync(),
            FirstName       = dto.FirstName,
            LastName        = dto.LastName,
            Gender          = dto.Gender,
            DateOfBirth     = dto.DateOfBirth,
            BloodGroup      = dto.BloodGroup,
            Nationality     = dto.Nationality,
            Religion        = dto.Religion,
            MaritalStatus   = dto.MaritalStatus,
            ProfilePhoto    = dto.ProfilePhoto,
            MobileNumber    = dto.MobileNumber,
            WorkEmail       = dto.WorkEmail,
            PersonalEmail   = dto.PersonalEmail,
            EmergencyContactName   = dto.EmergencyContactName,
            EmergencyContactNumber = dto.EmergencyContactNumber,
            AddressLine1    = dto.AddressLine1,
            AddressLine2    = dto.AddressLine2,
            City            = dto.City,
            State           = dto.State,
            Pincode         = dto.Pincode,
            PermanentAddressLine1  = dto.PermanentAddressLine1,
            PermanentAddressLine2  = dto.PermanentAddressLine2,
            PermanentCity   = dto.PermanentCity,
            PermanentState  = dto.PermanentState,
            PermanentPincode = dto.PermanentPincode,
            DepartmentId    = dto.DepartmentId,
            DesignationId   = dto.DesignationId,
            EmployeeRoleId  = dto.EmployeeRoleId,
            DateOfJoining   = dto.DateOfJoining,
            EmploymentType  = dto.EmploymentType,
            WorkLocation    = dto.WorkLocation,
            UserId          = dto.UserId,
            IsActive        = true,
            IsLoginEnabled  = dto.CreateSystemUser,
            Status          = EmployeeStatus.Active
        };

        await _unitOfWork.Repository<Employee>().AddAsync(employee);
        await _unitOfWork.CompleteAsync();

        // Optional: Auto-create User if requested
        if (dto.CreateSystemUser && !string.IsNullOrEmpty(dto.SystemPassword))
        {
            var orgId = _organizationService.GetOrganizationId();
            var roleName = "Staff"; // Default or lookup from Designation/Role
            if (employee.EmployeeRoleId.HasValue) 
            {
               var er = await _unitOfWork.Repository<EmployeeRole>().GetByIdAsync(employee.EmployeeRoleId.Value);
               if (er != null) roleName = er.Name;
            }

            var authResult = await _authService.RegisterAsync(
                dto.WorkEmail, 
                dto.SystemPassword, 
                dto.MobileNumber, 
                dto.FirstName, 
                dto.LastName, 
                roleName, 
                orgId
            );

            if (authResult.Success)
            {
                // Capture the new User ID (need to modify AuthService or lookup by email)
                var newUser = await _unitOfWork.Repository<User>().GetQueryable()
                    .FirstOrDefaultAsync(u => u.Email == dto.WorkEmail);
                if (newUser != null)
                {
                    employee.UserId = newUser.Id;
                    _unitOfWork.Repository<Employee>().Update(employee);
                    await _unitOfWork.CompleteAsync();
                }
            }
        }

        return CreatedAtAction(nameof(GetById), new { id = employee.Id }, MapToDto(employee));
    }

    // ─────────────────────────────────────────────────────
    // PUT /api/employee/{id}
    // ─────────────────────────────────────────────────────
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateEmployeeDto dto)
    {
        var employee = await _unitOfWork.Repository<Employee>().GetQueryable()
            .Include(e => e.Documents)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (employee == null) return NotFound();

        // Check duplicate email only if changed
        if (!string.Equals(employee.WorkEmail, dto.WorkEmail, StringComparison.OrdinalIgnoreCase))
        {
            var emailTaken = await _unitOfWork.Repository<Employee>().GetQueryable()
                .AnyAsync(e => e.WorkEmail == dto.WorkEmail && e.Id != id);
            if (emailTaken)
                return Conflict(new { message = "Another employee with this work email already exists." });
        }

        employee.FirstName       = dto.FirstName;
        employee.LastName        = dto.LastName;
        employee.Gender          = dto.Gender;
        employee.DateOfBirth     = dto.DateOfBirth;
        employee.BloodGroup      = dto.BloodGroup;
        employee.Nationality     = dto.Nationality;
        employee.Religion        = dto.Religion;
        employee.MaritalStatus   = dto.MaritalStatus;
        employee.ProfilePhoto    = dto.ProfilePhoto;
        employee.MobileNumber    = dto.MobileNumber;
        employee.WorkEmail       = dto.WorkEmail;
        employee.PersonalEmail   = dto.PersonalEmail;
        employee.EmergencyContactName   = dto.EmergencyContactName;
        employee.EmergencyContactNumber = dto.EmergencyContactNumber;
        employee.AddressLine1    = dto.AddressLine1;
        employee.AddressLine2    = dto.AddressLine2;
        employee.City            = dto.City;
        employee.State           = dto.State;
        employee.Pincode         = dto.Pincode;
        employee.PermanentAddressLine1  = dto.PermanentAddressLine1;
        employee.PermanentAddressLine2  = dto.PermanentAddressLine2;
        employee.PermanentCity   = dto.PermanentCity;
        employee.PermanentState  = dto.PermanentState;
        employee.PermanentPincode = dto.PermanentPincode;
        employee.DepartmentId    = dto.DepartmentId;
        employee.DesignationId   = dto.DesignationId;
        employee.EmployeeRoleId  = dto.EmployeeRoleId;
        employee.DateOfJoining   = dto.DateOfJoining;
        employee.EmploymentType  = dto.EmploymentType;
        employee.WorkLocation    = dto.WorkLocation;
        employee.UserId          = dto.UserId;
        employee.IsActive        = dto.IsActive;
        employee.IsLoginEnabled  = dto.CreateSystemUser;
        employee.DeactivationReason = dto.DeactivationReason;
        employee.Status = dto.IsActive ? EmployeeStatus.Active : EmployeeStatus.Inactive;

        _unitOfWork.Repository<Employee>().Update(employee);
        await _unitOfWork.CompleteAsync();

        // ─────────────────────────────────────────────────────
        // Sync Linked User Account Status & Email
        // ─────────────────────────────────────────────────────
        if (employee.UserId.HasValue)
        {
            var user = await _unitOfWork.Repository<User>().GetByIdAsync(employee.UserId.Value);
            if (user != null)
            {
                // Sync Email (Username)
                user.Email = employee.WorkEmail;

                // Sync Status
                if (!employee.IsActive)
                {
                    // Lock user account
                    user.LockoutEnd = DateTime.UtcNow.AddYears(100);
                }
                else
                {
                    // Unlock user account
                    user.LockoutEnd = null;
                }

                // Sync Role (NEW)
                if (employee.EmployeeRoleId.HasValue)
                {
                    var er = await _unitOfWork.Repository<EmployeeRole>().GetByIdAsync(employee.EmployeeRoleId.Value);
                    if (er != null) user.Role = er.Name;
                }

                // Sync Password if provided
                if (!string.IsNullOrEmpty(dto.SystemPassword))
                {
                    user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.SystemPassword);
                }
                
                _unitOfWork.Repository<User>().Update(user);
                await _unitOfWork.CompleteAsync();
            }
        }

        // Optional: Auto-create User if requested and not linked
        if (dto.CreateSystemUser && !string.IsNullOrEmpty(dto.SystemPassword) && !employee.UserId.HasValue)
        {
            var orgId = _organizationService.GetOrganizationId();
            var roleName = "Staff";
            if (employee.EmployeeRoleId.HasValue)
            {
                var er = await _unitOfWork.Repository<EmployeeRole>().GetByIdAsync(employee.EmployeeRoleId.Value);
                if (er != null) roleName = er.Name;
            }

            var authResult = await _authService.RegisterAsync(
                dto.WorkEmail,
                dto.SystemPassword,
                dto.MobileNumber,
                dto.FirstName,
                dto.LastName,
                roleName,
                orgId
            );

            if (authResult.Success)
            {
                var newUser = await _unitOfWork.Repository<User>().GetQueryable()
                    .FirstOrDefaultAsync(u => u.Email == dto.WorkEmail);
                if (newUser != null)
                {
                    employee.UserId = newUser.Id;
                    _unitOfWork.Repository<Employee>().Update(employee);
                    await _unitOfWork.CompleteAsync();
                }
            }
        }

        return Ok(MapToDto(employee));
    }

    // ─────────────────────────────────────────────────────
    // DELETE /api/employee/{id}   – Soft deactivate
    // ─────────────────────────────────────────────────────
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> Deactivate(Guid id, [FromQuery] string? reason = null)
    {
        var employee = await _unitOfWork.Repository<Employee>().GetByIdAsync(id);
        if (employee == null) return NotFound();

        employee.IsActive = false;
        employee.Status   = EmployeeStatus.Inactive;
        employee.DeactivationReason = reason;

        _unitOfWork.Repository<Employee>().Update(employee);
        await _unitOfWork.CompleteAsync();

        return NoContent();
    }

    // ─────────────────────────────────────────────────────
    // POST /api/employee/{id}/reactivate
    // ─────────────────────────────────────────────────────
    [HttpPost("{id}/reactivate")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> Reactivate(Guid id)
    {
        var employee = await _unitOfWork.Repository<Employee>().GetByIdAsync(id);
        if (employee == null) return NotFound();

        employee.IsActive = true;
        employee.Status   = EmployeeStatus.Active;
        employee.DeactivationReason = null;

        _unitOfWork.Repository<Employee>().Update(employee);
        await _unitOfWork.CompleteAsync();

        return Ok(new { message = "Employee reactivated successfully." });
    }

    // ─────────────────────────────────────────────────────
    // POST /api/employee/{id}/documents
    // ─────────────────────────────────────────────────────
    [HttpPost("{id}/documents")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> AddDocument(Guid id, [FromBody] AddDocumentDto dto)
    {
        var employee = await _unitOfWork.Repository<Employee>().GetByIdAsync(id);
        if (employee == null) return NotFound();

        var doc = new EmployeeDocument
        {
            EmployeeId   = id,
            FileName     = dto.FileName,
            Url          = dto.Url,
            DocumentType = dto.DocumentType,
            Description  = dto.Description,
            FileSizeBytes = dto.FileSizeBytes,
            UploadedAt   = DateTime.UtcNow
        };

        await _unitOfWork.Repository<EmployeeDocument>().AddAsync(doc);
        await _unitOfWork.CompleteAsync();

        return Ok(MapDocumentToDto(doc));
    }

    // ─────────────────────────────────────────────────────
    // DELETE /api/employee/{id}/documents/{docId}
    // ─────────────────────────────────────────────────────
    [HttpDelete("{id}/documents/{docId}")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> RemoveDocument(Guid id, Guid docId)
    {
        var doc = await _unitOfWork.Repository<EmployeeDocument>().GetQueryable()
            .FirstOrDefaultAsync(d => d.Id == docId && d.EmployeeId == id);

        if (doc == null) return NotFound();

        _unitOfWork.Repository<EmployeeDocument>().Delete(doc);
        await _unitOfWork.CompleteAsync();

        return NoContent();
    }

    // ─────────────────────────────────────────────────────
    // GET /api/employee/{id}/teacher-profile
    // ─────────────────────────────────────────────────────
    [HttpGet("{id}/teacher-profile")]
    public async Task<IActionResult> GetTeacherProfile(Guid id)
    {
        var profile = await _unitOfWork.Repository<TeacherProfile>().GetQueryable()
            .FirstOrDefaultAsync(p => p.EmployeeId == id);
            
        return Ok(profile);
    }

    // ─────────────────────────────────────────────────────
    // POST /api/employee/teacher-profile (Upsert)
    // ─────────────────────────────────────────────────────
    [HttpPost("teacher-profile")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> UpsertTeacherProfile([FromBody] UpsertTeacherProfileDto dto)
    {
        var profile = await _unitOfWork.Repository<TeacherProfile>().GetQueryable()
            .FirstOrDefaultAsync(p => p.EmployeeId == dto.EmployeeId);

        bool isNew = false;
        if (profile == null)
        {
            profile = new TeacherProfile { EmployeeId = dto.EmployeeId };
            await _unitOfWork.Repository<TeacherProfile>().AddAsync(profile);
            isNew = true;
        }

        profile.HighestQualification = dto.HighestQualification;
        profile.QualificationInstitution = dto.QualificationInstitution;
        profile.QualificationYear = dto.QualificationYear;
        profile.Specializations = dto.Specializations;
        profile.PreviousExperienceYears = dto.PreviousExperienceYears;
        profile.PreviousSchools = dto.PreviousSchools;

        if (!isNew)
        {
            _unitOfWork.Repository<TeacherProfile>().Update(profile);
        }
        
        await _unitOfWork.CompleteAsync();

        return Ok(profile);
    }
    private async Task<string> GenerateEmployeeCodeAsync()
    {
        var count = await _unitOfWork.Repository<Employee>().GetQueryable().CountAsync();
        return $"EMP{DateTime.UtcNow:yyyy}{(count + 1):D4}";
    }

    private EmployeeDto MapToDetailedDto(Employee e)
    {
        var dto = MapToDto(e);
        // Add more detailed fields if needed, like teacher profile
        return dto;
    }

    private EmployeeDto MapToDto(Employee e) => new()
    {
        Id              = e.Id,
        EmployeeCode    = e.EmployeeCode,
        FirstName       = e.FirstName,
        LastName        = e.LastName,
        Gender          = e.Gender,
        DateOfBirth     = e.DateOfBirth,
        BloodGroup      = e.BloodGroup,
        Nationality     = e.Nationality,
        Religion        = e.Religion,
        MaritalStatus   = e.MaritalStatus,
        ProfilePhoto    = e.ProfilePhoto,
        MobileNumber    = e.MobileNumber,
        WorkEmail       = e.WorkEmail,
        PersonalEmail   = e.PersonalEmail,
        EmergencyContactName   = e.EmergencyContactName,
        EmergencyContactNumber = e.EmergencyContactNumber,
        AddressLine1    = e.AddressLine1,
        AddressLine2    = e.AddressLine2,
        City            = e.City,
        State           = e.State,
        Pincode         = e.Pincode,
        PermanentAddressLine1  = e.PermanentAddressLine1,
        PermanentAddressLine2  = e.PermanentAddressLine2,
        PermanentCity   = e.PermanentCity,
        PermanentState  = e.PermanentState,
        PermanentPincode = e.PermanentPincode,
        DepartmentId    = e.DepartmentId,
        DepartmentName  = e.Department?.Name,
        DesignationId   = e.DesignationId,
        DesignationName = e.Designation?.Name,
        EmployeeRoleId  = e.EmployeeRoleId,
        EmployeeRoleName = e.EmployeeRole?.Name,
        DateOfJoining   = e.DateOfJoining,
        EmploymentType  = e.EmploymentType,
        WorkLocation    = e.WorkLocation,
        IsActive        = e.IsActive,
        Status          = e.Status,
        DeactivationReason = e.DeactivationReason,
        CreateSystemUser = e.IsLoginEnabled,
        HasTeacherProfile = e.TeacherProfile != null,
        UserId          = e.UserId,
        CreatedAt       = e.CreatedAt,
        UpdatedAt       = e.UpdatedAt,
        Documents       = e.Documents.Select(MapDocumentToDto).ToList()
    };

    private static EmployeeDocumentDto MapDocumentToDto(EmployeeDocument d) => new()
    {
        Id           = d.Id,
        FileName     = d.FileName,
        Url          = d.Url,
        DocumentType = d.DocumentType,
        Description  = d.Description,
        FileSizeBytes = d.FileSizeBytes,
        UploadedAt   = d.UploadedAt
    };
}
