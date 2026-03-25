using SchoolERP.Infrastructure.Persistence;
using SchoolERP.Domain.Common;
using SchoolERP.Domain.Entities;
using SchoolERP.Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace SchoolERP.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    private readonly IOrganizationService _organizationService;
    private readonly ICurrentUserService _currentUserService;

    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options, 
        IOrganizationService organizationService,
        ICurrentUserService currentUserService) 
        : base(options)
    {
        _organizationService = organizationService;
        _currentUserService = currentUserService;
    }

    public Guid CurrentOrganizationId => _organizationService.GetOrganizationId();


    public DbSet<Organization> Organizations { get; set; } = null!;
    public DbSet<User> Users { get; set; } = null!;
    public DbSet<PendingRegistration> PendingRegistrations { get; set; } = null!;
    public DbSet<Student> Students { get; set; } = null!;
    public DbSet<Course> Courses { get; set; } = null!;
    public DbSet<StudentCourse> StudentCourses { get; set; } = null!;
    public DbSet<FeeStructure> FeeStructures { get; set; } = null!;
    public DbSet<FeeTransaction> FeeTransactions { get; set; } = null!;
    public DbSet<StudentFeeAccount> StudentFeeAccounts { get; set; } = null!;
    public DbSet<StudentFeeSubscription> StudentFeeSubscriptions { get; set; } = null!;
    public DbSet<Lookup> Lookups { get; set; } = null!;
    public DbSet<StudentDocument> StudentDocuments { get; set; } = null!;
    public DbSet<StudentAttendance> StudentAttendances { get; set; } = null!;
    public DbSet<Exam> Exams { get; set; } = null!;
    public DbSet<StudentExamResult> StudentExamResults { get; set; } = null!;

    // Core Masters
    public DbSet<AcademicClass> AcademicClasses { get; set; } = null!;
    public DbSet<AcademicSection> AcademicSections { get; set; } = null!;
    public DbSet<Subject> Subjects { get; set; } = null!;
    public DbSet<AcademicStream> AcademicStreams { get; set; } = null!;
    public DbSet<AcademicYear> AcademicYears { get; set; } = null!;
    public DbSet<Department> Departments { get; set; } = null!;
    public DbSet<Designation> Designations { get; set; } = null!;
    public DbSet<EmployeeRole> EmployeeRoles { get; set; } = null!;
    public DbSet<Employee> Employees { get; set; } = null!;
    public DbSet<EmployeeDocument> EmployeeDocuments { get; set; } = null!;
    public DbSet<TeacherProfile> TeacherProfiles { get; set; } = null!;
    public DbSet<TeacherSubjectAssignment> TeacherSubjectAssignments { get; set; } = null!;
    public DbSet<TeacherClassAssignment> TeacherClassAssignments { get; set; } = null!;
    public DbSet<EmployeeAttendance> EmployeeAttendances { get; set; } = null!;
    public DbSet<LeaveType> LeaveTypes { get; set; } = null!;
    public DbSet<LeaveApplication> LeaveApplications { get; set; } = null!;
    public DbSet<LeaveBalance> LeaveBalances { get; set; } = null!;
    public DbSet<SalaryStructure> SalaryStructures { get; set; } = null!;
    public DbSet<SalaryComponent> SalaryComponents { get; set; } = null!;
    public DbSet<EmployeeSalary> EmployeeSalaries { get; set; } = null!;
    public DbSet<PayrollRun> PayrollRuns { get; set; } = null!;
    public DbSet<PayrollDetail> PayrollDetails { get; set; } = null!;
    public DbSet<FeeHead> FeeHeads { get; set; } = null!;
    public DbSet<Room> Rooms { get; set; } = null!;
    public DbSet<Lab> Labs { get; set; } = null!;
    public DbSet<MenuPermission> MenuPermissions { get; set; } = null!;
    public DbSet<MenuMaster> MenuMasters { get; set; } = null!;
    public DbSet<Country> Countries { get; set; } = null!;
    public DbSet<State> States { get; set; } = null!;
    public DbSet<City> Cities { get; set; } = null!;
    public DbSet<FeeDiscount> FeeDiscounts { get; set; } = null!;
    public DbSet<FeeDiscountAssignment> FeeDiscountAssignments { get; set; } = null!;
    public DbSet<FeeConfiguration> FeeConfigurations { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Global Decimal Precision (18,2)
        foreach (var property in builder.Model.GetEntityTypes()
            .SelectMany(t => t.GetProperties())
            .Where(p => p.ClrType == typeof(decimal) || p.ClrType == typeof(decimal?)))
        {
            property.SetColumnType("decimal(18,2)");
        }

        // Apply Global Query Filters for Organization isolation
        builder.Entity<User>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<Student>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<Course>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<StudentCourse>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<FeeStructure>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<FeeTransaction>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<StudentFeeAccount>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<StudentFeeSubscription>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<FeeHead>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<Lookup>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<StudentDocument>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<StudentAttendance>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<Exam>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<StudentExamResult>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<FeeDiscount>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<FeeDiscountAssignment>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<FeeConfiguration>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);

        // Master Query Filters
        builder.Entity<AcademicClass>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<AcademicSection>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<Subject>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<AcademicStream>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<AcademicYear>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<Department>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<Designation>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<EmployeeRole>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<Room>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<Lab>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<Employee>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<EmployeeDocument>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<TeacherProfile>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<TeacherSubjectAssignment>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<TeacherClassAssignment>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<EmployeeAttendance>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<LeaveType>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<LeaveApplication>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<LeaveBalance>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<SalaryStructure>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<SalaryComponent>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<EmployeeSalary>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<PayrollRun>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<PayrollDetail>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<Country>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<State>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<City>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);
        builder.Entity<MenuPermission>().HasQueryFilter(e => e.OrganizationId == CurrentOrganizationId);



        // Configure indexes on OrganizationId for performance
        builder.Entity<User>().HasIndex(e => e.OrganizationId);
        builder.Entity<Student>().HasIndex(e => e.OrganizationId);
        builder.Entity<Course>().HasIndex(e => e.OrganizationId);
        builder.Entity<StudentCourse>().HasIndex(e => e.OrganizationId);
        builder.Entity<FeeStructure>().HasIndex(e => e.OrganizationId);
        builder.Entity<FeeTransaction>().HasIndex(e => e.OrganizationId);
        builder.Entity<StudentFeeAccount>().HasIndex(e => e.OrganizationId);
        builder.Entity<StudentFeeSubscription>().HasIndex(e => e.OrganizationId);
        builder.Entity<FeeHead>().HasIndex(e => e.OrganizationId);
        builder.Entity<Lookup>().HasIndex(e => e.OrganizationId);
        builder.Entity<StudentDocument>().HasIndex(e => e.OrganizationId);
        builder.Entity<StudentAttendance>().HasIndex(e => e.OrganizationId);
        builder.Entity<Exam>().HasIndex(e => e.OrganizationId);
        builder.Entity<StudentExamResult>().HasIndex(e => e.OrganizationId);
        builder.Entity<FeeDiscount>().HasIndex(e => e.OrganizationId);
        builder.Entity<FeeDiscountAssignment>().HasIndex(e => e.OrganizationId);
        builder.Entity<FeeConfiguration>().HasIndex(e => e.OrganizationId);
        
        // Ensure no duplicate attendance per student per day
        builder.Entity<StudentAttendance>().HasIndex(e => new { e.OrganizationId, e.StudentId, e.AttendanceDate }).IsUnique();

        // Student relationships for new collections
        builder.Entity<StudentDocument>()
            .HasOne(sd => sd.Student)
            .WithMany(s => s.Documents)
            .HasForeignKey(sd => sd.StudentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<StudentAttendance>()
            .HasOne(sa => sa.Student)
            .WithMany(s => s.Attendances)
            .HasForeignKey(sa => sa.StudentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<StudentExamResult>()
            .HasOne(ser => ser.Student)
            .WithMany(s => s.ExamResults)
            .HasForeignKey(ser => ser.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<StudentExamResult>()
            .HasOne(ser => ser.Exam)
            .WithMany(e => e.ExamResults)
            .HasForeignKey(ser => ser.ExamId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<StudentExamResult>()
            .HasOne(ser => ser.Subject)
            .WithMany()
            .HasForeignKey(ser => ser.SubjectId)
            .OnDelete(DeleteBehavior.Restrict);

        // Master Indexes
        builder.Entity<AcademicClass>().HasIndex(e => e.OrganizationId);
        builder.Entity<AcademicSection>().HasIndex(e => e.OrganizationId);
        builder.Entity<Subject>().HasIndex(e => e.OrganizationId);
        builder.Entity<AcademicStream>().HasIndex(e => e.OrganizationId);
        builder.Entity<AcademicYear>().HasIndex(e => e.OrganizationId);
        builder.Entity<Department>().HasIndex(e => e.OrganizationId);
        builder.Entity<Designation>().HasIndex(e => e.OrganizationId);
        builder.Entity<EmployeeRole>().HasIndex(e => e.OrganizationId);
        builder.Entity<Room>().HasIndex(e => e.OrganizationId);
        builder.Entity<Lab>().HasIndex(e => e.OrganizationId);
        builder.Entity<Employee>().HasIndex(e => e.OrganizationId);
        builder.Entity<EmployeeDocument>().HasIndex(e => e.OrganizationId);
        builder.Entity<Employee>().HasIndex(e => e.EmployeeCode);
        builder.Entity<Employee>().HasIndex(e => new { e.OrganizationId, e.WorkEmail }).IsUnique();
        builder.Entity<TeacherProfile>().HasIndex(e => e.OrganizationId);
        builder.Entity<TeacherProfile>().HasIndex(e => e.EmployeeId).IsUnique(); // 1-to-1
        builder.Entity<TeacherSubjectAssignment>().HasIndex(e => e.OrganizationId);
        builder.Entity<TeacherClassAssignment>().HasIndex(e => e.OrganizationId);
        builder.Entity<EmployeeAttendance>().HasIndex(e => e.OrganizationId);
        builder.Entity<LeaveType>().HasIndex(e => e.OrganizationId);
        builder.Entity<LeaveApplication>().HasIndex(e => e.OrganizationId);
        builder.Entity<LeaveBalance>().HasIndex(e => e.OrganizationId);
        builder.Entity<SalaryStructure>().HasIndex(e => e.OrganizationId);
        builder.Entity<SalaryComponent>().HasIndex(e => e.OrganizationId);
        builder.Entity<EmployeeSalary>().HasIndex(e => e.OrganizationId);
        builder.Entity<PayrollRun>().HasIndex(e => e.OrganizationId);
        builder.Entity<PayrollDetail>().HasIndex(e => e.OrganizationId);
        // Only one attendance record per employee per day
        builder.Entity<EmployeeAttendance>().HasIndex(e => new { e.OrganizationId, e.EmployeeId, e.AttendanceDate }).IsUnique();
        builder.Entity<LeaveBalance>().HasIndex(e => new { e.OrganizationId, e.EmployeeId, e.LeaveTypeId, e.AcademicYearId }).IsUnique();
        builder.Entity<Country>().HasIndex(e => e.OrganizationId);
        builder.Entity<State>().HasIndex(e => e.OrganizationId);
        builder.Entity<City>().HasIndex(e => e.OrganizationId);
        builder.Entity<MenuPermission>().HasIndex(e => e.OrganizationId);
        builder.Entity<MenuPermission>().HasIndex(e => new { e.RoleName, e.UserId, e.MenuKey }).IsUnique();
        builder.Entity<MenuPermission>().HasIndex(e => new { e.UserId, e.MenuKey }).HasFilter("[UserId] IS NOT NULL");
        builder.Entity<MenuPermission>().HasIndex(e => new { e.RoleName, e.MenuKey }).HasFilter("[RoleName] IS NOT NULL");
        
        // Configure Many-to-Many Student-Course explicitly (though EF Core does it implicitly, mapping explicitly is safer)
        builder.Entity<StudentCourse>()
            .HasOne(sc => sc.Student)
            .WithMany(s => s.EnrolledCourses)
            .HasForeignKey(sc => sc.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<StudentCourse>()
            .HasOne(sc => sc.Course)
            .WithMany(c => c.EnrolledStudents)
            .HasForeignKey(sc => sc.CourseId)
            .OnDelete(DeleteBehavior.Restrict);

        // Organization does NOT have OrganizationId, its Id is the identifier

        // Employee → EmployeeDocument (one-to-many)
        builder.Entity<EmployeeDocument>()
            .HasOne(d => d.Employee)
            .WithMany(e => e.Documents)
            .HasForeignKey(d => d.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        // Employee → Department, Designation, EmployeeRole (optional FKs, no cascade delete)
        builder.Entity<Employee>()
            .HasOne(e => e.Department)
            .WithMany()
            .HasForeignKey(e => e.DepartmentId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        builder.Entity<Employee>()
            .HasOne(e => e.Designation)
            .WithMany()
            .HasForeignKey(e => e.DesignationId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        builder.Entity<Employee>()
            .HasOne(e => e.EmployeeRole)
            .WithMany()
            .HasForeignKey(e => e.EmployeeRoleId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        // Employee → TeacherProfile (one-to-one, optional)
        builder.Entity<TeacherProfile>()
            .HasOne(tp => tp.Employee)
            .WithOne(e => e.TeacherProfile)
            .HasForeignKey<TeacherProfile>(tp => tp.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        // TeacherProfile → SubjectAssignments
        builder.Entity<TeacherSubjectAssignment>()
            .HasOne(tsa => tsa.TeacherProfile)
            .WithMany(tp => tp.SubjectAssignments)
            .HasForeignKey(tsa => tsa.TeacherProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<TeacherSubjectAssignment>()
            .HasOne(tsa => tsa.Subject)
            .WithMany()
            .HasForeignKey(tsa => tsa.SubjectId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<TeacherSubjectAssignment>()
            .HasOne(tsa => tsa.AcademicYear)
            .WithMany()
            .HasForeignKey(tsa => tsa.AcademicYearId)
            .OnDelete(DeleteBehavior.Restrict);

        // TeacherProfile → ClassAssignments
        builder.Entity<TeacherClassAssignment>()
            .HasOne(tca => tca.TeacherProfile)
            .WithMany(tp => tp.ClassAssignments)
            .HasForeignKey(tca => tca.TeacherProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<TeacherClassAssignment>()
            .HasOne(tca => tca.Class)
            .WithMany()
            .HasForeignKey(tca => tca.ClassId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<TeacherClassAssignment>()
            .HasOne(tca => tca.Section)
            .WithMany()
            .HasForeignKey(tca => tca.SectionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<TeacherClassAssignment>()
            .HasOne(tca => tca.AcademicYear)
            .WithMany()
            .HasForeignKey(tca => tca.AcademicYearId)
            .OnDelete(DeleteBehavior.Restrict);

        // Employee → EmployeeAttendance (one-to-many)
        builder.Entity<EmployeeAttendance>()
            .HasOne(ea => ea.Employee)
            .WithMany()
            .HasForeignKey(ea => ea.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<LeaveApplication>()
            .HasOne(la => la.Employee)
            .WithMany()
            .HasForeignKey(la => la.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<LeaveApplication>()
            .HasOne(la => la.LeaveType)
            .WithMany()
            .HasForeignKey(la => la.LeaveTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<LeaveBalance>()
            .HasOne(lb => lb.Employee)
            .WithMany()
            .HasForeignKey(lb => lb.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<LeaveBalance>()
            .HasOne(lb => lb.LeaveType)
            .WithMany()
            .HasForeignKey(lb => lb.LeaveTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<LeaveBalance>()
            .HasOne(lb => lb.AcademicYear)
            .WithMany()
            .HasForeignKey(lb => lb.AcademicYearId)
            .OnDelete(DeleteBehavior.Restrict);

        // Payroll Relationships
        builder.Entity<SalaryStructure>()
            .HasMany(s => s.Components)
            .WithOne(c => c.SalaryStructure)
            .HasForeignKey(c => c.SalaryStructureId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<EmployeeSalary>()
            .HasOne(es => es.Employee)
            .WithMany()
            .HasForeignKey(es => es.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<EmployeeSalary>()
            .HasOne(es => es.SalaryStructure)
            .WithMany()
            .HasForeignKey(es => es.SalaryStructureId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<PayrollRun>()
            .HasMany(pr => pr.PayrollDetails)
            .WithOne(pd => pd.PayrollRun)
            .HasForeignKey(pd => pd.PayrollRunId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<PayrollDetail>()
            .HasOne(pd => pd.Employee)
            .WithMany()
            .HasForeignKey(pd => pd.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = new CancellationToken())
    {
        var orgId = _organizationService.GetOrganizationId();
        var userId = _currentUserService.UserId;

        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                if (orgId != Guid.Empty && entry.Entity.OrganizationId == Guid.Empty)
                {
                    entry.Entity.OrganizationId = orgId;
                }
                entry.Entity.CreatedAt = DateTime.UtcNow;
                entry.Entity.CreatedBy = userId;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = DateTime.UtcNow;
                entry.Entity.UpdatedBy = userId;
                entry.Property(x => x.OrganizationId).IsModified = false;
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}
