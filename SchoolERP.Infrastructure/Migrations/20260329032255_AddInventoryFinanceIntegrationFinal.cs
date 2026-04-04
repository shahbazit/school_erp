using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolERP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddInventoryFinanceIntegrationFinal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "FinancialAccountId",
                schema: "dbo",
                table: "InventoryTransactions",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalAmount",
                schema: "dbo",
                table: "InventoryTransactions",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "UnitPrice",
                schema: "dbo",
                table: "InventoryTransactions",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateIndex(
                name: "IX_InventoryTransactions_FinancialAccountId",
                schema: "dbo",
                table: "InventoryTransactions",
                column: "FinancialAccountId");

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryTransactions_FinancialAccounts_FinancialAccountId",
                schema: "dbo",
                table: "InventoryTransactions",
                column: "FinancialAccountId",
                principalSchema: "dbo",
                principalTable: "FinancialAccounts",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InventoryTransactions_FinancialAccounts_FinancialAccountId",
                schema: "dbo",
                table: "InventoryTransactions");

            migrationBuilder.DropIndex(
                name: "IX_InventoryTransactions_FinancialAccountId",
                schema: "dbo",
                table: "InventoryTransactions");

            migrationBuilder.DropColumn(
                name: "FinancialAccountId",
                schema: "dbo",
                table: "InventoryTransactions");

            migrationBuilder.DropColumn(
                name: "TotalAmount",
                schema: "dbo",
                table: "InventoryTransactions");

            migrationBuilder.DropColumn(
                name: "UnitPrice",
                schema: "dbo",
                table: "InventoryTransactions");
        }
    }
}
