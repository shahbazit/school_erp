using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolERP.API.Attributes;
using SchoolERP.Application.DTOs.Fees;
using SchoolERP.Application.DTOs.Student;
using SchoolERP.Application.Interfaces;
using SchoolERP.Domain.Entities;
using System.Linq;
using System.Text.Json;

namespace SchoolERP.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize] // Requires JWT
public class StudentController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IFeeService _feeService;

    public StudentController(IUnitOfWork unitOfWork, IFeeService feeService)
    {
        _unitOfWork = unitOfWork;
        _feeService = feeService;
    }

    [HttpGet]
    [RequireModulePermission("students", requiresWrite: false)]
    public async Task<IActionResult> GetAllStudents(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] Guid? classId = null,
        [FromQuery] Guid? sectionId = null,
        [FromQuery] Guid? courseId = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] string? status = null,
        [FromQuery] string? academicYear = null,
        [FromQuery] string sortBy = "Name" // Name, AdmissionNo
    )
    {
        var academicQuery = _unitOfWork.Repository<StudentAcademic>().GetQueryable()
            .Include(sa => sa.Student)
            .ThenInclude(s => s.EnrolledCourses)
            .ThenInclude(ec => ec.Course)
            .AsQueryable();

        // Filters applied to academic mapping
        if (classId.HasValue) academicQuery = academicQuery.Where(sa => sa.ClassId == classId.Value);
        if (sectionId.HasValue) academicQuery = academicQuery.Where(sa => sa.SectionId == sectionId.Value);
        if (!string.IsNullOrWhiteSpace(status)) academicQuery = academicQuery.Where(sa => sa.Status == status);
        if (!string.IsNullOrWhiteSpace(academicYear))
        {
            // Resolve the name and potential ID for the given academicYear input
            string? ayName = null;
            Guid? ayId = null;

            if (Guid.TryParse(academicYear, out var parsedId))
            {
                ayId = parsedId;
                var ay = await _unitOfWork.Repository<AcademicYear>().GetByIdAsync(parsedId);
                if (ay != null) ayName = ay.Name;
            }
            else
            {
                ayName = academicYear;
                var ay = await _unitOfWork.Repository<AcademicYear>().GetQueryable()
                    .FirstOrDefaultAsync(y => y.Name.ToLower() == academicYear.Trim().ToLower());
                if (ay != null) ayId = ay.Id;
            }

            // Filter by Name OR ID in the AcademicYear column (handles both migration states)
            var ayIdString = ayId?.ToString();
            academicQuery = academicQuery.Where(sa => 
                (ayName != null && sa.AcademicYear == ayName) || 
                (ayIdString != null && sa.AcademicYear == ayIdString));
        }

        // Search applied to Student info
        if (!string.IsNullOrWhiteSpace(search))
        {
            academicQuery = academicQuery.Where(sa => 
                (sa.Student.FirstName + " " + sa.Student.LastName).Contains(search) || 
                sa.Student.AdmissionNo.Contains(search) || 
                sa.Student.MobileNumber.Contains(search));
        }

        if (isActive.HasValue) academicQuery = academicQuery.Where(sa => sa.Student.IsActive == isActive.Value);

        // Sort by Student Name or AdmissionNo
        academicQuery = sortBy.ToLower() switch
        {
            "admissionno" => academicQuery.OrderBy(sa => sa.Student.AdmissionNo),
            _ => academicQuery.OrderBy(sa => sa.Student.FirstName).ThenBy(sa => sa.Student.LastName)
        };

        var totalRecords = await academicQuery.CountAsync();
        var records = await academicQuery
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var dtos = records.Select(sa => {
            var dto = MapToDto(sa.Student);
            // Overwrite basic academic fields from the specific session record
            dto.ClassId = sa.ClassId;
            dto.SectionId = sa.SectionId;
            dto.AcademicYear = sa.AcademicYear;
            dto.RollNumber = sa.RollNumber;
            dto.Status = sa.Status;
            return dto;
        }).ToList();

        return Ok(new { data = dtos, totalRecords, pageNumber, pageSize });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetStudentById(Guid id)
    {
        var student = await _unitOfWork.Repository<Student>().GetQueryable()
            .Include(s => s.EnrolledCourses)
            .ThenInclude(ec => ec.Course)
            .Include(s => s.AcademicRecords)
            .FirstOrDefaultAsync(s => s.Id == id);
            
        if (student == null) return NotFound();

        var currentRecord = student.AcademicRecords.FirstOrDefault(ar => ar.IsCurrent) 
                           ?? student.AcademicRecords.OrderByDescending(ar => ar.CreatedAt).FirstOrDefault();

        var dto = MapToDto(student);
        if (currentRecord != null)
        {
            dto.ClassId = currentRecord.ClassId;
            dto.SectionId = currentRecord.SectionId;
            dto.AcademicYear = currentRecord.AcademicYear;
            dto.RollNumber = currentRecord.RollNumber;
        }

        // Fetch Fee Info
        var subs = await _feeService.GetStudentSubscriptionsAsync(id);
        var discounts = await _feeService.GetStudentDiscountsAsync(id);
        
        dto.FeeSubscriptions = subs.ToList();
        dto.FeeDiscounts = discounts.Select(d => new FeeDiscountAssignmentDto {
             Id = d.Id,
             FeeDiscountId = d.FeeDiscountId,
             DiscountName = d.Discount?.Name ?? "Unknown",
             RestrictedFeeHeadId = d.RestrictedFeeHeadId,
             RestrictedFeeHeadName = d.RestrictedFeeHead?.Name,
             AcademicYearId = d.AcademicYearId,
             AcademicYearName = d.AcademicYear?.Name ?? "Unknown",
             Remarks = d.Remarks,
             CalculationType = d.CustomCalculationType,
             Value = d.CustomValue,
             Frequency = d.CustomFrequency
        }).ToList();

        return Ok(dto);
    }

    [HttpPost]
    [RequireModulePermission("students", requiresWrite: true)]
    public async Task<IActionResult> AddStudent([FromBody] CreateStudentDto dto)
    {
        // For debugging 400 errors, log the actual incoming JSON if ModelState is invalid
        if (!ModelState.IsValid)
        {
            var errors = ModelState.ToDictionary(
                k => k.Key, 
                v => v.Value?.Errors.Select(e => e.ErrorMessage).ToList() ?? new List<string>()
            );
            Console.WriteLine("ModelState Errors: " + JsonSerializer.Serialize(errors));
            return BadRequest(new { Errors = errors, Message = "Validation failed" });
        }
        // Academic Year Validation
        AcademicYear? ay = null;
        if (Guid.TryParse(dto.AcademicYear, out var ayGuid))
        {
            ay = await _unitOfWork.Repository<AcademicYear>().GetByIdAsync(ayGuid);
        }
        else
        {
            var ayNameTrimmed = (dto.AcademicYear ?? "").Trim().ToLower();
            ay = await _unitOfWork.Repository<AcademicYear>().GetQueryable()
                .FirstOrDefaultAsync(a => a.IsActive && a.Name.ToLower() == ayNameTrimmed);
        }

        if (ay == null) return BadRequest(new { Message = $"Academic Year '{dto.AcademicYear}' is not valid or active." });

        // Duplicate Check (Name + Mobile)
        var firstNameTrimmed = (dto.FirstName ?? "").Trim();
        var lastNameTrimmed = (dto.LastName ?? "").Trim();
        var fullName = $"{firstNameTrimmed} {lastNameTrimmed}".ToLower();
        var mobile = (dto.MobileNumber ?? "").Trim();

        var isDuplicate = await _unitOfWork.Repository<Student>().GetQueryable()
            .AnyAsync(s => (s.FirstName.ToLower() + " " + s.LastName.ToLower()) == fullName && s.MobileNumber == mobile);
        
        if (isDuplicate) return BadRequest(new { Message = $"Student '{fullName}' with mobile '{mobile}' already exists." });

        if (!string.IsNullOrWhiteSpace(dto.AdmissionNo))
        {
            var admTrimmed = dto.AdmissionNo.Trim().ToLower();
            var isAdmDup = await _unitOfWork.Repository<Student>().GetQueryable()
                .AnyAsync(s => s.AdmissionNo.ToLower() == admTrimmed);
            if (isAdmDup) return BadRequest(new { Message = $"Admission No '{dto.AdmissionNo}' is already taken." });
        }

        // Email Duplicate Check
        if (!string.IsNullOrWhiteSpace(dto.Email))
        {
            var emailTrimmed = dto.Email.Trim().ToLower();
            var isEmailDup = await _unitOfWork.Repository<Student>().GetQueryable()
                .AnyAsync(s => s.Email != null && s.Email.ToLower() == emailTrimmed);
            if (isEmailDup) return BadRequest(new { Message = $"Email '{dto.Email}' is already registered with another student." });
        }

        var (resolvedClassId, resolvedSectionId) = await ResolveAcademicIds(dto.ClassId, dto.ClassName, dto.SectionId, dto.SectionName);
        if (resolvedClassId == Guid.Empty) return BadRequest(new { Message = "Could not resolve Class." });
        
        var student = MapFromDto(dto);
        await _unitOfWork.Repository<Student>().AddAsync(student);
        
        // Add Academic Mapping
        var academic = new StudentAcademic
        {
            StudentId = student.Id,
            ClassId = resolvedClassId,
            SectionId = resolvedSectionId,
            AcademicYear = ay?.Name ?? dto.AcademicYear.Trim(),
            RollNumber = dto.RollNumber,
            IsCurrent = true,
            Status = "Active"
        };
        await _unitOfWork.Repository<StudentAcademic>().AddAsync(academic);

        await _unitOfWork.CompleteAsync();

        // 1. Assign Selective Fee Subscriptions
        if (dto.FeeSubscriptions != null && dto.FeeSubscriptions.Any())
        {
            foreach (var sub in dto.FeeSubscriptions)
            {
                await _feeService.CreateSubscriptionAsync(new CreateStudentFeeSubscriptionRequest
                {
                    StudentId = student.Id,
                    FeeHeadId = sub.FeeHeadId,
                    CustomAmount = sub.CustomAmount,
                    IsActive = true
                });
            }
        }

        // 2. Assign Discounts
        if (dto.FeeDiscounts != null && dto.FeeDiscounts.Any())
        {
            foreach (var disc in dto.FeeDiscounts)
            {
                await _feeService.AssignDiscountAsync(new FeeDiscountAssignment
                {
                    StudentId = student.Id,
                    FeeDiscountId = disc.FeeDiscountId,
                    RestrictedFeeHeadId = disc.FeeHeadId,
                    AcademicYearId = disc.AcademicYearId,
                    Remarks = disc.Remarks,
                    CustomCalculationType = disc.CalculationType,
                    CustomValue = disc.Value,
                    CustomFrequency = disc.Frequency,
                    IsActive = true
                });
            }
        }

        return CreatedAtAction(nameof(GetStudentById), new { id = student.Id }, MapToDto(student));
    }

    [HttpPost("bulk/validate")]
    [RequireModulePermission("students", requiresWrite: true)]
    public async Task<IActionResult> BulkValidateStudents([FromBody] IEnumerable<CreateStudentDto> dtos)
    {
        if (dtos == null || !dtos.Any()) return BadRequest("No students provided.");

        var dtosList = dtos.ToList();
        var results = new List<object>();

        // Fetch Masters
        var activeAcademicYears = await _unitOfWork.Repository<AcademicYear>().GetQueryable()
            .Where(ay => ay.IsActive).ToListAsync();
        
        var existingStudents = await _unitOfWork.Repository<Student>().GetQueryable()
            .Select(s => new { s.FirstName, s.LastName, s.MobileNumber, s.AdmissionNo, s.Email })
            .ToListAsync();
        
        var internalTrack = new HashSet<string>();

        for (int i = 0; i < dtosList.Count; i++)
        {
            var dto = dtosList[i];
            var rowErrors = new List<string>();

            if (string.IsNullOrWhiteSpace(dto.FirstName)) rowErrors.Add("First Name is missing.");
            if (string.IsNullOrWhiteSpace(dto.LastName)) rowErrors.Add("Last Name is missing.");
            if (string.IsNullOrWhiteSpace(dto.MobileNumber)) rowErrors.Add("Mobile Number is missing.");
            
            if (string.IsNullOrWhiteSpace(dto.AcademicYear)) rowErrors.Add("Academic Year is required.");
            else if (!activeAcademicYears.Any(ay => ay.Name.Equals(dto.AcademicYear.Trim(), StringComparison.OrdinalIgnoreCase)))
                rowErrors.Add($"Academic Year '{dto.AcademicYear}' not found.");

            var firstNameTrimmed = (dto.FirstName ?? "").Trim();
            var lastNameTrimmed = (dto.LastName ?? "").Trim();
            var fullName = $"{firstNameTrimmed} {lastNameTrimmed}".ToLower();
            var mobile = (dto.MobileNumber ?? "").Trim();
            var dupKey = $"{fullName}|{mobile}";

            if (existingStudents.Any(s => (s.FirstName.ToLower() + " " + s.LastName.ToLower()) == fullName && s.MobileNumber == mobile))
                rowErrors.Add("Student already exists in database (Name + Mobile).");
            
            if (internalTrack.Contains(dupKey))
                rowErrors.Add("Duplicate entry found within this file.");
            else internalTrack.Add(dupKey);

            if (!string.IsNullOrWhiteSpace(dto.AdmissionNo))
            {
                var admTrimmed = dto.AdmissionNo.Trim().ToLower();
                if (existingStudents.Any(s => s.AdmissionNo?.ToLower() == admTrimmed))
                    rowErrors.Add("Admission Number is already taken.");
            }

            // Email Duplicate check in validation
            if (!string.IsNullOrWhiteSpace(dto.Email))
            {
                var emailTrimmed = dto.Email.Trim().ToLower();
                if (existingStudents.Any(s => s.Email?.ToLower() == emailTrimmed))
                    rowErrors.Add($"Email '{dto.Email}' is already registered with another student.");
                
                if (internalTrack.Contains(emailTrimmed))
                    rowErrors.Add($"Duplicate email '{dto.Email}' found within this file.");
                else internalTrack.Add(emailTrimmed);
            }

            var (resolvedClassId, _) = await ResolveAcademicIds(dto.ClassId, dto.ClassName, dto.SectionId, dto.SectionName);
            if (resolvedClassId == Guid.Empty) rowErrors.Add($"Class '{dto.ClassName ?? dto.ClassId}' not found.");

            results.Add(new { Row = i + 1, Errors = rowErrors, Status = rowErrors.Any() ? "invalid" : "valid" });
        }

        return Ok(results);
    }

    [HttpPost("bulk")]
    [RequireModulePermission("students", requiresWrite: true)]
    public async Task<IActionResult> BulkAddStudents([FromBody] IEnumerable<CreateStudentDto> dtos)
    {
        if (dtos == null || !dtos.Any()) return BadRequest("No students provided.");

        var dtosList = dtos.ToList();
        var errors = new List<object>();

        // 1. Fetch Masters for validation
        var activeAcademicYears = await _unitOfWork.Repository<AcademicYear>().GetQueryable()
            .Where(ay => ay.IsActive).ToListAsync();
        
        var existingStudents = await _unitOfWork.Repository<Student>().GetQueryable()
            .Select(s => new { s.FirstName, s.LastName, s.MobileNumber, s.AdmissionNo, s.Email })
            .ToListAsync();
        
        var toAddStudents = new List<Student>();
        var academicMappings = new List<StudentAcademic>();
        
        // Tracking within the current batch to prevent internal duplicates
        var internalTrack = new HashSet<string>();

        for (int i = 0; i < dtosList.Count; i++)
        {
            var dto = dtosList[i];
            var rowErrors = new List<string>();

            // Basic Validation
            if (string.IsNullOrWhiteSpace(dto.FirstName)) rowErrors.Add("First Name is required.");
            if (string.IsNullOrWhiteSpace(dto.LastName)) rowErrors.Add("Last Name is required.");
            if (string.IsNullOrWhiteSpace(dto.MobileNumber)) rowErrors.Add("Mobile Number is required.");
            
            // Academic Year Validation
            if (string.IsNullOrWhiteSpace(dto.AcademicYear)) 
            {
                rowErrors.Add("Academic Year is required.");
            }
            else if (!activeAcademicYears.Any(ay => ay.Name.Equals(dto.AcademicYear.Trim(), StringComparison.OrdinalIgnoreCase)))
            {
                rowErrors.Add($"Academic Year '{dto.AcademicYear}' is not valid or active.");
            }

            // Duplicacy Check (Name + Mobile)
            var firstNameTrimmed = (dto.FirstName ?? "").Trim();
            var lastNameTrimmed = (dto.LastName ?? "").Trim();
            var fullName = $"{firstNameTrimmed} {lastNameTrimmed}".ToLower();
            var mobile = (dto.MobileNumber ?? "").Trim();
            var duplicateKey = $"{fullName}|{mobile}";

            // Check against existing database
            if (existingStudents.Any(s => 
                (s.FirstName.ToLower() + " " + s.LastName.ToLower()) == fullName && 
                s.MobileNumber == mobile))
            {
                rowErrors.Add($"Student '{fullName}' with mobile '{mobile}' already exists in the system.");
            }
            
            // Check against current batch
            if (internalTrack.Contains(duplicateKey))
            {
                rowErrors.Add($"Duplicate student '{fullName}' with mobile '{mobile}' found within the import list.");
            }
            else
            {
                internalTrack.Add(duplicateKey);
            }

            // Admission No Duplicacy (if provided)
            if (!string.IsNullOrWhiteSpace(dto.AdmissionNo))
            {
                var admTrimmed = dto.AdmissionNo.Trim().ToLower();
                if (existingStudents.Any(s => s.AdmissionNo?.ToLower() == admTrimmed))
                {
                    rowErrors.Add($"Admission Number '{dto.AdmissionNo}' is already taken.");
                }
            }

            // Email Duplicacy
            if (!string.IsNullOrWhiteSpace(dto.Email))
            {
                var emailTrimmed = dto.Email.Trim().ToLower();
                if (existingStudents.Any(s => s.Email?.ToLower() == emailTrimmed))
                {
                    rowErrors.Add($"Email '{dto.Email}' is already registered in the system.");
                }
                
                if (internalTrack.Contains(emailTrimmed))
                {
                    rowErrors.Add($"Duplicate email '{dto.Email}' found within the import list.");
                }
                else
                {
                    internalTrack.Add(emailTrimmed);
                }
            }

            if (rowErrors.Any())
            {
                errors.Add(new { Row = i + 1, Errors = rowErrors });
                continue;
            }

            // Resolve Class and Section
            var (resolvedClassId, resolvedSectionId) = await ResolveAcademicIds(dto.ClassId, dto.ClassName, dto.SectionId, dto.SectionName);
            if (resolvedClassId == Guid.Empty)
            {
                errors.Add(new { Row = i + 1, Errors = new[] { $"Could not resolve Class '{dto.ClassName ?? dto.ClassId}'." } });
                continue;
            }

            // Map and Add to collection
            var student = MapFromDto(dto);
            toAddStudents.Add(student);

            academicMappings.Add(new StudentAcademic
            {
                StudentId = student.Id,
                ClassId = resolvedClassId,
                SectionId = resolvedSectionId,
                AcademicYear = dto.AcademicYear.Trim(),
                RollNumber = dto.RollNumber,
                IsCurrent = true,
                Status = "Active"
            });
        }

        if (errors.Any())
        {
            return BadRequest(new { Message = "One or more validation errors occurred during bulk import.", Details = errors });
        }

        // Apply to database
        foreach (var s in toAddStudents) await _unitOfWork.Repository<Student>().AddAsync(s);
        foreach (var a in academicMappings) await _unitOfWork.Repository<StudentAcademic>().AddAsync(a);

        await _unitOfWork.CompleteAsync();

        return Ok(new { count = toAddStudents.Count, success = true });
    }

    private Student MapFromDto(CreateStudentDto dto)
    {
        var student = new Student
        {
            AdmissionNo = string.IsNullOrWhiteSpace(dto.AdmissionNo) ? GenerateAdmissionNo() : dto.AdmissionNo,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Gender = dto.Gender,
            DateOfBirth = DateTime.TryParse(dto.DateOfBirth, out var dobInit) ? dobInit : null,
            BloodGroup = dto.BloodGroup,
            StudentPhoto = dto.StudentPhoto,
            MobileNumber = dto.MobileNumber,
            Email = dto.Email,
            AddressLine1 = dto.AddressLine1,
            AddressLine2 = dto.AddressLine2,
            City = dto.City,
            State = dto.State,
            Pincode = dto.Pincode,
            AdmissionDate = dto.AdmissionDate,
            PreviousSchool = dto.PreviousSchool,
            FatherName = dto.FatherName,
            FatherMobile = dto.FatherMobile,
            FatherEmail = dto.FatherEmail,
            FatherOccupation = dto.FatherOccupation,
            MotherName = dto.MotherName,
            MotherMobile = dto.MotherMobile,
            MotherEmail = dto.MotherEmail,
            MotherOccupation = dto.MotherOccupation,
            GuardianName = dto.GuardianName,
            GuardianMobile = dto.GuardianMobile,
            GuardianEmail = dto.GuardianEmail,
            GuardianRelation = dto.GuardianRelation,
            EmergencyContactName = dto.EmergencyContactName,
            EmergencyContactNumber = dto.EmergencyContactNumber,
            EmergencyContactRelation = dto.EmergencyContactRelation,
            ConsentAccepted = dto.ConsentAccepted,
            LedgerNumber = dto.LedgerNumber,
            SRNNumber = dto.SRNNumber,
            PermanentEducationNo = dto.PermanentEducationNo,
            FamilyId = dto.FamilyId,
            ApaarId = dto.ApaarId,
            Medium = dto.Medium,
            EnrollmentSchoolName = dto.EnrollmentSchoolName,
            OpeningBalance = dto.OpeningBalance,
            AdmissionScheme = dto.AdmissionScheme,
            AdmissionType = dto.AdmissionType,
            Religion = dto.Religion,
            Category = dto.Category,
            Caste = dto.Caste,
            PlaceOfBirth = dto.PlaceOfBirth,
            HeightInCM = decimal.TryParse(dto.HeightInCM, out var h) ? h : null,
            WeightInKG = decimal.TryParse(dto.WeightInKG, out var w) ? w : null,
            ColorVision = dto.ColorVision,
            PreviousClass = dto.PreviousClass,
            TCNo = dto.TCNo,
            TCDate = DateTime.TryParse(dto.TCDate, out var tc) ? tc : null,
            HouseName = dto.HouseName,
            IsCaptain = dto.IsCaptain,
            IsMonitor = dto.IsMonitor,
            Bus = dto.Bus,
            RouteName = dto.RouteName,
            StoppageName = dto.StoppageName,
            BusFee = dto.BusFee,
            StudentAadharNo = dto.StudentAadharNo,
            StudentBankAccountNo = dto.StudentBankAccountNo,
            StudentBankName = dto.StudentBankName,
            StudentIFSCCODE = dto.StudentIFSCCODE,
            FatherAadharNo = dto.FatherAadharNo,
            ParentAccountNo = dto.ParentAccountNo,
            ParentBankName = dto.ParentBankName,
            ParentBankIFSCCODE = dto.ParentBankIFSCCODE,
            MotherAadharNo = dto.MotherAadharNo,
            RegistrationNumber = dto.RegistrationNumber,
            AnnualIncome = dto.AnnualIncome,
            FatherQualification = dto.FatherQualification,
            MotherQualification = dto.MotherQualification,
            ParentMobileNumber = dto.ParentMobileNumber,
            ParentEmail = dto.ParentEmail,
            ParentOccupation = dto.ParentOccupation,
            ParentQualification = dto.ParentQualification,
            SMSFacility = dto.SMSFacility,
            SMSMobileNumber = dto.SMSMobileNumber,
            PermanentAddress = dto.PermanentAddress,
            IsActive = true
        };

        foreach (var course in dto.CourseIds)
        {
            student.EnrolledCourses.Add(new StudentCourse
            {
                CourseId = course.CourseId,
                BatchId = course.BatchId,
                StartDate = DateTime.UtcNow,
                Status = "Active"
            });
        }

        return student;
    }

    [HttpPost("{id}/update")]
    [RequireModulePermission("students", requiresWrite: true)]
    public async Task<IActionResult> UpdateStudent(Guid id, [FromBody] UpdateStudentDto dto)
    {
        var student = await _unitOfWork.Repository<Student>().GetQueryable()
            .Include(s => s.EnrolledCourses)
            .Include(s => s.AcademicRecords)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (student == null) return NotFound();

        // Email Duplicate Check on Update
        if (!string.IsNullOrWhiteSpace(dto.Email))
        {
            var emailTrimmed = dto.Email.Trim().ToLower();
            var isEmailDup = await _unitOfWork.Repository<Student>().GetQueryable()
                .AnyAsync(s => s.Email != null && s.Email.ToLower() == emailTrimmed && s.Id != id);
            if (isEmailDup) return BadRequest(new { Message = $"Email '{dto.Email}' is already registered with another student." });
        }

        student.FirstName = dto.FirstName;
        student.LastName = dto.LastName;
        student.Gender = dto.Gender;
        student.DateOfBirth = DateTime.TryParse(dto.DateOfBirth, out var dobUpd) ? dobUpd : null;
        student.BloodGroup = dto.BloodGroup;
        student.StudentPhoto = dto.StudentPhoto;
        student.MobileNumber = dto.MobileNumber;
        student.Email = dto.Email;
        student.AddressLine1 = dto.AddressLine1;
        student.AddressLine2 = dto.AddressLine2;
        student.City = dto.City;
        student.State = dto.State;
        student.Pincode = dto.Pincode;
        student.PreviousSchool = dto.PreviousSchool;
        student.FatherName = dto.FatherName;
        student.FatherMobile = dto.FatherMobile;
        student.FatherEmail = dto.FatherEmail;
        student.FatherOccupation = dto.FatherOccupation;
        student.MotherName = dto.MotherName;
        student.MotherMobile = dto.MotherMobile;
        student.MotherEmail = dto.MotherEmail;
        student.MotherOccupation = dto.MotherOccupation;
        student.GuardianName = dto.GuardianName;
        student.GuardianMobile = dto.GuardianMobile;
        student.GuardianEmail = dto.GuardianEmail;
        student.GuardianRelation = dto.GuardianRelation;
        student.EmergencyContactName = dto.EmergencyContactName;
        student.EmergencyContactNumber = dto.EmergencyContactNumber;
        student.EmergencyContactRelation = dto.EmergencyContactRelation;
        student.LedgerNumber = dto.LedgerNumber;
        student.SRNNumber = dto.SRNNumber;
        student.PermanentEducationNo = dto.PermanentEducationNo;
        student.FamilyId = dto.FamilyId;
        student.ApaarId = dto.ApaarId;
        student.Medium = dto.Medium;
        student.EnrollmentSchoolName = dto.EnrollmentSchoolName;
        student.OpeningBalance = dto.OpeningBalance;
        student.AdmissionScheme = dto.AdmissionScheme;
        student.AdmissionType = dto.AdmissionType;
        student.Religion = dto.Religion;
        student.Category = dto.Category;
        student.Caste = dto.Caste;
        student.PlaceOfBirth = dto.PlaceOfBirth;
        student.HeightInCM = decimal.TryParse(dto.HeightInCM, out var h) ? h : null;
        student.WeightInKG = decimal.TryParse(dto.WeightInKG, out var w) ? w : null;
        student.ColorVision = dto.ColorVision;
        student.PreviousClass = dto.PreviousClass;
        student.TCNo = dto.TCNo;
        student.TCDate = DateTime.TryParse(dto.TCDate, out var tc) ? tc : null;
        student.HouseName = dto.HouseName;
        student.IsCaptain = dto.IsCaptain;
        student.IsMonitor = dto.IsMonitor;
        student.Bus = dto.Bus;
        student.RouteName = dto.RouteName;
        student.StoppageName = dto.StoppageName;
        student.BusFee = dto.BusFee;
        student.StudentAadharNo = dto.StudentAadharNo;
        student.StudentBankAccountNo = dto.StudentBankAccountNo;
        student.StudentBankName = dto.StudentBankName;
        student.StudentIFSCCODE = dto.StudentIFSCCODE;
        student.FatherAadharNo = dto.FatherAadharNo;
        student.ParentAccountNo = dto.ParentAccountNo;
        student.ParentBankName = dto.ParentBankName;
        student.ParentBankIFSCCODE = dto.ParentBankIFSCCODE;
        student.MotherAadharNo = dto.MotherAadharNo;
        student.RegistrationNumber = dto.RegistrationNumber;
        student.AnnualIncome = dto.AnnualIncome;
        student.FatherQualification = dto.FatherQualification;
        student.MotherQualification = dto.MotherQualification;
        student.ParentMobileNumber = dto.ParentMobileNumber;
        student.ParentEmail = dto.ParentEmail;
        student.ParentOccupation = dto.ParentOccupation;
        student.ParentQualification = dto.ParentQualification;
        student.SMSFacility = dto.SMSFacility;
        student.SMSMobileNumber = dto.SMSMobileNumber;
        student.PermanentAddress = dto.PermanentAddress;
        student.IsActive = dto.IsActive;

        // Update CURRENT academic record
        var currentAcademic = student.AcademicRecords.FirstOrDefault(sa => sa.IsCurrent);
        if (currentAcademic != null)
        {
            currentAcademic.ClassId = Guid.TryParse(dto.ClassId, out var cidUpd) ? cidUpd : currentAcademic.ClassId;
            currentAcademic.SectionId = Guid.TryParse(dto.SectionId, out var sidUpd) ? sidUpd : currentAcademic.SectionId;
            
            if (!string.IsNullOrWhiteSpace(dto.AcademicYear))
            {
                if (Guid.TryParse(dto.AcademicYear, out var ayGuidUpd))
                {
                    var ayUpd = await _unitOfWork.Repository<AcademicYear>().GetByIdAsync(ayGuidUpd);
                    if (ayUpd != null) currentAcademic.AcademicYear = ayUpd.Name;
                }
                else
                {
                    currentAcademic.AcademicYear = dto.AcademicYear;
                }
            }
            
            currentAcademic.RollNumber = dto.RollNumber ?? currentAcademic.RollNumber;
            _unitOfWork.Repository<StudentAcademic>().Update(currentAcademic);
        }
        else if (!string.IsNullOrEmpty(dto.ClassId) && !string.IsNullOrEmpty(dto.AcademicYear)) 
        {
             var resolvedAYName = dto.AcademicYear;
             if (Guid.TryParse(dto.AcademicYear, out var ayGuidNew))
             {
                 var ayNew = await _unitOfWork.Repository<AcademicYear>().GetByIdAsync(ayGuidNew);
                 if (ayNew != null) resolvedAYName = ayNew.Name;
             }

             var newAcademic = new StudentAcademic {
                 StudentId = student.Id,
                 ClassId = Guid.Parse(dto.ClassId),
                 SectionId = Guid.TryParse(dto.SectionId, out var sidN) ? sidN : null,
                 AcademicYear = resolvedAYName,
                 RollNumber = dto.RollNumber,
                 IsCurrent = true,
                 Status = "Active"
             };
             await _unitOfWork.Repository<StudentAcademic>().AddAsync(newAcademic);
        }

        // Soft sync courses
        student.EnrolledCourses.Clear();
        foreach (var course in dto.CourseIds)
        {
            student.EnrolledCourses.Add(new StudentCourse
            {
                StudentId = student.Id,
                CourseId = course.CourseId,
                BatchId = course.BatchId,
                StartDate = DateTime.UtcNow,
                Status = "Active"
            });
        }

        _unitOfWork.Repository<Student>().Update(student);
        await _unitOfWork.CompleteAsync();

        // Sync Selective Fee Subscriptions
        if (dto.FeeSubscriptions != null)
        {
            var existingSubs = await _feeService.GetStudentSubscriptionsAsync(student.Id);
            // Delete ones not in DTO
            foreach (var sub in existingSubs)
            {
                if (!dto.FeeSubscriptions.Any(x => x.FeeHeadId == sub.FeeHeadId))
                {
                    await _feeService.DeleteSubscriptionAsync(sub.Id);
                }
            }
            // Add or update
            foreach (var subDto in dto.FeeSubscriptions)
            {
                var existing = existingSubs.FirstOrDefault(x => x.FeeHeadId == subDto.FeeHeadId);
                if (existing == null)
                {
                    await _feeService.CreateSubscriptionAsync(new CreateStudentFeeSubscriptionRequest
                    {
                        StudentId = student.Id,
                        FeeHeadId = subDto.FeeHeadId,
                        CustomAmount = subDto.CustomAmount,
                        IsActive = true
                    });
                }
                else if (existing.CustomAmount != subDto.CustomAmount)
                {
                    await _feeService.UpdateSubscriptionAsync(existing.Id, new CreateStudentFeeSubscriptionRequest
                    {
                        StudentId = student.Id,
                        FeeHeadId = subDto.FeeHeadId,
                        CustomAmount = subDto.CustomAmount,
                        IsActive = true
                    });
                }
            }
        }

        // Sync Discounts (for current academic year)
        if (dto.FeeDiscounts != null)
        {
            var existingDiscounts = await _feeService.GetStudentDiscountsAsync(student.Id);
            // Delete ones not in DTO (matching current year)
            foreach (var disc in existingDiscounts)
            {
                if (!dto.FeeDiscounts.Any(x => x.FeeDiscountId == disc.FeeDiscountId && x.FeeHeadId == disc.RestrictedFeeHeadId))
                {
                    // Manual delete if no service method
                    _unitOfWork.Repository<FeeDiscountAssignment>().Delete(disc);
                }
            }
            // Add new
            foreach (var discDto in dto.FeeDiscounts)
            {
                if (!existingDiscounts.Any(x => x.FeeDiscountId == discDto.FeeDiscountId && x.RestrictedFeeHeadId == discDto.FeeHeadId))
                {
                    await _feeService.AssignDiscountAsync(new FeeDiscountAssignment
                    {
                        StudentId = student.Id,
                        FeeDiscountId = discDto.FeeDiscountId,
                        RestrictedFeeHeadId = discDto.FeeHeadId,
                        AcademicYearId = discDto.AcademicYearId,
                        Remarks = discDto.Remarks,
                        CustomCalculationType = discDto.CalculationType,
                        CustomValue = discDto.Value,
                        CustomFrequency = discDto.Frequency,
                        IsActive = true
                    });
                }
            }
            await _unitOfWork.CompleteAsync();
        }

        return Ok(MapToDto(student));
    }

    [HttpPost("{id}/delete")]
    [RequireModulePermission("students", requiresWrite: true)]
    public async Task<IActionResult> DeleteStudent(Guid id) // Soft Delete
    {
        var student = await _unitOfWork.Repository<Student>().GetByIdAsync(id);
        if (student == null) return NotFound();

        student.IsActive = false;
        
        _unitOfWork.Repository<Student>().Update(student);
        await _unitOfWork.CompleteAsync();

        return NoContent();
    }

    private string GenerateAdmissionNo() => $"ADM{DateTime.UtcNow:yyyyMMddHHmmss}";

    private StudentDto MapToDto(Student student)
    {
        var currentAcademic = student.AcademicRecords.FirstOrDefault(a => a.IsCurrent);
        return new StudentDto
        {
            Id = student.Id,
            AdmissionNo = student.AdmissionNo,
            FirstName = student.FirstName,
            LastName = student.LastName,
            Gender = student.Gender,
            DateOfBirth = student.DateOfBirth,
            BloodGroup = student.BloodGroup,
            StudentPhoto = student.StudentPhoto,
            MobileNumber = student.MobileNumber,
            Email = student.Email,
            AddressLine1 = student.AddressLine1,
            AddressLine2 = student.AddressLine2,
            City = student.City,
            State = student.State,
            Pincode = student.Pincode,
            AdmissionDate = student.AdmissionDate,
            PreviousSchool = student.PreviousSchool,
            FatherName = student.FatherName,
            FatherMobile = student.FatherMobile,
            FatherEmail = student.FatherEmail,
            FatherOccupation = student.FatherOccupation,
            MotherName = student.MotherName,
            MotherMobile = student.MotherMobile,
            MotherEmail = student.MotherEmail,
            MotherOccupation = student.MotherOccupation,
            GuardianName = student.GuardianName,
            GuardianMobile = student.GuardianMobile,
            GuardianEmail = student.GuardianEmail,
            GuardianRelation = student.GuardianRelation,
            EmergencyContactName = student.EmergencyContactName,
            EmergencyContactNumber = student.EmergencyContactNumber,
            EmergencyContactRelation = student.EmergencyContactRelation,
            LedgerNumber = student.LedgerNumber,
            SRNNumber = student.SRNNumber,
            PermanentEducationNo = student.PermanentEducationNo,
            FamilyId = student.FamilyId,
            ApaarId = student.ApaarId,
            Medium = student.Medium,
            EnrollmentSchoolName = student.EnrollmentSchoolName,
            OpeningBalance = student.OpeningBalance,
            AdmissionScheme = student.AdmissionScheme,
            AdmissionType = student.AdmissionType,
            Religion = student.Religion,
            Category = student.Category,
            Caste = student.Caste,
            PlaceOfBirth = student.PlaceOfBirth,
            HeightInCM = student.HeightInCM,
            WeightInKG = student.WeightInKG,
            ColorVision = student.ColorVision,
            PreviousClass = student.PreviousClass,
            TCNo = student.TCNo,
            TCDate = student.TCDate,
            HouseName = student.HouseName,
            IsCaptain = student.IsCaptain,
            IsMonitor = student.IsMonitor,
            Bus = student.Bus,
            RouteName = student.RouteName,
            StoppageName = student.StoppageName,
            BusFee = student.BusFee,
            StudentAadharNo = student.StudentAadharNo,
            StudentBankAccountNo = student.StudentBankAccountNo,
            StudentBankName = student.StudentBankName,
            StudentIFSCCODE = student.StudentIFSCCODE,
            FatherAadharNo = student.FatherAadharNo,
            ParentAccountNo = student.ParentAccountNo,
            ParentBankName = student.ParentBankName,
            ParentBankIFSCCODE = student.ParentBankIFSCCODE,
            MotherAadharNo = student.MotherAadharNo,
            RegistrationNumber = student.RegistrationNumber,
            AnnualIncome = student.AnnualIncome,
            FatherQualification = student.FatherQualification,
            MotherQualification = student.MotherQualification,
            ParentMobileNumber = student.ParentMobileNumber,
            ParentEmail = student.ParentEmail,
            ParentOccupation = student.ParentOccupation,
            ParentQualification = student.ParentQualification,
            SMSFacility = student.SMSFacility,
            SMSMobileNumber = student.SMSMobileNumber,
            PermanentAddress = student.PermanentAddress,
            IsActive = student.IsActive,
            IsMobileVerified = student.IsMobileVerified,
            IsEmailVerified = student.IsEmailVerified,
            ClassId = currentAcademic?.ClassId,
            SectionId = currentAcademic?.SectionId,
            RollNumber = currentAcademic?.RollNumber,
            AcademicYear = currentAcademic?.AcademicYear,
            Status = currentAcademic?.Status,
            EnrolledCourses = student.EnrolledCourses.Select(ec => new StudentCourseDto
            {
                CourseId = ec.CourseId,
                CourseName = ec.Course?.Name ?? string.Empty,
                BatchId = ec.BatchId,
                StartDate = ec.StartDate,
                EndDate = ec.EndDate,
                Status = ec.Status
            }).ToList()
        };
    }

    private async Task<(Guid classId, Guid? sectionId)> ResolveAcademicIds(string? classIdStr, string? className, string? sectionIdStr, string? sectionName)
    {
        Guid resolvedClassId = Guid.Empty;
        Guid? resolvedSectionId = null;

        if (Guid.TryParse(classIdStr, out var cid) && cid != Guid.Empty)
        {
            resolvedClassId = cid;
        }
        else if (!string.IsNullOrWhiteSpace(className))
        {
            var cls = await _unitOfWork.Repository<AcademicClass>().GetQueryable()
                .FirstOrDefaultAsync(c => c.Name.ToLower() == className.ToLower().Trim());
            if (cls != null) resolvedClassId = cls.Id;
        }

        if (Guid.TryParse(sectionIdStr, out var sid))
        {
            resolvedSectionId = sid;
        }
        else if (!string.IsNullOrWhiteSpace(sectionName))
        {
            var sec = await _unitOfWork.Repository<AcademicSection>().GetQueryable()
                .FirstOrDefaultAsync(s => s.Name.ToLower() == sectionName.ToLower().Trim());
            if (sec != null) resolvedSectionId = sec.Id;
        }

        return (resolvedClassId, resolvedSectionId);
    }
}
