using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.DTOs.Teacher;
using SchoolERP.Application.Interfaces;
using SchoolERP.Domain.Entities;

namespace SchoolERP.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class TeacherController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public TeacherController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    // ─────────────────────────────────────────────────────────────────────
    // GET /api/teacher  – All teacher profiles with search & filters
    // ─────────────────────────────────────────────────────────────────────
    [HttpGet]
    [Authorize(Roles = "Admin,HR,Teacher")]
    public async Task<IActionResult> GetAll(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] Guid? subjectId = null,
        [FromQuery] Guid? classId = null,
        [FromQuery] Guid? academicYearId = null,
        [FromQuery] int? minExperience = null,
        [FromQuery] int? maxExperience = null
    )
    {
        var query = _unitOfWork.Repository<TeacherProfile>().GetQueryable()
            .Include(tp => tp.Employee)
                .ThenInclude(e => e!.Department)
            .Include(tp => tp.Employee)
                .ThenInclude(e => e!.Designation)
            .Include(tp => tp.SubjectAssignments)
                .ThenInclude(sa => sa.Subject)
            .Include(tp => tp.ClassAssignments)
                .ThenInclude(ca => ca.Class)
            .Include(tp => tp.ClassAssignments)
                .ThenInclude(ca => ca.Section)
            .Include(tp => tp.ClassAssignments)
                .ThenInclude(ca => ca.AcademicYear)
            .Where(tp => tp.Employee != null && tp.Employee.IsActive);

        // Search by name / employee code
        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(tp =>
                (tp.Employee!.FirstName + " " + tp.Employee.LastName).Contains(search) ||
                tp.Employee.EmployeeCode.Contains(search) ||
                (tp.Specializations != null && tp.Specializations.Contains(search)));
        }

        // Filter by subject
        if (subjectId.HasValue)
            query = query.Where(tp => tp.SubjectAssignments.Any(sa => sa.SubjectId == subjectId.Value && sa.IsActive));

        // Filter by class
        if (classId.HasValue)
            query = query.Where(tp => tp.ClassAssignments.Any(ca => ca.ClassId == classId.Value && ca.IsActive));

        // Filter by academic year
        if (academicYearId.HasValue)
            query = query.Where(tp =>
                tp.SubjectAssignments.Any(sa => sa.AcademicYearId == academicYearId.Value) ||
                tp.ClassAssignments.Any(ca => ca.AcademicYearId == academicYearId.Value));

        // Filter by experience range
        if (minExperience.HasValue)
            query = query.Where(tp => (tp.PreviousExperienceYears ?? 0) >= minExperience.Value);
        if (maxExperience.HasValue)
            query = query.Where(tp => (tp.PreviousExperienceYears ?? 0) <= maxExperience.Value);

        query = query.OrderBy(tp => tp.Employee!.FirstName).ThenBy(tp => tp.Employee!.LastName);

        var totalRecords = await query.CountAsync();
        var profiles = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new
        {
            data = profiles.Select(MapToDto),
            totalRecords,
            pageNumber,
            pageSize
        });
    }

    // ─────────────────────────────────────────────────────────────────────
    // GET /api/teacher/{employeeId}
    // ─────────────────────────────────────────────────────────────────────
    [HttpGet("{employeeId}")]
    public async Task<IActionResult> GetByEmployeeId(Guid employeeId)
    {
        var profile = await GetFullProfile(employeeId);
        if (profile == null) return NotFound(new { message = "No teacher profile found for this employee." });
        return Ok(MapToDto(profile));
    }

    // ─────────────────────────────────────────────────────────────────────
    // POST /api/teacher  – Create or update teacher profile (upsert)
    // ─────────────────────────────────────────────────────────────────────
    [HttpPost]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> Upsert([FromBody] UpsertTeacherProfileDto dto)
    {
        // Validate employee exists
        var employee = await _unitOfWork.Repository<Employee>().GetByIdAsync(dto.EmployeeId);
        if (employee == null) return NotFound(new { message = "Employee not found." });

        var existing = await _unitOfWork.Repository<TeacherProfile>().GetQueryable()
            .FirstOrDefaultAsync(tp => tp.EmployeeId == dto.EmployeeId);

        if (existing != null)
        {
            // Update
            existing.HighestQualification = dto.HighestQualification;
            existing.QualificationInstitution = dto.QualificationInstitution;
            existing.QualificationYear = dto.QualificationYear;
            existing.Specializations = dto.Specializations;
            existing.PreviousExperienceYears = dto.PreviousExperienceYears;
            existing.PreviousSchools = dto.PreviousSchools;

            _unitOfWork.Repository<TeacherProfile>().Update(existing);
            await _unitOfWork.CompleteAsync();

            var updated = await GetFullProfile(dto.EmployeeId);
            return Ok(MapToDto(updated!));
        }
        else
        {
            // Create
            var profile = new TeacherProfile
            {
                EmployeeId = dto.EmployeeId,
                HighestQualification = dto.HighestQualification,
                QualificationInstitution = dto.QualificationInstitution,
                QualificationYear = dto.QualificationYear,
                Specializations = dto.Specializations,
                PreviousExperienceYears = dto.PreviousExperienceYears,
                PreviousSchools = dto.PreviousSchools
            };
            await _unitOfWork.Repository<TeacherProfile>().AddAsync(profile);
            await _unitOfWork.CompleteAsync();

            var created = await GetFullProfile(dto.EmployeeId);
            return CreatedAtAction(nameof(GetByEmployeeId), new { employeeId = dto.EmployeeId }, MapToDto(created!));
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // POST /api/teacher/{employeeId}/subjects  – Assign subject
    // ─────────────────────────────────────────────────────────────────────
    [HttpPost("{employeeId}/subjects")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> AssignSubject(Guid employeeId, [FromBody] AssignSubjectDto dto)
    {
        var profile = await _unitOfWork.Repository<TeacherProfile>().GetQueryable()
            .FirstOrDefaultAsync(tp => tp.EmployeeId == employeeId);
        if (profile == null) return NotFound(new { message = "Teacher profile not found. Create the profile first." });

        // Check for duplicate active assignment
        var duplicate = await _unitOfWork.Repository<TeacherSubjectAssignment>().GetQueryable()
            .AnyAsync(sa => sa.TeacherProfileId == profile.Id && sa.SubjectId == dto.SubjectId &&
                            sa.AcademicYearId == dto.AcademicYearId && sa.IsActive);
        if (duplicate) return Conflict(new { message = "Subject already assigned for this academic year." });

        var assignment = new TeacherSubjectAssignment
        {
            TeacherProfileId = profile.Id,
            SubjectId = dto.SubjectId,
            AcademicYearId = dto.AcademicYearId,
            EffectiveFrom = dto.EffectiveFrom ?? DateTime.UtcNow,
            EffectiveTo = dto.EffectiveTo,
            IsActive = true
        };

        await _unitOfWork.Repository<TeacherSubjectAssignment>().AddAsync(assignment);
        await _unitOfWork.CompleteAsync();

        return Ok(new { message = "Subject assigned successfully.", assignmentId = assignment.Id });
    }

    // ─────────────────────────────────────────────────────────────────────
    // DELETE /api/teacher/{employeeId}/subjects/{assignmentId}
    // ─────────────────────────────────────────────────────────────────────
    [HttpPost("{employeeId}/subjects/{assignmentId}/delete")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> RemoveSubjectAssignment(Guid employeeId, Guid assignmentId)
    {
        var profile = await _unitOfWork.Repository<TeacherProfile>().GetQueryable()
            .FirstOrDefaultAsync(tp => tp.EmployeeId == employeeId);
        if (profile == null) return NotFound();

        var assignment = await _unitOfWork.Repository<TeacherSubjectAssignment>().GetQueryable()
            .FirstOrDefaultAsync(sa => sa.Id == assignmentId && sa.TeacherProfileId == profile.Id);
        if (assignment == null) return NotFound();

        assignment.IsActive = false;
        _unitOfWork.Repository<TeacherSubjectAssignment>().Update(assignment);
        await _unitOfWork.CompleteAsync();
        return NoContent();
    }

    // ─────────────────────────────────────────────────────────────────────
    // POST /api/teacher/{employeeId}/classes  – Assign class-section
    // ─────────────────────────────────────────────────────────────────────
    [HttpPost("{employeeId}/classes")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> AssignClass(Guid employeeId, [FromBody] AssignClassDto dto)
    {
        var profile = await _unitOfWork.Repository<TeacherProfile>().GetQueryable()
            .FirstOrDefaultAsync(tp => tp.EmployeeId == employeeId);
        if (profile == null) return NotFound(new { message = "Teacher profile not found. Create the profile first." });

        // Enforce only one class teacher per class+section+year
        if (dto.IsClassTeacher)
        {
            var existingClassTeacher = await _unitOfWork.Repository<TeacherClassAssignment>().GetQueryable()
                .AnyAsync(ca => ca.ClassId == dto.ClassId && ca.SectionId == dto.SectionId &&
                                ca.AcademicYearId == dto.AcademicYearId && ca.IsClassTeacher && ca.IsActive);
            if (existingClassTeacher)
                return Conflict(new { message = "This class-section already has a class teacher for the selected academic year." });
        }

        // Check duplicate assignment
        var duplicate = await _unitOfWork.Repository<TeacherClassAssignment>().GetQueryable()
            .AnyAsync(ca => ca.TeacherProfileId == profile.Id && ca.ClassId == dto.ClassId &&
                            ca.SectionId == dto.SectionId && ca.AcademicYearId == dto.AcademicYearId && ca.IsActive);
        if (duplicate) return Conflict(new { message = "This teacher is already assigned to this class-section for the selected academic year." });

        var assignment = new TeacherClassAssignment
        {
            TeacherProfileId = profile.Id,
            ClassId = dto.ClassId,
            SectionId = dto.SectionId,
            AcademicYearId = dto.AcademicYearId,
            IsClassTeacher = dto.IsClassTeacher,
            IsActive = true
        };

        await _unitOfWork.Repository<TeacherClassAssignment>().AddAsync(assignment);
        await _unitOfWork.CompleteAsync();

        return Ok(new { message = "Class-section assigned successfully.", assignmentId = assignment.Id });
    }

    // ─────────────────────────────────────────────────────────────────────
    // DELETE /api/teacher/{employeeId}/classes/{assignmentId}
    // ─────────────────────────────────────────────────────────────────────
    [HttpPost("{employeeId}/classes/{assignmentId}/delete")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> RemoveClassAssignment(Guid employeeId, Guid assignmentId)
    {
        var profile = await _unitOfWork.Repository<TeacherProfile>().GetQueryable()
            .FirstOrDefaultAsync(tp => tp.EmployeeId == employeeId);
        if (profile == null) return NotFound();

        var assignment = await _unitOfWork.Repository<TeacherClassAssignment>().GetQueryable()
            .FirstOrDefaultAsync(ca => ca.Id == assignmentId && ca.TeacherProfileId == profile.Id);
        if (assignment == null) return NotFound();

        assignment.IsActive = false;
        _unitOfWork.Repository<TeacherClassAssignment>().Update(assignment);
        await _unitOfWork.CompleteAsync();
        return NoContent();
    }

    // ─────────────────────────────────────────────────────────────────────
    // PATCH /api/teacher/{employeeId}/classes/{assignmentId}/set-class-teacher
    // ─────────────────────────────────────────────────────────────────────
    [HttpPost("{employeeId}/classes/{assignmentId}/set-class-teacher")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> SetClassTeacher(Guid employeeId, Guid assignmentId, [FromQuery] bool isClassTeacher = true)
    {
        var profile = await _unitOfWork.Repository<TeacherProfile>().GetQueryable()
            .FirstOrDefaultAsync(tp => tp.EmployeeId == employeeId);
        if (profile == null) return NotFound();

        var assignment = await _unitOfWork.Repository<TeacherClassAssignment>().GetQueryable()
            .FirstOrDefaultAsync(ca => ca.Id == assignmentId && ca.TeacherProfileId == profile.Id);
        if (assignment == null) return NotFound();

        if (isClassTeacher)
        {
            var existing = await _unitOfWork.Repository<TeacherClassAssignment>().GetQueryable()
                .AnyAsync(ca => ca.ClassId == assignment.ClassId && ca.SectionId == assignment.SectionId &&
                                ca.AcademicYearId == assignment.AcademicYearId &&
                                ca.IsClassTeacher && ca.IsActive && ca.Id != assignmentId);
            if (existing)
                return Conflict(new { message = "Another teacher is already the class teacher of this class-section." });
        }

        assignment.IsClassTeacher = isClassTeacher;
        _unitOfWork.Repository<TeacherClassAssignment>().Update(assignment);
        await _unitOfWork.CompleteAsync();

        return Ok(new { message = isClassTeacher ? "Set as class teacher." : "Removed as class teacher." });
    }

    // ─────────────────────────────────────────────────────────────────────
    // DELETE /api/teacher/{employeeId} – Remove only the academic profile
    // ─────────────────────────────────────────────────────────────────────
    [HttpPost("{employeeId}/delete-profile")]
    [Authorize(Roles = "Admin,HR")]
    public async Task<IActionResult> DeleteProfile(Guid employeeId)
    {
        var profile = await _unitOfWork.Repository<TeacherProfile>().GetQueryable()
            .FirstOrDefaultAsync(tp => tp.EmployeeId == employeeId);

        if (profile == null) return NotFound();

        _unitOfWork.Repository<TeacherProfile>().Delete(profile);
        await _unitOfWork.CompleteAsync();

        return NoContent();
    }

    // ─────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────
    private async Task<TeacherProfile?> GetFullProfile(Guid employeeId)
    {
        return await _unitOfWork.Repository<TeacherProfile>().GetQueryable()
            .Include(tp => tp.Employee)
                .ThenInclude(e => e!.Department)
            .Include(tp => tp.Employee)
                .ThenInclude(e => e!.Designation)
            .Include(tp => tp.SubjectAssignments.Where(sa => sa.IsActive))
                .ThenInclude(sa => sa.Subject)
            .Include(tp => tp.SubjectAssignments.Where(sa => sa.IsActive))
                .ThenInclude(sa => sa.AcademicYear)
            .Include(tp => tp.ClassAssignments.Where(ca => ca.IsActive))
                .ThenInclude(ca => ca.Class)
            .Include(tp => tp.ClassAssignments.Where(ca => ca.IsActive))
                .ThenInclude(ca => ca.Section)
            .Include(tp => tp.ClassAssignments.Where(ca => ca.IsActive))
                .ThenInclude(ca => ca.AcademicYear)
            .FirstOrDefaultAsync(tp => tp.EmployeeId == employeeId);
    }

    private static TeacherProfileDto MapToDto(TeacherProfile tp)
    {
        var employee = tp.Employee;
        int currentYears = employee != null
            ? (int)Math.Floor((DateTime.UtcNow - employee.DateOfJoining).TotalDays / 365.25)
            : 0;
        int prevYears = tp.PreviousExperienceYears ?? 0;

        return new TeacherProfileDto
        {
            Id = tp.Id,
            EmployeeId = tp.EmployeeId,
            EmployeeCode = employee?.EmployeeCode ?? string.Empty,
            FullName = employee != null ? $"{employee.FirstName} {employee.LastName}" : string.Empty,
            ProfilePhoto = employee?.ProfilePhoto,
            WorkEmail = employee?.WorkEmail,
            MobileNumber = employee?.MobileNumber,
            DepartmentName = employee?.Department?.Name,
            DesignationName = employee?.Designation?.Name,
            IsActive = employee?.IsActive ?? false,
            HighestQualification = tp.HighestQualification,
            QualificationInstitution = tp.QualificationInstitution,
            QualificationYear = tp.QualificationYear,
            Specializations = tp.Specializations,
            PreviousExperienceYears = tp.PreviousExperienceYears,
            PreviousSchools = tp.PreviousSchools,
            CurrentSchoolExperienceYears = currentYears,
            TotalExperienceYears = prevYears + currentYears,
            SubjectAssignments = tp.SubjectAssignments.Select(sa => new TeacherSubjectAssignmentDto
            {
                Id = sa.Id,
                SubjectId = sa.SubjectId,
                SubjectName = sa.Subject?.Name ?? string.Empty,
                SubjectCode = sa.Subject?.Code ?? string.Empty,
                AcademicYearId = sa.AcademicYearId,
                AcademicYearName = sa.AcademicYear?.Name ?? string.Empty,
                EffectiveFrom = sa.EffectiveFrom,
                EffectiveTo = sa.EffectiveTo,
                IsActive = sa.IsActive
            }).ToList(),
            ClassAssignments = tp.ClassAssignments.Select(ca => new TeacherClassAssignmentDto
            {
                Id = ca.Id,
                ClassId = ca.ClassId,
                ClassName = ca.Class?.Name ?? string.Empty,
                SectionId = ca.SectionId,
                SectionName = ca.Section?.Name ?? string.Empty,
                AcademicYearId = ca.AcademicYearId,
                AcademicYearName = ca.AcademicYear?.Name ?? string.Empty,
                IsClassTeacher = ca.IsClassTeacher,
                IsActive = ca.IsActive
            }).ToList()
        };
    }
}
