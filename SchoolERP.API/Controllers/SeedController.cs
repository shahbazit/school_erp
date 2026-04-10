using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Interfaces;
using SchoolERP.Domain.Entities;
using SchoolERP.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace SchoolERP.API.Controllers;

[Authorize]
[ApiController]
[Route("api/seed")]
public class SeedController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IOrganizationService _organizationService;

    public SeedController(IUnitOfWork unitOfWork, IOrganizationService organizationService)
    {
        _unitOfWork = unitOfWork;
        _organizationService = organizationService;
    }

    [HttpGet("default-data")]
    public IActionResult GetDefaultData()
    {
        return Ok(new
        {
            Lookups = GetDefaultLookups(),
            Classes = new[] { "Playgroup", "Nursery", "LKG", "UKG", "Class-1", "Class-2", "Class-3", "Class-4", "Class-5", "Class-6", "Class-7", "Class-8", "Class-9", "Class-10", "Class-11", "Class-12" },
            Sections = new[] { "A", "B", "C" },
            Departments = new[] { "Administration", "Academic", "Finance", "Back Office", "Transport", "Security" },
            Designations = new[] { "Principal", "Vice Principal", "HOD", "Senior Teacher", "Teacher", "Accountant", "Clerk", "Librarian", "Coordinator" },
            Subjects = new[] { 
                new { Name = "English", Code = "ENG" }, new { Name = "Hindi", Code = "HIN" }, new { Name = "Mathematics", Code = "MATH" }, 
                new { Name = "Science", Code = "SCI" }, new { Name = "Social Science", Code = "SOC" }, new { Name = "Computer Science", Code = "COMP" },
                new { Name = "Physics", Code = "PHY" }, new { Name = "Chemistry", Code = "CHEM" }, new { Name = "Biology", Code = "BIO" }
            },
            FeeHeads = new[] {
                new { Name = "Admission Fee", IsSelective = false }, new { Name = "Registration Fee", IsSelective = false }, new { Name = "Tuition Fee", IsSelective = false }, new { Name = "Examination Fee", IsSelective = false },
                new { Name = "Computer Fee", IsSelective = false }, new { Name = "Library Fee", IsSelective = false }, new { Name = "Sports Fee", IsSelective = false },
                new { Name = "Transport Fee", IsSelective = true }, new { Name = "Hostel Fee", IsSelective = true }, new { Name = "Fine", IsSelective = false }
            },
            AcademicYears = new[] { 
                new { 
                    Name = $"{DateTime.Now.Year - 1}-{DateTime.Now.Year % 100:D2}", 
                    StartDate = new DateTime(DateTime.Now.Year - 1, 4, 1), 
                    EndDate = new DateTime(DateTime.Now.Year, 3, 31), 
                    IsCurrent = false 
                },
                new { 
                    Name = $"{DateTime.Now.Year}-{(DateTime.Now.Year + 1) % 100:D2}", 
                    StartDate = new DateTime(DateTime.Now.Year, 4, 1), 
                    EndDate = new DateTime(DateTime.Now.Year + 1, 3, 31), 
                    IsCurrent = true 
                },
                new { 
                    Name = $"{DateTime.Now.Year + 1}-{(DateTime.Now.Year + 2) % 100:D2}", 
                    StartDate = new DateTime(DateTime.Now.Year + 1, 4, 1), 
                    EndDate = new DateTime(DateTime.Now.Year + 2, 3, 31), 
                    IsCurrent = false 
                } 
            },
            EmployeeRoles = new[] { "Admin", "Teacher", "Accountant", "Staff" },
            MenuMasters = GetDefaultMenuMasters(),
            FeeDiscounts = GetDefaultFeeDiscounts(),
            FeePolicy = GetDefaultFeePolicy()
        });
    }

    [HttpPost("default-data")]
    public async Task<IActionResult> SeedDefaultData()
    {
        var orgId = _organizationService.GetOrganizationId();
        if (orgId == Guid.Empty) return BadRequest("Organization context not found.");

        var results = new List<string>();

        // 1. Seed Lookups
        await SeedLookups(orgId, results);

        // 2. Seed Academic Years
        await SeedAcademicYears(orgId, results);

        // 3. Seed Classes
        await SeedClasses(orgId, results);

        // 4. Seed Sections
        await SeedSections(orgId, results);

        // 5. Seed Departments
        await SeedDepartments(orgId, results);

        // 6. Seed Designations
        await SeedDesignations(orgId, results);

        // 7. Seed Subjects
        await SeedSubjects(orgId, results);

        // 8. Seed Fee Heads
        await SeedFeeHeads(orgId, results);

        // 9. Seed Employee Roles
        await SeedEmployeeRoles(orgId, results);

        // 10. Seed Default Leave Plan
        await SeedLeavePlans(orgId, results);

        await SeedDiscounts(orgId, results);
        await SeedFeeConfig(orgId, results);
        // await SeedInitialStaff(orgId, results); // Removed redundant seeding of developer user across organizations

        await _unitOfWork.CompleteAsync();

        return Ok(new { Message = "Seed operation completed", Details = results });
    }

    [HttpPost("seed-custom")]
    public async Task<IActionResult> SeedCustomData([FromBody] CustomSeedRequest request)
    {
        var orgId = _organizationService.GetOrganizationId();
        if (orgId == Guid.Empty) return BadRequest("Organization context not found.");

        var results = new List<string>();

        if (request.Lookups != null) await SeedLookupsCustom(orgId, request.Lookups, results);
        if (request.Classes != null) await SeedClassesCustom(orgId, request.Classes, results);
        if (request.Sections != null) await SeedSectionsCustom(orgId, request.Sections, results);
        if (request.Departments != null) await SeedDepartmentsCustom(orgId, request.Departments, results);
        if (request.Designations != null) await SeedDesignationsCustom(orgId, request.Designations, results);
        if (request.Subjects != null) await SeedSubjectsCustom(orgId, request.Subjects, results);
        if (request.FeeHeads != null) await SeedFeeHeadsCustom(orgId, request.FeeHeads, results);
        if (request.AcademicYears != null) await SeedAcademicYearsCustom(orgId, request.AcademicYears, results);
        if (request.MenuMasters != null) await SeedMenuMastersCustom(request.MenuMasters, results);
        if (request.FeeDiscounts != null) await SeedFeeDiscountsCustom(orgId, request.FeeDiscounts, results);
        if (request.FeePolicy != null) await SeedFeeConfigCustom(orgId, request.FeePolicy, results);

        await _unitOfWork.CompleteAsync();

        return Ok(new { Message = "Custom seed operation completed", Details = results });
    }

    public class CustomSeedRequest
    {
        public List<LookupSeedDto>? Lookups { get; set; }
        public List<string>? Classes { get; set; }
        public List<string>? Sections { get; set; }
        public List<string>? Departments { get; set; }
        public List<string>? Designations { get; set; }
        public List<SubjectSeedDto>? Subjects { get; set; }
        public List<FeeHeadSeedDto>? FeeHeads { get; set; }
        public List<AcademicYearSeedDto>? AcademicYears { get; set; }
        public List<MenuMasterSeedDto>? MenuMasters { get; set; }
        public List<FeeDiscountSeedDto>? FeeDiscounts { get; set; }
        public List<FeeConfigSeedDto>? FeePolicy { get; set; }
    }

    public class LookupSeedDto { public LookupType Type { get; set; } public string Code { get; set; } = string.Empty; public string Name { get; set; } = string.Empty; }
    public class SubjectSeedDto { public string Code { get; set; } = string.Empty; public string Name { get; set; } = string.Empty; }
    public class FeeHeadSeedDto { public string Name { get; set; } = string.Empty; public bool IsSelective { get; set; } }
    public class AcademicYearSeedDto { public string Name { get; set; } = string.Empty; public DateTime StartDate { get; set; } public DateTime EndDate { get; set; } public bool IsCurrent { get; set; } }
    public class MenuMasterSeedDto { public string Key { get; set; } = string.Empty; public string Label { get; set; } = string.Empty; public string? Icon { get; set; } public int SortOrder { get; set; } }
    public class FeeDiscountSeedDto { public string Name { get; set; } = string.Empty; public string Category { get; set; } = "Other"; public string CalculationType { get; set; } = "Fixed"; public decimal Value { get; set; } public string Frequency { get; set; } = "Monthly"; }
    public class FeeConfigSeedDto { public int MonthlyDueDay { get; set; } = 10; public int GracePeriodDays { get; set; } = 5; public string LateFeeType { get; set; } = "Fixed"; public decimal LateFeeAmount { get; set; } = 500; public bool AutoCalculateLateFee { get; set; } = true; }

    private async Task SeedLookupsCustom(Guid orgId, List<LookupSeedDto> lookups, List<string> results)
    {
        var repo = _unitOfWork.Repository<Lookup>();
        int added = 0;
        foreach (var l in lookups)
        {
            var exists = await repo.GetQueryable().AnyAsync(x => x.OrganizationId == orgId && x.Type == l.Type && (x.Code == l.Code || x.Name == l.Name));
            if (!exists)
            {
                await repo.AddAsync(new Lookup { OrganizationId = orgId, Type = l.Type, Code = l.Code, Name = l.Name });
                added++;
            }
        }
        results.Add($"{added} lookups added, {lookups.Count - added} skipped (duplicates).");
    }

    private async Task SeedClassesCustom(Guid orgId, List<string> items, List<string> results)
    {
        var repo = _unitOfWork.Repository<AcademicClass>();
        int added = 0;
        for (int i = 0; i < items.Count; i++)
        {
            var exists = await repo.GetQueryable().AnyAsync(x => x.OrganizationId == orgId && x.Name == items[i]);
            if (!exists)
            {
                await repo.AddAsync(new AcademicClass { OrganizationId = orgId, Name = items[i], Order = i + 1, IsActive = true });
                added++;
            }
        }
        results.Add($"{added} classes added, {items.Count - added} skipped.");
    }

    private async Task SeedSectionsCustom(Guid orgId, List<string> items, List<string> results)
    {
        var repo = _unitOfWork.Repository<AcademicSection>();
        int added = 0;
        foreach (var s in items)
        {
            var exists = await repo.GetQueryable().AnyAsync(x => x.OrganizationId == orgId && x.Name == s);
            if (!exists)
            {
                await repo.AddAsync(new AcademicSection { OrganizationId = orgId, Name = s, IsActive = true });
                added++;
            }
        }
        results.Add($"{added} sections added.");
    }

    private async Task SeedDepartmentsCustom(Guid orgId, List<string> items, List<string> results)
    {
        var repo = _unitOfWork.Repository<Department>();
        int added = 0;
        foreach (var d in items)
        {
            var exists = await repo.GetQueryable().AnyAsync(x => x.OrganizationId == orgId && x.Name == d);
            if (!exists)
            {
                await repo.AddAsync(new Department { OrganizationId = orgId, Name = d, IsActive = true });
                added++;
            }
        }
        results.Add($"{added} departments added.");
    }

    private async Task SeedDesignationsCustom(Guid orgId, List<string> items, List<string> results)
    {
        var repo = _unitOfWork.Repository<Designation>();
        int added = 0;
        foreach (var d in items)
        {
            var exists = await repo.GetQueryable().AnyAsync(x => x.OrganizationId == orgId && x.Name == d);
            if (!exists)
            {
                await repo.AddAsync(new Designation { OrganizationId = orgId, Name = d, IsActive = true });
                added++;
            }
        }
        results.Add($"{added} designations added.");
    }

    private async Task SeedSubjectsCustom(Guid orgId, List<SubjectSeedDto> items, List<string> results)
    {
        var repo = _unitOfWork.Repository<Subject>();
        int added = 0;
        foreach (var s in items)
        {
            var exists = await repo.GetQueryable().AnyAsync(x => x.OrganizationId == orgId && (x.Name == s.Name || x.Code == s.Code));
            if (!exists)
            {
                await repo.AddAsync(new Subject { OrganizationId = orgId, Name = s.Name, Code = s.Code, IsActive = true });
                added++;
            }
        }
        results.Add($"{added} subjects added.");
    }

    private async Task SeedFeeHeadsCustom(Guid orgId, List<FeeHeadSeedDto> items, List<string> results)
    {
        var repo = _unitOfWork.Repository<FeeHead>();
        int added = 0;
        foreach (var h in items)
        {
            var exists = await repo.GetQueryable().AnyAsync(x => x.OrganizationId == orgId && x.Name == h.Name);
            if (!exists)
            {
                await repo.AddAsync(new FeeHead { OrganizationId = orgId, Name = h.Name, IsSelective = h.IsSelective, IsActive = true });
                added++;
            }
        }
        results.Add($"{added} fee heads added.");
    }

    private async Task SeedLeaveTypesCustom(Guid orgId, List<string> items, List<string> results)
    {
        var repo = _unitOfWork.Repository<LeaveType>();
        int added = 0;
        foreach (var t in items)
        {
            var exists = await repo.GetQueryable().AnyAsync(x => x.OrganizationId == orgId && x.Name == t);
            if (!exists)
            {
                await repo.AddAsync(new LeaveType { OrganizationId = orgId, Name = t, IsActive = true });
                added++;
            }
        }
        results.Add($"{added} leave types added.");
    }

    private async Task SeedAcademicYearsCustom(Guid orgId, List<AcademicYearSeedDto> items, List<string> results)
    {
        var repo = _unitOfWork.Repository<AcademicYear>();
        int added = 0;
        foreach (var y in items)
        {
            var exists = await repo.GetQueryable().AnyAsync(x => x.OrganizationId == orgId && x.Name == y.Name);
            if (!exists)
            {
                await repo.AddAsync(new AcademicYear { OrganizationId = orgId, Name = y.Name, StartDate = y.StartDate, EndDate = y.EndDate, IsCurrent = y.IsCurrent, IsActive = true });
                added++;
            }
        }
        results.Add($"{added} academic years added.");
    }
    private async Task SeedLookups(Guid orgId, List<string> results)
    {
        var lookupRepo = _unitOfWork.Repository<Lookup>();
        var existingCount = await lookupRepo.GetQueryable().Where(x => x.OrganizationId == orgId).CountAsync();
        if (existingCount > 0)
        {
            results.Add("Lookups already exist. Skipping.");
            return;
        }

        var lookups = new List<Lookup>
        {
            // Gender
            new() { Type = LookupType.Gender, Code = "MALE", Name = "Male" },
            new() { Type = LookupType.Gender, Code = "FEMALE", Name = "Female" },
            new() { Type = LookupType.Gender, Code = "OTHER", Name = "Other" },

            // Blood Group
            new() { Type = LookupType.BloodGroup, Code = "APOS", Name = "A+" },
            new() { Type = LookupType.BloodGroup, Code = "ANEG", Name = "A-" },
            new() { Type = LookupType.BloodGroup, Code = "BPOS", Name = "B+" },
            new() { Type = LookupType.BloodGroup, Code = "BNEG", Name = "B-" },
            new() { Type = LookupType.BloodGroup, Code = "ABPOS", Name = "AB+" },
            new() { Type = LookupType.BloodGroup, Code = "ABNEG", Name = "AB-" },
            new() { Type = LookupType.BloodGroup, Code = "OPOS", Name = "O+" },
            new() { Type = LookupType.BloodGroup, Code = "ONEG", Name = "O-" },

            // Religion
            new() { Type = LookupType.Religion, Code = "HINDU", Name = "Hinduism" },
            new() { Type = LookupType.Religion, Code = "MUSLIM", Name = "Islam" },
            new() { Type = LookupType.Religion, Code = "CHRISTIAN", Name = "Christianity" },
            new() { Type = LookupType.Religion, Code = "SIKH", Name = "Sikhism" },
            new() { Type = LookupType.Religion, Code = "BUDDHIST", Name = "Buddhism" },
            new() { Type = LookupType.Religion, Code = "JAIN", Name = "Jainism" },
            new() { Type = LookupType.Religion, Code = "OTHER", Name = "Other" },

            // Category
            new() { Type = LookupType.Category, Code = "GEN", Name = "General" },
            new() { Type = LookupType.Category, Code = "OBC", Name = "OBC" },
            new() { Type = LookupType.Category, Code = "SC", Name = "SC" },
            new() { Type = LookupType.Category, Code = "ST", Name = "ST" },

            // Relation
            new() { Type = LookupType.Relation, Code = "FATHER", Name = "Father" },
            new() { Type = LookupType.Relation, Code = "MOTHER", Name = "Mother" },
            new() { Type = LookupType.Relation, Code = "GUARDIAN", Name = "Guardian" },
            new() { Type = LookupType.Relation, Code = "SPOUSE", Name = "Spouse" },

            // Employment Type
            new() { Type = LookupType.EmploymentType, Code = "FULL_TIME", Name = "Full Time" },
            new() { Type = LookupType.EmploymentType, Code = "PART_TIME", Name = "Part Time" },
            new() { Type = LookupType.EmploymentType, Code = "CONTRACT", Name = "Contract" },
            new() { Type = LookupType.EmploymentType, Code = "PROBATION", Name = "Probation" },

            // Attendance Status
            new() { Type = LookupType.AttendanceStatus, Code = "PRESENT", Name = "Present" },
            new() { Type = LookupType.AttendanceStatus, Code = "ABSENT", Name = "Absent" },
            new() { Type = LookupType.AttendanceStatus, Code = "LATE", Name = "Late" },
            new() { Type = LookupType.AttendanceStatus, Code = "HALF_DAY", Name = "Half Day" },
            new() { Type = LookupType.AttendanceStatus, Code = "ON_LEAVE", Name = "On Leave" },

            // Payment Mode
            new() { Type = LookupType.PaymentMode, Code = "CASH", Name = "Cash" },
            new() { Type = LookupType.PaymentMode, Code = "CHEQUE", Name = "Cheque" },
            new() { Type = LookupType.PaymentMode, Code = "ONLINE_UPI", Name = "UPI / Online" },
            new() { Type = LookupType.PaymentMode, Code = "BANK_TRANSFER", Name = "Bank Transfer" }
        };

        foreach (var l in lookups)
        {
            l.OrganizationId = orgId;
            await lookupRepo.AddAsync(l);
        }
        results.Add($"{lookups.Count} lookups added.");
    }

    private async Task SeedAcademicYears(Guid orgId, List<string> results)
    {
        var repo = _unitOfWork.Repository<AcademicYear>();
        var count = await repo.GetQueryable().Where(x => x.OrganizationId == orgId).CountAsync();
        if (count > 0)
        {
            results.Add("Academic years already exist.");
            return;
        }

        var years = new List<AcademicYear>
        {
            new AcademicYear
            {
                Name = $"{DateTime.Now.Year - 1}-{DateTime.Now.Year % 100:D2}",
                StartDate = new DateTime(DateTime.Now.Year - 1, 4, 1),
                EndDate = new DateTime(DateTime.Now.Year, 3, 31),
                IsCurrent = false,
                IsActive = true,
                OrganizationId = orgId
            },
            new AcademicYear
            {
                Name = $"{DateTime.Now.Year}-{(DateTime.Now.Year + 1) % 100:D2}",
                StartDate = new DateTime(DateTime.Now.Year, 4, 1),
                EndDate = new DateTime(DateTime.Now.Year + 1, 3, 31),
                IsCurrent = true,
                IsActive = true,
                OrganizationId = orgId
            },
            new AcademicYear
            {
                Name = $"{DateTime.Now.Year + 1}-{(DateTime.Now.Year + 2) % 100:D2}",
                StartDate = new DateTime(DateTime.Now.Year + 1, 4, 1),
                EndDate = new DateTime(DateTime.Now.Year + 2, 3, 31),
                IsCurrent = false,
                IsActive = true,
                OrganizationId = orgId
            }
        };

        foreach(var y in years)
        {
            await repo.AddAsync(y);
        }
        results.Add("Academic years (Previous, Current, Next) added.");
    }

    private async Task SeedClasses(Guid orgId, List<string> results)
    {
        var repo = _unitOfWork.Repository<AcademicClass>();
        var count = await repo.GetQueryable().Where(x => x.OrganizationId == orgId).CountAsync();
        if (count > 0)
        {
            results.Add("Classes already exist.");
            return;
        }

        var classes = new List<string> { "Playgroup", "Nursery", "LKG", "UKG", "Class-1", "Class-2", "Class-3", "Class-4", "Class-5", "Class-6", "Class-7", "Class-8", "Class-9", "Class-10", "Class-11", "Class-12" };
        for (int i = 0; i < classes.Count; i++)
        {
            await repo.AddAsync(new AcademicClass { Name = classes[i], Order = i + 1, IsActive = true, OrganizationId = orgId });
        }
        results.Add($"{classes.Count} classes added.");
    }

    private async Task SeedSections(Guid orgId, List<string> results)
    {
        var repo = _unitOfWork.Repository<AcademicSection>();
        var count = await repo.GetQueryable().Where(x => x.OrganizationId == orgId).CountAsync();
        if (count > 0)
        {
            results.Add("Sections already exist.");
            return;
        }

        var sections = new List<string> { "A", "B", "C" };
        foreach (var s in sections)
        {
            await repo.AddAsync(new AcademicSection { Name = s, IsActive = true, OrganizationId = orgId });
        }
        results.Add($"{sections.Count} sections added.");
    }

    private async Task SeedDepartments(Guid orgId, List<string> results)
    {
        var repo = _unitOfWork.Repository<Department>();
        var count = await repo.GetQueryable().Where(x => x.OrganizationId == orgId).CountAsync();
        if (count > 0)
        {
            results.Add("Departments already exist.");
            return;
        }

        var depts = new List<string> { "Administration", "Academic", "Finance", "Back Office", "Transport", "Security" };
        foreach (var d in depts)
        {
            await repo.AddAsync(new Department { Name = d, IsActive = true, OrganizationId = orgId });
        }
        results.Add($"{depts.Count} departments added.");
    }

    private async Task SeedDesignations(Guid orgId, List<string> results)
    {
        var repo = _unitOfWork.Repository<Designation>();
        var count = await repo.GetQueryable().Where(x => x.OrganizationId == orgId).CountAsync();
        if (count > 0)
        {
            results.Add("Designations already exist.");
            return;
        }

        var desigs = new List<string> { "Principal", "Vice Principal", "HOD", "Senior Teacher", "Teacher", "Accountant", "Clerk", "Librarian", "Coordinator" };
        foreach (var d in desigs)
        {
            await repo.AddAsync(new Designation { Name = d, IsActive = true, OrganizationId = orgId });
        }
        results.Add($"{desigs.Count} designations added.");
    }

    private async Task SeedSubjects(Guid orgId, List<string> results)
    {
        var repo = _unitOfWork.Repository<Subject>();
        var count = await repo.GetQueryable().Where(x => x.OrganizationId == orgId).CountAsync();
        if (count > 0)
        {
            results.Add("Subjects already exist.");
            return;
        }

        var subjects = new List<(string Name, string Code)>
        {
            ("English", "ENG"), ("Hindi", "HIN"), ("Mathematics", "MATH"), 
            ("Science", "SCI"), ("Social Science", "SOC"), ("Computer Science", "COMP"),
            ("Physics", "PHY"), ("Chemistry", "CHEM"), ("Biology", "BIO")
        };
        foreach (var s in subjects)
        {
            await repo.AddAsync(new Subject { Name = s.Name, Code = s.Code, IsActive = true, OrganizationId = orgId });
        }
        results.Add($"{subjects.Count} subjects added.");
    }

    private async Task SeedFeeHeads(Guid orgId, List<string> results)
    {
        var repo = _unitOfWork.Repository<FeeHead>();
        var count = await repo.GetQueryable().Where(x => x.OrganizationId == orgId).CountAsync();
        if (count > 0)
        {
            results.Add("Fee heads already exist.");
            return;
        }

        var heads = new List<(string Name, bool Selective)>
        {
            ("Admission Fee", false), ("Registration Fee", false), ("Tuition Fee", false), ("Examination Fee", false),
            ("Computer Fee", false), ("Library Fee", false), ("Sports Fee", false),
            ("Transport Fee", true), ("Hostel Fee", true), ("Fine", false)
        };
        foreach (var h in heads)
        {
            await repo.AddAsync(new FeeHead { Name = h.Name, IsSelective = h.Selective, IsActive = true, OrganizationId = orgId });
        }
        results.Add($"{heads.Count} fee heads added.");
    }

    private async Task SeedLeaveTypes(Guid orgId, List<string> results)
    {
        var repo = _unitOfWork.Repository<LeaveType>();
        var count = await repo.GetQueryable().Where(x => x.OrganizationId == orgId).CountAsync();
        if (count > 0)
        {
            results.Add("Leave types already exist.");
            return;
        }

        var types = new List<string> { "Casual Leave", "Sick Leave", "Earned Leave", "Maternity Leave", "Paternity Leave", "Duty Leave" };
        foreach (var t in types)
        {
            await repo.AddAsync(new LeaveType { Name = t, IsActive = true, OrganizationId = orgId });
        }
        results.Add($"{types.Count} leave types added.");
    }

    private List<object> GetDefaultLookups()
    {
        return new List<object>
        {
            new { Type = LookupType.Gender, Code = "MALE", Name = "Male" },
            new { Type = LookupType.Gender, Code = "FEMALE", Name = "Female" },
            new { Type = LookupType.Gender, Code = "OTHER", Name = "Other" },
            new { Type = LookupType.BloodGroup, Code = "APOS", Name = "A+" },
            new { Type = LookupType.BloodGroup, Code = "ANEG", Name = "A-" },
            new { Type = LookupType.BloodGroup, Code = "BPOS", Name = "B+" },
            new { Type = LookupType.BloodGroup, Code = "BNEG", Name = "B-" },
            new { Type = LookupType.BloodGroup, Code = "ABPOS", Name = "AB+" },
            new { Type = LookupType.BloodGroup, Code = "ABNEG", Name = "AB-" },
            new { Type = LookupType.BloodGroup, Code = "OPOS", Name = "O+" },
            new { Type = LookupType.BloodGroup, Code = "ONEG", Name = "O-" },
            new { Type = LookupType.Religion, Code = "HINDU", Name = "Hinduism" },
            new { Type = LookupType.Religion, Code = "MUSLIM", Name = "Islam" },
            new { Type = LookupType.Religion, Code = "CHRISTIAN", Name = "Christianity" },
            new { Type = LookupType.Religion, Code = "SIKH", Name = "Sikhism" },
            new { Type = LookupType.Religion, Code = "BUDDHIST", Name = "Buddhism" },
            new { Type = LookupType.Religion, Code = "JAIN", Name = "Jainism" },
            new { Type = LookupType.Religion, Code = "OTHER", Name = "Other" },
            new { Type = LookupType.Category, Code = "GEN", Name = "General" },
            new { Type = LookupType.Category, Code = "OBC", Name = "OBC" },
            new { Type = LookupType.Category, Code = "SC", Name = "SC" },
            new { Type = LookupType.Category, Code = "ST", Name = "ST" },
            new { Type = LookupType.Relation, Code = "FATHER", Name = "Father" },
            new { Type = LookupType.Relation, Code = "MOTHER", Name = "Mother" },
            new { Type = LookupType.Relation, Code = "GUARDIAN", Name = "Guardian" },
            new { Type = LookupType.Relation, Code = "SPOUSE", Name = "Spouse" },
            new { Type = LookupType.EmploymentType, Code = "FULL_TIME", Name = "Full Time" },
            new { Type = LookupType.EmploymentType, Code = "PART_TIME", Name = "Part Time" },
            new { Type = LookupType.EmploymentType, Code = "CONTRACT", Name = "Contract" },
            new { Type = LookupType.EmploymentType, Code = "PROBATION", Name = "Probation" },
            new { Type = LookupType.AttendanceStatus, Code = "PRESENT", Name = "Present" },
            new { Type = LookupType.AttendanceStatus, Code = "ABSENT", Name = "Absent" },
            new { Type = LookupType.AttendanceStatus, Code = "LATE", Name = "Late" },
            new { Type = LookupType.AttendanceStatus, Code = "HALF_DAY", Name = "Half Day" },
            new { Type = LookupType.AttendanceStatus, Code = "ON_LEAVE", Name = "On Leave" },
            new { Type = LookupType.PaymentMode, Code = "CASH", Name = "Cash" },
            new { Type = LookupType.PaymentMode, Code = "CHEQUE", Name = "Cheque" },
            new { Type = LookupType.PaymentMode, Code = "ONLINE_UPI", Name = "UPI / Online" },
            new { Type = LookupType.PaymentMode, Code = "BANK_TRANSFER", Name = "Bank Transfer" }
        };
    }

    private List<object> GetDefaultMenuMasters()
    {
        return new List<object>
        {
            new { Key = "dashboard", Label = "Dashboard", Icon = "LayoutDashboard", SortOrder = 1 },
            new { Key = "students", Label = "Students", Icon = "Users", SortOrder = 2 },
            new { Key = "academics", Label = "Academics", Icon = "GraduationCap", SortOrder = 3 },
            new { Key = "fee", Label = "Fee Management", Icon = "CreditCard", SortOrder = 4 },
            new { Key = "hr", Label = "Human Resource", Icon = "Briefcase", SortOrder = 5 },
            new { Key = "attendance", Label = "Attendance", Icon = "CalendarCheck", SortOrder = 6 },
            new { Key = "examination", Label = "Examination", Icon = "FileText", SortOrder = 7 },
            new { Key = "settings", Label = "Settings", Icon = "Settings", SortOrder = 8 }
        };
    }

    private async Task SeedMenuMastersCustom(List<MenuMasterSeedDto> items, List<string> results)
    {
        var repo = _unitOfWork.GlobalRepository<MenuMaster>();
        int added = 0;
        foreach (var m in items)
        {
            var exists = await repo.GetQueryable().AnyAsync(x => x.Key == m.Key);
            if (!exists)
            {
                await repo.AddAsync(new MenuMaster { Key = m.Key, Label = m.Label, Icon = m.Icon, SortOrder = m.SortOrder });
                added++;
            }
        }
        results.Add($"{added} menu items added.");
    }

    private List<object> GetDefaultFeeDiscounts()
    {
        return new List<object>
        {
            new { Name = "Sibling Discount (Monthly)", Category = "Sibling", CalculationType = "Percentage", Value = 10, Frequency = "Monthly" },
            new { Name = "Staff Child Discount", Category = "Staff", CalculationType = "Percentage", Value = 50, Frequency = "Monthly" },
            new { Name = "One-Time Merit Reward", Category = "Merit", CalculationType = "Fixed", Value = 5000, Frequency = "One-Time" },
            new { Name = "Financial Hardship Relief", Category = "FinancialAid", CalculationType = "Percentage", Value = 25, Frequency = "Monthly" }
        };
    }

    private List<object> GetDefaultFeePolicy()
    {
        return new List<object>
        {
            new { MonthlyDueDay = 10, GracePeriodDays = 5, LateFeeType = "Fixed", LateFeeAmount = 500, AutoCalculateLateFee = true }
        };
    }

    private async Task SeedFeeDiscountsCustom(Guid orgId, List<FeeDiscountSeedDto> items, List<string> results)
    {
        var repo = _unitOfWork.Repository<FeeDiscount>();
        int added = 0;
        foreach (var d in items)
        {
            var exists = await repo.GetQueryable().AnyAsync(x => x.OrganizationId == orgId && x.Name == d.Name);
            if (!exists)
            {
                await repo.AddAsync(new FeeDiscount { OrganizationId = orgId, Name = d.Name, Category = d.Category, CalculationType = d.CalculationType, Value = d.Value, Frequency = d.Frequency });
                added++;
            }
        }
        results.Add($"{added} fee discounts added.");
    }

    private async Task SeedFeeConfigCustom(Guid orgId, List<FeeConfigSeedDto> items, List<string> results)
    {
        var repo = _unitOfWork.Repository<FeeConfiguration>();
        if (items == null || items.Count == 0) return;

        var c = items[0];
        if (c == null) return;

        var existing = await repo.GetQueryable().FirstOrDefaultAsync(x => x.OrganizationId == orgId);
        if (existing != null)
        {
            existing.MonthlyDueDay = c.MonthlyDueDay > 0 ? c.MonthlyDueDay : 10;
            existing.GracePeriodDays = c.GracePeriodDays >= 0 ? c.GracePeriodDays : 5;
            existing.LateFeeType = string.IsNullOrEmpty(c.LateFeeType) ? "Fixed" : c.LateFeeType;
            existing.LateFeeAmount = c.LateFeeAmount;
            existing.AutoCalculateLateFee = c.AutoCalculateLateFee;
            repo.Update(existing);
            results.Add("Fee configuration updated.");
        }
        else
        {
            await repo.AddAsync(new FeeConfiguration 
            { 
                OrganizationId = orgId, 
                MonthlyDueDay = c.MonthlyDueDay > 0 ? c.MonthlyDueDay : 10, 
                GracePeriodDays = c.GracePeriodDays >= 0 ? c.GracePeriodDays : 5, 
                LateFeeType = string.IsNullOrEmpty(c.LateFeeType) ? "Fixed" : c.LateFeeType, 
                LateFeeAmount = c.LateFeeAmount, 
                AutoCalculateLateFee = c.AutoCalculateLateFee 
            });
            results.Add("Fee configuration created.");
        }
    }

    private async Task SeedDiscounts(Guid orgId, List<string> results)
    {
        var repo = _unitOfWork.Repository<FeeDiscount>();
        if (await repo.GetQueryable().Where(x => x.OrganizationId == orgId).AnyAsync())
        {
            results.Add("Fee discounts already exist.");
            return;
        }

        var discounts = new List<FeeDiscount>
        {
            new FeeDiscount { Name = "Sibling Discount (Monthly)", Category = "Sibling", CalculationType = "Percentage", Value = 10, Frequency = "Monthly" },
            new FeeDiscount { Name = "Staff Child Discount", Category = "Staff", CalculationType = "Percentage", Value = 50, Frequency = "Monthly" },
            new FeeDiscount { Name = "One-Time Merit Reward", Category = "Merit", CalculationType = "Fixed", Value = 5000, Frequency = "One-Time" },
            new FeeDiscount { Name = "Financial Hardship Relief", Category = "FinancialAid", CalculationType = "Percentage", Value = 25, Frequency = "Monthly" }
        };

        foreach (var d in discounts)
        {
            d.OrganizationId = orgId;
            await repo.AddAsync(d);
        }
        results.Add($"{discounts.Count} fee discounts seeded.");
    }

    private async Task SeedFeeConfig(Guid orgId, List<string> results)
    {
        var repo = _unitOfWork.Repository<FeeConfiguration>();
        if (await repo.GetQueryable().Where(x => x.OrganizationId == orgId).AnyAsync())
        {
            results.Add("Fee configuration already exists.");
            return;
        }

        var config = new FeeConfiguration
        {
            OrganizationId = orgId,
            MonthlyDueDay = 10,
            GracePeriodDays = 5,
            LateFeeType = "Fixed",
            LateFeeAmount = 500,
            AutoCalculateLateFee = true
        };

        await repo.AddAsync(config);
        results.Add("Default fee configuration seeded.");
    }

    private async Task SeedEmployeeRoles(Guid orgId, List<string> results)
    {
        var repo = _unitOfWork.Repository<EmployeeRole>();
        var count = await repo.GetQueryable().Where(x => x.OrganizationId == orgId).CountAsync();
        if (count > 0)
        {
            results.Add("Employee roles already exist.");
            return;
        }

        var roles = new List<string> { "Admin", "Teacher", "Accountant", "Staff" };
        foreach (var r in roles)
        {
            await repo.AddAsync(new EmployeeRole { OrganizationId = orgId, Name = r, IsActive = true });
        }
        results.Add($"{roles.Count} employee roles added.");
    }

    private async Task SeedInitialStaff(Guid orgId, List<string> results)
    {
        var employeeRepo = _unitOfWork.Repository<Employee>();
        var userRepo = _unitOfWork.Repository<User>();
        var email = "shahbazit007@gmail.com";
        
        var employeeExists = await employeeRepo.GetQueryable().AnyAsync(x => x.OrganizationId == orgId && (x.WorkEmail == email || x.PersonalEmail == email));
        var userExists = await userRepo.GetQueryable().IgnoreQueryFilters().AnyAsync(x => x.Email == email && x.OrganizationId == orgId);

        if (employeeExists && userExists)
        {
            results.Add("Initial staff and user already exist. Skipping.");
            return;
        }

        var dept = await _unitOfWork.Repository<Department>().GetQueryable().FirstOrDefaultAsync(x => x.OrganizationId == orgId);
        var desig = await _unitOfWork.Repository<Designation>().GetQueryable().FirstOrDefaultAsync(x => x.OrganizationId == orgId);
        var role = await _unitOfWork.Repository<EmployeeRole>().GetQueryable().FirstOrDefaultAsync(x => x.OrganizationId == orgId);

        User? user = null;
        if (!userExists)
        {
            user = new User
            {
                OrganizationId = orgId,
                Email = email,
                FirstName = "Shahbaz",
                LastName = "Ahmad",
                MobileNumber = "9999999999",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Shahbaz@123"),
                Role = role?.Name ?? "Admin",
                IsEmailVerified = true,
                IsMobileVerified = true,
                CreatedAt = DateTime.UtcNow
            };
            await userRepo.AddAsync(user);
            await _unitOfWork.CompleteAsync(); // To get ID
            results.Add($"Initial user '{user.Email}' seeded.");
        }
        else 
        {
            user = await userRepo.GetQueryable().IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Email == email && x.OrganizationId == orgId);
        }

        if (!employeeExists)
        {
            var employee = new Employee
            {
                OrganizationId = orgId,
                FirstName = "Shahbaz",
                LastName = "Ahmad",
                WorkEmail = email,
                PersonalEmail = email,
                MobileNumber = "9999999999",
                Gender = "Male",
                DateOfBirth = new DateTime(1990, 1, 1),
                DateOfJoining = DateTime.Now,
                EmploymentType = EmploymentType.FullTime,
                DepartmentId = dept?.Id,
                DesignationId = desig?.Id,
                EmployeeRoleId = role?.Id,
                IsActive = true,
                IsLoginEnabled = true, // Added
                UserId = user?.Id // Added link
            };
            await employeeRepo.AddAsync(employee);
            await _unitOfWork.CompleteAsync(); // COMMIT THE EMPLOYEE
            results.Add($"Initial staff record for '{employee.FirstName} {employee.LastName}' seeded and linked to user.");
        }
    }

    private async Task SeedLeavePlans(Guid orgId, List<string> results)
    {
        var planRepo = _unitOfWork.Repository<LeavePlan>();
        var typeRepo = _unitOfWork.Repository<LeaveType>();

        var exists = await planRepo.GetQueryable().AnyAsync(x => x.OrganizationId == orgId);
        if (exists)
        {
            results.Add("Leave plans already exist. Skipping.");
            return;
        }

        var defaultPlan = new LeavePlan
        {
            OrganizationId = orgId,
            Name = "General Staff Plan",
            Description = "Standard leave policies for all employees",
            IsActive = true,
            IsDefault = true
        };

        await planRepo.AddAsync(defaultPlan);
        await _unitOfWork.CompleteAsync(); // Save to get Plan Id

        var defaultTypes = new List<LeaveType>
        {
            new() { OrganizationId = orgId, LeavePlanId = defaultPlan.Id, Name = "Casual Leave", MaxDaysPerYear = 12, IsMonthlyAccrual = true, AccrualRatePerMonth = 1, IsActive = true },
            new() { OrganizationId = orgId, LeavePlanId = defaultPlan.Id, Name = "Sick Leave", MaxDaysPerYear = 10, IsMonthlyAccrual = false, IsActive = true },
            new() { OrganizationId = orgId, LeavePlanId = defaultPlan.Id, Name = "Earned Leave", MaxDaysPerYear = 15, IsMonthlyAccrual = false, CanCarryForward = true, MaxCarryForwardDays = 30, IsActive = true }
        };

        foreach (var t in defaultTypes)
        {
            await typeRepo.AddAsync(t);
        }

        results.Add("Default Leave Plan and child categories initialized.");
    }
}
