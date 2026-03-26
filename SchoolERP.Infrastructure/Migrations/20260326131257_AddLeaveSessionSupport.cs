using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolERP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLeaveSessionSupport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "AcademicYearId",
                table: "LeaveApplications",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<int>(
                name: "DayType",
                table: "LeaveApplications",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_LeaveApplications_AcademicYearId",
                table: "LeaveApplications",
                column: "AcademicYearId");

            migrationBuilder.AddForeignKey(
                name: "FK_LeaveApplications_AcademicYears_AcademicYearId",
                table: "LeaveApplications",
                column: "AcademicYearId",
                principalTable: "AcademicYears",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LeaveApplications_AcademicYears_AcademicYearId",
                table: "LeaveApplications");

            migrationBuilder.DropIndex(
                name: "IX_LeaveApplications_AcademicYearId",
                table: "LeaveApplications");

            migrationBuilder.DropColumn(
                name: "AcademicYearId",
                table: "LeaveApplications");

            migrationBuilder.DropColumn(
                name: "DayType",
                table: "LeaveApplications");
        }
    }
}
