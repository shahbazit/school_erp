using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolERP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLeavePolicySettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "AccrualRatePerMonth",
                table: "LeaveTypes",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<bool>(
                name: "CanCarryForward",
                table: "LeaveTypes",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsMonthlyAccrual",
                table: "LeaveTypes",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "MaxCarryForwardDays",
                table: "LeaveTypes",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AccrualRatePerMonth",
                table: "LeaveTypes");

            migrationBuilder.DropColumn(
                name: "CanCarryForward",
                table: "LeaveTypes");

            migrationBuilder.DropColumn(
                name: "IsMonthlyAccrual",
                table: "LeaveTypes");

            migrationBuilder.DropColumn(
                name: "MaxCarryForwardDays",
                table: "LeaveTypes");
        }
    }
}
