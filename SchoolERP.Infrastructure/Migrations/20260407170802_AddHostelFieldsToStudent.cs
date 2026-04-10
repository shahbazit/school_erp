using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolERP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddHostelFieldsToStudent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "HostelName",
                schema: "dbo",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RoomNo",
                schema: "dbo",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HostelName",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "RoomNo",
                schema: "dbo",
                table: "Students");
        }
    }
}
