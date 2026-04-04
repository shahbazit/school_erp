using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolERP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCertificateFormats : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CertificateFormats",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TemplateId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    PaperSize = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PerPage = table.Column<int>(type: "int", nullable: false),
                    PrimaryColor = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LogoBase64 = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LogoPosition = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LogoScale = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ShowLogo = table.Column<bool>(type: "bit", nullable: false),
                    ShowAddress = table.Column<bool>(type: "bit", nullable: false),
                    ShowSeal = table.Column<bool>(type: "bit", nullable: false),
                    HeaderText = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BodyText = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FooterLeft = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FooterRight = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CertificateFormats", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CertificateFormats_OrganizationId",
                schema: "dbo",
                table: "CertificateFormats",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_CertificateFormats_OrganizationId_TemplateId",
                schema: "dbo",
                table: "CertificateFormats",
                columns: new[] { "OrganizationId", "TemplateId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CertificateFormats",
                schema: "dbo");
        }
    }
}
