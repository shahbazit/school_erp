using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolERP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMoreStudentFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AdmissionScheme",
                schema: "dbo",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AdmissionType",
                schema: "dbo",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "AnnualIncome",
                schema: "dbo",
                table: "Students",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ApaarId",
                schema: "dbo",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Bus",
                schema: "dbo",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "BusFee",
                schema: "dbo",
                table: "Students",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Caste",
                schema: "dbo",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Category",
                schema: "dbo",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ColorVision",
                schema: "dbo",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EnrollmentSchoolName",
                schema: "dbo",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FamilyId",
                schema: "dbo",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FatherAadharNo",
                schema: "dbo",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FatherQualification",
                schema: "dbo",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "HeightInCM",
                schema: "dbo",
                table: "Students",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HouseName",
                schema: "dbo",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsCaptain",
                schema: "dbo",
                table: "Students",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsMonitor",
                schema: "dbo",
                table: "Students",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "LedgerNumber",
                schema: "dbo",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Medium",
                schema: "dbo",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MotherAadharNo",
                schema: "dbo",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MotherQualification",
                schema: "dbo",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "OpeningBalance",
                schema: "dbo",
                table: "Students",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ParentAccountNo",
                schema: "dbo",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ParentBankIFSCCODE",
                schema: "dbo",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ParentBankName",
                schema: "dbo",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ParentEmail",
                schema: "dbo",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ParentMobileNumber",
                schema: "dbo",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ParentOccupation",
                schema: "dbo",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ParentQualification",
                schema: "dbo",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PermanentAddress",
                schema: "dbo",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PermanentEducationNo",
                schema: "dbo",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PlaceOfBirth",
                schema: "dbo",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PreviousClass",
                schema: "dbo",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RegistrationNumber",
                schema: "dbo",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Religion",
                schema: "dbo",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RouteName",
                schema: "dbo",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "SMSFacility",
                schema: "dbo",
                table: "Students",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "SMSMobileNumber",
                schema: "dbo",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SRNNumber",
                schema: "dbo",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StoppageName",
                schema: "dbo",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StudentAadharNo",
                schema: "dbo",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StudentBankAccountNo",
                schema: "dbo",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StudentBankName",
                schema: "dbo",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StudentIFSCCODE",
                schema: "dbo",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "TCDate",
                schema: "dbo",
                table: "Students",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TCNo",
                schema: "dbo",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "WeightInKG",
                schema: "dbo",
                table: "Students",
                type: "decimal(18,2)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdmissionScheme",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "AdmissionType",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "AnnualIncome",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "ApaarId",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "Bus",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "BusFee",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "Caste",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "Category",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "ColorVision",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "EnrollmentSchoolName",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "FamilyId",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "FatherAadharNo",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "FatherQualification",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "HeightInCM",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "HouseName",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "IsCaptain",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "IsMonitor",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "LedgerNumber",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "Medium",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "MotherAadharNo",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "MotherQualification",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "OpeningBalance",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "ParentAccountNo",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "ParentBankIFSCCODE",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "ParentBankName",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "ParentEmail",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "ParentMobileNumber",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "ParentOccupation",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "ParentQualification",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "PermanentAddress",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "PermanentEducationNo",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "PlaceOfBirth",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "PreviousClass",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "RegistrationNumber",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "Religion",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "RouteName",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "SMSFacility",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "SMSMobileNumber",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "SRNNumber",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "StoppageName",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "StudentAadharNo",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "StudentBankAccountNo",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "StudentBankName",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "StudentIFSCCODE",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "TCDate",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "TCNo",
                schema: "dbo",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "WeightInKG",
                schema: "dbo",
                table: "Students");
        }
    }
}
