using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolERP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLeavePlans : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "LeavePlanId",
                table: "LeaveTypes",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "LeavePlanId",
                table: "Employees",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "LeavePlan",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeavePlan", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LeaveTypes_LeavePlanId",
                table: "LeaveTypes",
                column: "LeavePlanId");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_LeavePlanId",
                table: "Employees",
                column: "LeavePlanId");

            migrationBuilder.AddForeignKey(
                name: "FK_Employees_LeavePlan_LeavePlanId",
                table: "Employees",
                column: "LeavePlanId",
                principalTable: "LeavePlan",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_LeaveTypes_LeavePlan_LeavePlanId",
                table: "LeaveTypes",
                column: "LeavePlanId",
                principalTable: "LeavePlan",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Employees_LeavePlan_LeavePlanId",
                table: "Employees");

            migrationBuilder.DropForeignKey(
                name: "FK_LeaveTypes_LeavePlan_LeavePlanId",
                table: "LeaveTypes");

            migrationBuilder.DropTable(
                name: "LeavePlan");

            migrationBuilder.DropIndex(
                name: "IX_LeaveTypes_LeavePlanId",
                table: "LeaveTypes");

            migrationBuilder.DropIndex(
                name: "IX_Employees_LeavePlanId",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "LeavePlanId",
                table: "LeaveTypes");

            migrationBuilder.DropColumn(
                name: "LeavePlanId",
                table: "Employees");
        }
    }
}
