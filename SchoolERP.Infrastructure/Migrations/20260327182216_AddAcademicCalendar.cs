using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolERP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAcademicCalendar : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AcademicCalendars",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Date = table.Column<DateTime>(type: "date", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Category = table.Column<int>(type: "int", nullable: false),
                    IsHolidayForStudents = table.Column<bool>(type: "bit", nullable: false),
                    IsHolidayForStaff = table.Column<bool>(type: "bit", nullable: false),
                    AcademicYearId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AcademicCalendars", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AcademicCalendars_AcademicYears_AcademicYearId",
                        column: x => x.AcademicYearId,
                        principalSchema: "dbo",
                        principalTable: "AcademicYears",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AcademicCalendars_AcademicYearId",
                schema: "dbo",
                table: "AcademicCalendars",
                column: "AcademicYearId");

            migrationBuilder.CreateIndex(
                name: "IX_AcademicCalendars_OrganizationId",
                schema: "dbo",
                table: "AcademicCalendars",
                column: "OrganizationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AcademicCalendars",
                schema: "dbo");
        }
    }
}
