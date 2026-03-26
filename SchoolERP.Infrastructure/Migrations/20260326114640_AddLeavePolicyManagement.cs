using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolERP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLeavePolicyManagement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "LeavePolicyId",
                table: "Employees",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "LeavePolicy",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeavePolicy", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LeavePolicyRule",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LeavePolicyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LeaveTypeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MaxDaysPerYear = table.Column<int>(type: "int", nullable: false),
                    IsMonthlyAccrual = table.Column<bool>(type: "bit", nullable: false),
                    AccrualRatePerMonth = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CanCarryForward = table.Column<bool>(type: "bit", nullable: false),
                    MaxCarryForwardDays = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeavePolicyRule", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeavePolicyRule_LeavePolicy_LeavePolicyId",
                        column: x => x.LeavePolicyId,
                        principalTable: "LeavePolicy",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LeavePolicyRule_LeaveTypes_LeaveTypeId",
                        column: x => x.LeaveTypeId,
                        principalTable: "LeaveTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Employees_LeavePolicyId",
                table: "Employees",
                column: "LeavePolicyId");

            migrationBuilder.CreateIndex(
                name: "IX_LeavePolicyRule_LeavePolicyId",
                table: "LeavePolicyRule",
                column: "LeavePolicyId");

            migrationBuilder.CreateIndex(
                name: "IX_LeavePolicyRule_LeaveTypeId",
                table: "LeavePolicyRule",
                column: "LeaveTypeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Employees_LeavePolicy_LeavePolicyId",
                table: "Employees",
                column: "LeavePolicyId",
                principalTable: "LeavePolicy",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Employees_LeavePolicy_LeavePolicyId",
                table: "Employees");

            migrationBuilder.DropTable(
                name: "LeavePolicyRule");

            migrationBuilder.DropTable(
                name: "LeavePolicy");

            migrationBuilder.DropIndex(
                name: "IX_Employees_LeavePolicyId",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "LeavePolicyId",
                table: "Employees");
        }
    }
}
