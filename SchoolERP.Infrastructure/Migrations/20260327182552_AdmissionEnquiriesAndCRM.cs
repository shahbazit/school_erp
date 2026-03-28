using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolERP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AdmissionEnquiriesAndCRM : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AdmissionEnquiries",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StudentName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ParentName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Mobile = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClassId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Gender = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Source = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NextFollowUpDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdmissionEnquiries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AdmissionEnquiries_AcademicClasses_ClassId",
                        column: x => x.ClassId,
                        principalSchema: "dbo",
                        principalTable: "AcademicClasses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CommunicationLogs",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Channel = table.Column<int>(type: "int", nullable: false),
                    RecipientType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RecipientsCount = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SentAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CommunicationLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "VisitorLogs",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VisitorName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Purpose = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    WhomToMeet = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CheckInTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CheckOutTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IdProof = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VisitorLogs", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AdmissionEnquiries_ClassId",
                schema: "dbo",
                table: "AdmissionEnquiries",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_AdmissionEnquiries_OrganizationId",
                schema: "dbo",
                table: "AdmissionEnquiries",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_CommunicationLogs_OrganizationId",
                schema: "dbo",
                table: "CommunicationLogs",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_VisitorLogs_OrganizationId",
                schema: "dbo",
                table: "VisitorLogs",
                column: "OrganizationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AdmissionEnquiries",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "CommunicationLogs",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "VisitorLogs",
                schema: "dbo");
        }
    }
}
