using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolERP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCalendarTargetingAndSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsAllClasses",
                schema: "dbo",
                table: "AcademicCalendars",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsAllStaff",
                schema: "dbo",
                table: "AcademicCalendars",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "AcademicCalendarAcademicClass",
                schema: "dbo",
                columns: table => new
                {
                    AcademicCalendarId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TargetClassesId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AcademicCalendarAcademicClass", x => new { x.AcademicCalendarId, x.TargetClassesId });
                    table.ForeignKey(
                        name: "FK_AcademicCalendarAcademicClass_AcademicCalendars_AcademicCalendarId",
                        column: x => x.AcademicCalendarId,
                        principalSchema: "dbo",
                        principalTable: "AcademicCalendars",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AcademicCalendarAcademicClass_AcademicClasses_TargetClassesId",
                        column: x => x.TargetClassesId,
                        principalSchema: "dbo",
                        principalTable: "AcademicClasses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AcademicCalendarDepartment",
                schema: "dbo",
                columns: table => new
                {
                    AcademicCalendarId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TargetDepartmentsId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AcademicCalendarDepartment", x => new { x.AcademicCalendarId, x.TargetDepartmentsId });
                    table.ForeignKey(
                        name: "FK_AcademicCalendarDepartment_AcademicCalendars_AcademicCalendarId",
                        column: x => x.AcademicCalendarId,
                        principalSchema: "dbo",
                        principalTable: "AcademicCalendars",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AcademicCalendarDepartment_Departments_TargetDepartmentsId",
                        column: x => x.TargetDepartmentsId,
                        principalSchema: "dbo",
                        principalTable: "Departments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SchoolSettings",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WeeklyOffDays = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SaturdayOffOccurrences = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SchoolSettings", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AcademicCalendarAcademicClass_TargetClassesId",
                schema: "dbo",
                table: "AcademicCalendarAcademicClass",
                column: "TargetClassesId");

            migrationBuilder.CreateIndex(
                name: "IX_AcademicCalendarDepartment_TargetDepartmentsId",
                schema: "dbo",
                table: "AcademicCalendarDepartment",
                column: "TargetDepartmentsId");

            migrationBuilder.CreateIndex(
                name: "IX_SchoolSettings_OrganizationId",
                schema: "dbo",
                table: "SchoolSettings",
                column: "OrganizationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AcademicCalendarAcademicClass",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "AcademicCalendarDepartment",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "SchoolSettings",
                schema: "dbo");

            migrationBuilder.DropColumn(
                name: "IsAllClasses",
                schema: "dbo",
                table: "AcademicCalendars");

            migrationBuilder.DropColumn(
                name: "IsAllStaff",
                schema: "dbo",
                table: "AcademicCalendars");
        }
    }
}
