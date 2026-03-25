using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolERP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FeeStructureSessionMapping : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "AcademicYearId",
                table: "FeeStructures",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_FeeStructures_AcademicYearId",
                table: "FeeStructures",
                column: "AcademicYearId");

            migrationBuilder.AddForeignKey(
                name: "FK_FeeStructures_AcademicYears_AcademicYearId",
                table: "FeeStructures",
                column: "AcademicYearId",
                principalTable: "AcademicYears",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FeeStructures_AcademicYears_AcademicYearId",
                table: "FeeStructures");

            migrationBuilder.DropIndex(
                name: "IX_FeeStructures_AcademicYearId",
                table: "FeeStructures");

            migrationBuilder.DropColumn(
                name: "AcademicYearId",
                table: "FeeStructures");
        }
    }
}
