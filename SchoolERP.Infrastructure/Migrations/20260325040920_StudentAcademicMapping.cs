using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolERP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class StudentAcademicMapping : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Students_AcademicClasses_ClassId",
                table: "Students");

            migrationBuilder.DropIndex(
                name: "IX_Students_ClassId",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "AcademicYear",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "ClassId",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "RollNumber",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "SectionId",
                table: "Students");

            migrationBuilder.AddColumn<string>(
                name: "CustomCalculationType",
                table: "FeeDiscountAssignments",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomFrequency",
                table: "FeeDiscountAssignments",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "CustomValue",
                table: "FeeDiscountAssignments",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "StudentAcademics",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StudentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClassId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SectionId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    AcademicYear = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RollNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsCurrent = table.Column<bool>(type: "bit", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentAcademics", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StudentAcademics_AcademicClasses_ClassId",
                        column: x => x.ClassId,
                        principalTable: "AcademicClasses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_StudentAcademics_AcademicSections_SectionId",
                        column: x => x.SectionId,
                        principalTable: "AcademicSections",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_StudentAcademics_Students_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Students",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FeeTransactions_AcademicYearId",
                table: "FeeTransactions",
                column: "AcademicYearId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentAcademics_ClassId",
                table: "StudentAcademics",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentAcademics_OrganizationId",
                table: "StudentAcademics",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentAcademics_SectionId",
                table: "StudentAcademics",
                column: "SectionId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentAcademics_StudentId",
                table: "StudentAcademics",
                column: "StudentId");

            migrationBuilder.AddForeignKey(
                name: "FK_FeeTransactions_AcademicYears_AcademicYearId",
                table: "FeeTransactions",
                column: "AcademicYearId",
                principalTable: "AcademicYears",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FeeTransactions_AcademicYears_AcademicYearId",
                table: "FeeTransactions");

            migrationBuilder.DropTable(
                name: "StudentAcademics");

            migrationBuilder.DropIndex(
                name: "IX_FeeTransactions_AcademicYearId",
                table: "FeeTransactions");

            migrationBuilder.DropColumn(
                name: "CustomCalculationType",
                table: "FeeDiscountAssignments");

            migrationBuilder.DropColumn(
                name: "CustomFrequency",
                table: "FeeDiscountAssignments");

            migrationBuilder.DropColumn(
                name: "CustomValue",
                table: "FeeDiscountAssignments");

            migrationBuilder.AddColumn<string>(
                name: "AcademicYear",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ClassId",
                table: "Students",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RollNumber",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SectionId",
                table: "Students",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Students_ClassId",
                table: "Students",
                column: "ClassId");

            migrationBuilder.AddForeignKey(
                name: "FK_Students_AcademicClasses_ClassId",
                table: "Students",
                column: "ClassId",
                principalTable: "AcademicClasses",
                principalColumn: "Id");
        }
    }
}
