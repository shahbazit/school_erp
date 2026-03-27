using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolERP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SetDboSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "dbo");

            migrationBuilder.RenameTable(
                name: "Users",
                newName: "Users",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "Timetables",
                newName: "Timetables",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "TimetableDetails",
                newName: "TimetableDetails",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "TeacherSubjectAssignments",
                newName: "TeacherSubjectAssignments",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "TeacherProfiles",
                newName: "TeacherProfiles",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "TeacherClassAssignments",
                newName: "TeacherClassAssignments",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "Subjects",
                newName: "Subjects",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "Students",
                newName: "Students",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "StudentFeeSubscriptions",
                newName: "StudentFeeSubscriptions",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "StudentFeeAccounts",
                newName: "StudentFeeAccounts",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "StudentExamResults",
                newName: "StudentExamResults",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "StudentDocuments",
                newName: "StudentDocuments",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "StudentCourses",
                newName: "StudentCourses",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "StudentAttendances",
                newName: "StudentAttendances",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "StudentAcademics",
                newName: "StudentAcademics",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "States",
                newName: "States",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "SalaryStructures",
                newName: "SalaryStructures",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "SalaryComponents",
                newName: "SalaryComponents",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "Rooms",
                newName: "Rooms",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "PendingRegistrations",
                newName: "PendingRegistrations",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "PayrollRuns",
                newName: "PayrollRuns",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "PayrollDetails",
                newName: "PayrollDetails",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "OtherIncomes",
                newName: "OtherIncomes",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "Organizations",
                newName: "Organizations",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "OfficeExpenses",
                newName: "OfficeExpenses",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "MenuPermissions",
                newName: "MenuPermissions",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "MenuMasters",
                newName: "MenuMasters",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "Lookups",
                newName: "Lookups",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "LeaveTypes",
                newName: "LeaveTypes",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "LeavePlan",
                newName: "LeavePlan",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "LeaveBalances",
                newName: "LeaveBalances",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "LeaveApplications",
                newName: "LeaveApplications",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "Labs",
                newName: "Labs",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "Homeworks",
                newName: "Homeworks",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "FeeTransactions",
                newName: "FeeTransactions",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "FeeStructures",
                newName: "FeeStructures",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "FeeHeads",
                newName: "FeeHeads",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "FeeDiscounts",
                newName: "FeeDiscounts",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "FeeDiscountAssignments",
                newName: "FeeDiscountAssignments",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "FeeConfigurations",
                newName: "FeeConfigurations",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "Exams",
                newName: "Exams",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "EmployeeSalaries",
                newName: "EmployeeSalaries",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "Employees",
                newName: "Employees",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "EmployeeRoles",
                newName: "EmployeeRoles",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "EmployeeDocuments",
                newName: "EmployeeDocuments",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "EmployeeAttendances",
                newName: "EmployeeAttendances",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "Designations",
                newName: "Designations",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "Departments",
                newName: "Departments",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "Courses",
                newName: "Courses",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "Countries",
                newName: "Countries",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "Cities",
                newName: "Cities",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "AcademicYears",
                newName: "AcademicYears",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "AcademicStreams",
                newName: "AcademicStreams",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "AcademicSections",
                newName: "AcademicSections",
                newSchema: "dbo");

            migrationBuilder.RenameTable(
                name: "AcademicClasses",
                newName: "AcademicClasses",
                newSchema: "dbo");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameTable(
                name: "Users",
                schema: "dbo",
                newName: "Users");

            migrationBuilder.RenameTable(
                name: "Timetables",
                schema: "dbo",
                newName: "Timetables");

            migrationBuilder.RenameTable(
                name: "TimetableDetails",
                schema: "dbo",
                newName: "TimetableDetails");

            migrationBuilder.RenameTable(
                name: "TeacherSubjectAssignments",
                schema: "dbo",
                newName: "TeacherSubjectAssignments");

            migrationBuilder.RenameTable(
                name: "TeacherProfiles",
                schema: "dbo",
                newName: "TeacherProfiles");

            migrationBuilder.RenameTable(
                name: "TeacherClassAssignments",
                schema: "dbo",
                newName: "TeacherClassAssignments");

            migrationBuilder.RenameTable(
                name: "Subjects",
                schema: "dbo",
                newName: "Subjects");

            migrationBuilder.RenameTable(
                name: "Students",
                schema: "dbo",
                newName: "Students");

            migrationBuilder.RenameTable(
                name: "StudentFeeSubscriptions",
                schema: "dbo",
                newName: "StudentFeeSubscriptions");

            migrationBuilder.RenameTable(
                name: "StudentFeeAccounts",
                schema: "dbo",
                newName: "StudentFeeAccounts");

            migrationBuilder.RenameTable(
                name: "StudentExamResults",
                schema: "dbo",
                newName: "StudentExamResults");

            migrationBuilder.RenameTable(
                name: "StudentDocuments",
                schema: "dbo",
                newName: "StudentDocuments");

            migrationBuilder.RenameTable(
                name: "StudentCourses",
                schema: "dbo",
                newName: "StudentCourses");

            migrationBuilder.RenameTable(
                name: "StudentAttendances",
                schema: "dbo",
                newName: "StudentAttendances");

            migrationBuilder.RenameTable(
                name: "StudentAcademics",
                schema: "dbo",
                newName: "StudentAcademics");

            migrationBuilder.RenameTable(
                name: "States",
                schema: "dbo",
                newName: "States");

            migrationBuilder.RenameTable(
                name: "SalaryStructures",
                schema: "dbo",
                newName: "SalaryStructures");

            migrationBuilder.RenameTable(
                name: "SalaryComponents",
                schema: "dbo",
                newName: "SalaryComponents");

            migrationBuilder.RenameTable(
                name: "Rooms",
                schema: "dbo",
                newName: "Rooms");

            migrationBuilder.RenameTable(
                name: "PendingRegistrations",
                schema: "dbo",
                newName: "PendingRegistrations");

            migrationBuilder.RenameTable(
                name: "PayrollRuns",
                schema: "dbo",
                newName: "PayrollRuns");

            migrationBuilder.RenameTable(
                name: "PayrollDetails",
                schema: "dbo",
                newName: "PayrollDetails");

            migrationBuilder.RenameTable(
                name: "OtherIncomes",
                schema: "dbo",
                newName: "OtherIncomes");

            migrationBuilder.RenameTable(
                name: "Organizations",
                schema: "dbo",
                newName: "Organizations");

            migrationBuilder.RenameTable(
                name: "OfficeExpenses",
                schema: "dbo",
                newName: "OfficeExpenses");

            migrationBuilder.RenameTable(
                name: "MenuPermissions",
                schema: "dbo",
                newName: "MenuPermissions");

            migrationBuilder.RenameTable(
                name: "MenuMasters",
                schema: "dbo",
                newName: "MenuMasters");

            migrationBuilder.RenameTable(
                name: "Lookups",
                schema: "dbo",
                newName: "Lookups");

            migrationBuilder.RenameTable(
                name: "LeaveTypes",
                schema: "dbo",
                newName: "LeaveTypes");

            migrationBuilder.RenameTable(
                name: "LeavePlan",
                schema: "dbo",
                newName: "LeavePlan");

            migrationBuilder.RenameTable(
                name: "LeaveBalances",
                schema: "dbo",
                newName: "LeaveBalances");

            migrationBuilder.RenameTable(
                name: "LeaveApplications",
                schema: "dbo",
                newName: "LeaveApplications");

            migrationBuilder.RenameTable(
                name: "Labs",
                schema: "dbo",
                newName: "Labs");

            migrationBuilder.RenameTable(
                name: "Homeworks",
                schema: "dbo",
                newName: "Homeworks");

            migrationBuilder.RenameTable(
                name: "FeeTransactions",
                schema: "dbo",
                newName: "FeeTransactions");

            migrationBuilder.RenameTable(
                name: "FeeStructures",
                schema: "dbo",
                newName: "FeeStructures");

            migrationBuilder.RenameTable(
                name: "FeeHeads",
                schema: "dbo",
                newName: "FeeHeads");

            migrationBuilder.RenameTable(
                name: "FeeDiscounts",
                schema: "dbo",
                newName: "FeeDiscounts");

            migrationBuilder.RenameTable(
                name: "FeeDiscountAssignments",
                schema: "dbo",
                newName: "FeeDiscountAssignments");

            migrationBuilder.RenameTable(
                name: "FeeConfigurations",
                schema: "dbo",
                newName: "FeeConfigurations");

            migrationBuilder.RenameTable(
                name: "Exams",
                schema: "dbo",
                newName: "Exams");

            migrationBuilder.RenameTable(
                name: "EmployeeSalaries",
                schema: "dbo",
                newName: "EmployeeSalaries");

            migrationBuilder.RenameTable(
                name: "Employees",
                schema: "dbo",
                newName: "Employees");

            migrationBuilder.RenameTable(
                name: "EmployeeRoles",
                schema: "dbo",
                newName: "EmployeeRoles");

            migrationBuilder.RenameTable(
                name: "EmployeeDocuments",
                schema: "dbo",
                newName: "EmployeeDocuments");

            migrationBuilder.RenameTable(
                name: "EmployeeAttendances",
                schema: "dbo",
                newName: "EmployeeAttendances");

            migrationBuilder.RenameTable(
                name: "Designations",
                schema: "dbo",
                newName: "Designations");

            migrationBuilder.RenameTable(
                name: "Departments",
                schema: "dbo",
                newName: "Departments");

            migrationBuilder.RenameTable(
                name: "Courses",
                schema: "dbo",
                newName: "Courses");

            migrationBuilder.RenameTable(
                name: "Countries",
                schema: "dbo",
                newName: "Countries");

            migrationBuilder.RenameTable(
                name: "Cities",
                schema: "dbo",
                newName: "Cities");

            migrationBuilder.RenameTable(
                name: "AcademicYears",
                schema: "dbo",
                newName: "AcademicYears");

            migrationBuilder.RenameTable(
                name: "AcademicStreams",
                schema: "dbo",
                newName: "AcademicStreams");

            migrationBuilder.RenameTable(
                name: "AcademicSections",
                schema: "dbo",
                newName: "AcademicSections");

            migrationBuilder.RenameTable(
                name: "AcademicClasses",
                schema: "dbo",
                newName: "AcademicClasses");
        }
    }
}
