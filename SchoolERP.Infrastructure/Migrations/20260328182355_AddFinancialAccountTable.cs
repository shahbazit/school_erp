using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolERP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddFinancialAccountTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "FinancialAccountId",
                schema: "dbo",
                table: "OtherIncomes",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "FinancialAccountId",
                schema: "dbo",
                table: "OfficeExpenses",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "FinancialAccountId",
                schema: "dbo",
                table: "FeeTransactions",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "FinancialAccounts",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AccountType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    OwnerEmployeeId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FinancialAccounts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FinancialAccounts_Employees_OwnerEmployeeId",
                        column: x => x.OwnerEmployeeId,
                        principalSchema: "dbo",
                        principalTable: "Employees",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "LibraryCategories",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LibraryCategories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TransportStoppages",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Cost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TransportStoppages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LibraryBooks",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Author = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Publisher = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Edition = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ISBN = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TotalCopies = table.Column<int>(type: "int", nullable: false),
                    AvailableCopies = table.Column<int>(type: "int", nullable: false),
                    Location = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LibraryBooks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LibraryBooks_LibraryCategories_CategoryId",
                        column: x => x.CategoryId,
                        principalSchema: "dbo",
                        principalTable: "LibraryCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LibraryBookIssues",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BookId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StudentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    EmployeeId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IssueDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DueDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReturnDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FineAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LibraryBookIssues", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LibraryBookIssues_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalSchema: "dbo",
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_LibraryBookIssues_LibraryBooks_BookId",
                        column: x => x.BookId,
                        principalSchema: "dbo",
                        principalTable: "LibraryBooks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LibraryBookIssues_Students_StudentId",
                        column: x => x.StudentId,
                        principalSchema: "dbo",
                        principalTable: "Students",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OtherIncomes_FinancialAccountId",
                schema: "dbo",
                table: "OtherIncomes",
                column: "FinancialAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_OfficeExpenses_FinancialAccountId",
                schema: "dbo",
                table: "OfficeExpenses",
                column: "FinancialAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_FeeTransactions_FinancialAccountId",
                schema: "dbo",
                table: "FeeTransactions",
                column: "FinancialAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_FinancialAccounts_OrganizationId",
                schema: "dbo",
                table: "FinancialAccounts",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_FinancialAccounts_OwnerEmployeeId",
                schema: "dbo",
                table: "FinancialAccounts",
                column: "OwnerEmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_LibraryBookIssues_BookId",
                schema: "dbo",
                table: "LibraryBookIssues",
                column: "BookId");

            migrationBuilder.CreateIndex(
                name: "IX_LibraryBookIssues_EmployeeId",
                schema: "dbo",
                table: "LibraryBookIssues",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_LibraryBookIssues_OrganizationId",
                schema: "dbo",
                table: "LibraryBookIssues",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_LibraryBookIssues_StudentId",
                schema: "dbo",
                table: "LibraryBookIssues",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_LibraryBooks_CategoryId",
                schema: "dbo",
                table: "LibraryBooks",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_LibraryBooks_OrganizationId",
                schema: "dbo",
                table: "LibraryBooks",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_LibraryCategories_OrganizationId",
                schema: "dbo",
                table: "LibraryCategories",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_TransportStoppages_OrganizationId",
                schema: "dbo",
                table: "TransportStoppages",
                column: "OrganizationId");

            migrationBuilder.AddForeignKey(
                name: "FK_FeeTransactions_FinancialAccounts_FinancialAccountId",
                schema: "dbo",
                table: "FeeTransactions",
                column: "FinancialAccountId",
                principalSchema: "dbo",
                principalTable: "FinancialAccounts",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_OfficeExpenses_FinancialAccounts_FinancialAccountId",
                schema: "dbo",
                table: "OfficeExpenses",
                column: "FinancialAccountId",
                principalSchema: "dbo",
                principalTable: "FinancialAccounts",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_OtherIncomes_FinancialAccounts_FinancialAccountId",
                schema: "dbo",
                table: "OtherIncomes",
                column: "FinancialAccountId",
                principalSchema: "dbo",
                principalTable: "FinancialAccounts",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FeeTransactions_FinancialAccounts_FinancialAccountId",
                schema: "dbo",
                table: "FeeTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_OfficeExpenses_FinancialAccounts_FinancialAccountId",
                schema: "dbo",
                table: "OfficeExpenses");

            migrationBuilder.DropForeignKey(
                name: "FK_OtherIncomes_FinancialAccounts_FinancialAccountId",
                schema: "dbo",
                table: "OtherIncomes");

            migrationBuilder.DropTable(
                name: "FinancialAccounts",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "LibraryBookIssues",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "TransportStoppages",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "LibraryBooks",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "LibraryCategories",
                schema: "dbo");

            migrationBuilder.DropIndex(
                name: "IX_OtherIncomes_FinancialAccountId",
                schema: "dbo",
                table: "OtherIncomes");

            migrationBuilder.DropIndex(
                name: "IX_OfficeExpenses_FinancialAccountId",
                schema: "dbo",
                table: "OfficeExpenses");

            migrationBuilder.DropIndex(
                name: "IX_FeeTransactions_FinancialAccountId",
                schema: "dbo",
                table: "FeeTransactions");

            migrationBuilder.DropColumn(
                name: "FinancialAccountId",
                schema: "dbo",
                table: "OtherIncomes");

            migrationBuilder.DropColumn(
                name: "FinancialAccountId",
                schema: "dbo",
                table: "OfficeExpenses");

            migrationBuilder.DropColumn(
                name: "FinancialAccountId",
                schema: "dbo",
                table: "FeeTransactions");
        }
    }
}
