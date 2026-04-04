using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolERP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAiChatHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AiChatHistories",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ChapterId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AiChatHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AiChatHistories_SubjectChapters_ChapterId",
                        column: x => x.ChapterId,
                        principalSchema: "dbo",
                        principalTable: "SubjectChapters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AiChatHistories_ChapterId",
                schema: "dbo",
                table: "AiChatHistories",
                column: "ChapterId");

            migrationBuilder.CreateIndex(
                name: "IX_AiChatHistories_OrganizationId",
                schema: "dbo",
                table: "AiChatHistories",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_AiChatHistories_UserId_ChapterId",
                schema: "dbo",
                table: "AiChatHistories",
                columns: new[] { "UserId", "ChapterId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AiChatHistories",
                schema: "dbo");
        }
    }
}
