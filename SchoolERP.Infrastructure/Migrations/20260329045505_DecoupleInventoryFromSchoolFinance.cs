using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolERP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class DecoupleInventoryFromSchoolFinance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Step 1: Drop the FK linking InventoryTransactions to FinancialAccounts
            migrationBuilder.DropForeignKey(
                name: "FK_InventoryTransactions_FinancialAccounts_FinancialAccountId",
                schema: "dbo",
                table: "InventoryTransactions");

            // Step 2: Drop certificate format columns (unrelated schema cleanup bundled in here)
            migrationBuilder.DropColumn(
                name: "LogoBase64",
                schema: "dbo",
                table: "CertificateFormats");

            migrationBuilder.DropColumn(
                name: "LogoPosition",
                schema: "dbo",
                table: "CertificateFormats");

            // Step 3: Rename FinancialAccountId -> SupplierId
            migrationBuilder.RenameColumn(
                name: "FinancialAccountId",
                schema: "dbo",
                table: "InventoryTransactions",
                newName: "SupplierId");

            migrationBuilder.RenameIndex(
                name: "IX_InventoryTransactions_FinancialAccountId",
                schema: "dbo",
                table: "InventoryTransactions",
                newName: "IX_InventoryTransactions_SupplierId");

            // Step 4: Clear old FK values — they pointed to FinancialAccounts, not InventorySuppliers
            migrationBuilder.Sql("UPDATE [dbo].[InventoryTransactions] SET [SupplierId] = NULL");

            // Step 5: Add new vendor payment tracking columns
            migrationBuilder.AddColumn<decimal>(
                name: "AmountPaid",
                schema: "dbo",
                table: "InventoryTransactions",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                schema: "dbo",
                table: "InventoryTransactions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentStatus",
                schema: "dbo",
                table: "InventoryTransactions",
                type: "nvarchar(max)",
                nullable: true);

            // Step 6: Add FK to InventorySuppliers (optional, nullable SupplierId)
            migrationBuilder.AddForeignKey(
                name: "FK_InventoryTransactions_InventorySuppliers_SupplierId",
                schema: "dbo",
                table: "InventoryTransactions",
                column: "SupplierId",
                principalSchema: "dbo",
                principalTable: "InventorySuppliers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InventoryTransactions_InventoryItems_ItemId",
                schema: "dbo",
                table: "InventoryTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_InventoryTransactions_InventorySuppliers_SupplierId",
                schema: "dbo",
                table: "InventoryTransactions");

            migrationBuilder.DropColumn(
                name: "AmountPaid",
                schema: "dbo",
                table: "InventoryTransactions");

            migrationBuilder.DropColumn(
                name: "Notes",
                schema: "dbo",
                table: "InventoryTransactions");

            migrationBuilder.DropColumn(
                name: "PaymentStatus",
                schema: "dbo",
                table: "InventoryTransactions");

            migrationBuilder.RenameColumn(
                name: "SupplierId",
                schema: "dbo",
                table: "InventoryTransactions",
                newName: "FinancialAccountId");

            migrationBuilder.RenameIndex(
                name: "IX_InventoryTransactions_SupplierId",
                schema: "dbo",
                table: "InventoryTransactions",
                newName: "IX_InventoryTransactions_FinancialAccountId");

            migrationBuilder.AddColumn<string>(
                name: "LogoBase64",
                schema: "dbo",
                table: "CertificateFormats",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LogoPosition",
                schema: "dbo",
                table: "CertificateFormats",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryTransactions_FinancialAccounts_FinancialAccountId",
                schema: "dbo",
                table: "InventoryTransactions",
                column: "FinancialAccountId",
                principalSchema: "dbo",
                principalTable: "FinancialAccounts",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryTransactions_InventoryItems_ItemId",
                schema: "dbo",
                table: "InventoryTransactions",
                column: "ItemId",
                principalSchema: "dbo",
                principalTable: "InventoryItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
