using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolERP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSubjectAIContent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SubjectChapters",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SubjectId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OrderIndex = table.Column<int>(type: "int", nullable: false),
                    Summary = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SubjectId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubjectChapters", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SubjectChapters_Subjects_SubjectId",
                        column: x => x.SubjectId,
                        principalSchema: "dbo",
                        principalTable: "Subjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SubjectChapters_Subjects_SubjectId1",
                        column: x => x.SubjectId1,
                        principalSchema: "dbo",
                        principalTable: "Subjects",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ChapterContents",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ChapterId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ContentType = table.Column<int>(type: "int", nullable: false),
                    ContentValue = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OrderIndex = table.Column<int>(type: "int", nullable: false),
                    VectorEmbedding = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChapterContents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChapterContents_SubjectChapters_ChapterId",
                        column: x => x.ChapterId,
                        principalSchema: "dbo",
                        principalTable: "SubjectChapters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChapterContents_ChapterId",
                schema: "dbo",
                table: "ChapterContents",
                column: "ChapterId");

            migrationBuilder.CreateIndex(
                name: "IX_ChapterContents_OrganizationId",
                schema: "dbo",
                table: "ChapterContents",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_SubjectChapters_OrganizationId",
                schema: "dbo",
                table: "SubjectChapters",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_SubjectChapters_SubjectId",
                schema: "dbo",
                table: "SubjectChapters",
                column: "SubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_SubjectChapters_SubjectId1",
                schema: "dbo",
                table: "SubjectChapters",
                column: "SubjectId1");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ChapterContents",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "SubjectChapters",
                schema: "dbo");
        }
    }
}
