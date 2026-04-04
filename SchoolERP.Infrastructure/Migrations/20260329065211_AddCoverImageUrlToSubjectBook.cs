using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolERP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCoverImageUrlToSubjectBook : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CoverImageUrl",
                schema: "dbo",
                table: "SubjectBooks",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AiUsageLogs_OrganizationId",
                schema: "dbo",
                table: "AiUsageLogs",
                column: "OrganizationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AiUsageLogs_OrganizationId",
                schema: "dbo",
                table: "AiUsageLogs");

            migrationBuilder.DropColumn(
                name: "CoverImageUrl",
                schema: "dbo",
                table: "SubjectBooks");
        }
    }
}
