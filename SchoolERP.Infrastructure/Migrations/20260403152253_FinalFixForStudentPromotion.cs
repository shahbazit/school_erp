using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolERP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FinalFixForStudentPromotion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Manually ensure columns exist in case previous migrations failed silently
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[StudentAcademics]') AND name = 'ClassId')
                BEGIN
                    ALTER TABLE [dbo].[StudentAcademics] ADD [ClassId] [uniqueidentifier] NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
                END
                
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[StudentAcademics]') AND name = 'SectionId')
                BEGIN
                    ALTER TABLE [dbo].[StudentAcademics] ADD [SectionId] [uniqueidentifier] NULL;
                END
            ");

            // Manually ensure foreign keys exist / are updated
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_StudentAcademics_AcademicClasses_ClassId')
                BEGIN
                    ALTER TABLE [dbo].[StudentAcademics] DROP CONSTRAINT [FK_StudentAcademics_AcademicClasses_ClassId];
                END
                
                ALTER TABLE [dbo].[StudentAcademics] WITH CHECK ADD CONSTRAINT [FK_StudentAcademics_AcademicClasses_ClassId] 
                FOREIGN KEY([ClassId]) REFERENCES [dbo].[AcademicClasses] ([Id]);

                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_StudentAcademics_AcademicSections_SectionId')
                BEGIN
                    ALTER TABLE [dbo].[StudentAcademics] DROP CONSTRAINT [FK_StudentAcademics_AcademicSections_SectionId];
                END
                
                ALTER TABLE [dbo].[StudentAcademics] WITH CHECK ADD CONSTRAINT [FK_StudentAcademics_AcademicSections_SectionId] 
                FOREIGN KEY([SectionId]) REFERENCES [dbo].[AcademicSections] ([Id]);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StudentAcademics_AcademicClasses_ClassId",
                schema: "dbo",
                table: "StudentAcademics");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentAcademics_AcademicSections_SectionId",
                schema: "dbo",
                table: "StudentAcademics");

            migrationBuilder.AddForeignKey(
                name: "FK_StudentAcademics_AcademicClasses_ClassId",
                schema: "dbo",
                table: "StudentAcademics",
                column: "ClassId",
                principalSchema: "dbo",
                principalTable: "AcademicClasses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentAcademics_AcademicSections_SectionId",
                schema: "dbo",
                table: "StudentAcademics",
                column: "SectionId",
                principalSchema: "dbo",
                principalTable: "AcademicSections",
                principalColumn: "Id");
        }
    }
}
