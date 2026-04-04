using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolERP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSubjectHierarchyAndOCR : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SubjectChapters_Subjects_SubjectId",
                schema: "dbo",
                table: "SubjectChapters");

            migrationBuilder.DropForeignKey(
                name: "FK_SubjectChapters_Subjects_SubjectId1",
                schema: "dbo",
                table: "SubjectChapters");

            migrationBuilder.DropIndex(
                name: "IX_SubjectChapters_SubjectId1",
                schema: "dbo",
                table: "SubjectChapters");

            migrationBuilder.DropColumn(
                name: "SubjectId1",
                schema: "dbo",
                table: "SubjectChapters");

            migrationBuilder.RenameColumn(
                name: "SubjectId",
                schema: "dbo",
                table: "SubjectChapters",
                newName: "SubjectBookId");

            migrationBuilder.RenameIndex(
                name: "IX_SubjectChapters_SubjectId",
                schema: "dbo",
                table: "SubjectChapters",
                newName: "IX_SubjectChapters_SubjectBookId");

            migrationBuilder.AddColumn<int>(
                name: "PageNumber",
                schema: "dbo",
                table: "ChapterContents",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "SubjectBooks",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AcademicClassId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SubjectId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    AcademicClassId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SubjectId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubjectBooks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SubjectBooks_AcademicClasses_AcademicClassId",
                        column: x => x.AcademicClassId,
                        principalSchema: "dbo",
                        principalTable: "AcademicClasses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SubjectBooks_AcademicClasses_AcademicClassId1",
                        column: x => x.AcademicClassId1,
                        principalSchema: "dbo",
                        principalTable: "AcademicClasses",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_SubjectBooks_Subjects_SubjectId",
                        column: x => x.SubjectId,
                        principalSchema: "dbo",
                        principalTable: "Subjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SubjectBooks_Subjects_SubjectId1",
                        column: x => x.SubjectId1,
                        principalSchema: "dbo",
                        principalTable: "Subjects",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_SubjectBooks_AcademicClassId",
                schema: "dbo",
                table: "SubjectBooks",
                column: "AcademicClassId");

            migrationBuilder.CreateIndex(
                name: "IX_SubjectBooks_AcademicClassId1",
                schema: "dbo",
                table: "SubjectBooks",
                column: "AcademicClassId1");

            migrationBuilder.CreateIndex(
                name: "IX_SubjectBooks_SubjectId",
                schema: "dbo",
                table: "SubjectBooks",
                column: "SubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_SubjectBooks_SubjectId1",
                schema: "dbo",
                table: "SubjectBooks",
                column: "SubjectId1");

            migrationBuilder.AddForeignKey(
                name: "FK_SubjectChapters_SubjectBooks_SubjectBookId",
                schema: "dbo",
                table: "SubjectChapters",
                column: "SubjectBookId",
                principalSchema: "dbo",
                principalTable: "SubjectBooks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SubjectChapters_SubjectBooks_SubjectBookId",
                schema: "dbo",
                table: "SubjectChapters");

            migrationBuilder.DropTable(
                name: "SubjectBooks",
                schema: "dbo");

            migrationBuilder.DropColumn(
                name: "PageNumber",
                schema: "dbo",
                table: "ChapterContents");

            migrationBuilder.RenameColumn(
                name: "SubjectBookId",
                schema: "dbo",
                table: "SubjectChapters",
                newName: "SubjectId");

            migrationBuilder.RenameIndex(
                name: "IX_SubjectChapters_SubjectBookId",
                schema: "dbo",
                table: "SubjectChapters",
                newName: "IX_SubjectChapters_SubjectId");

            migrationBuilder.AddColumn<Guid>(
                name: "SubjectId1",
                schema: "dbo",
                table: "SubjectChapters",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SubjectChapters_SubjectId1",
                schema: "dbo",
                table: "SubjectChapters",
                column: "SubjectId1");

            migrationBuilder.AddForeignKey(
                name: "FK_SubjectChapters_Subjects_SubjectId",
                schema: "dbo",
                table: "SubjectChapters",
                column: "SubjectId",
                principalSchema: "dbo",
                principalTable: "Subjects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SubjectChapters_Subjects_SubjectId1",
                schema: "dbo",
                table: "SubjectChapters",
                column: "SubjectId1",
                principalSchema: "dbo",
                principalTable: "Subjects",
                principalColumn: "Id");
        }
    }
}
