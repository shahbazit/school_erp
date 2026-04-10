using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolERP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDefaultFeeHeadToDiscount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "DefaultFeeHeadId",
                schema: "dbo",
                table: "FeeDiscounts",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_FeeDiscounts_DefaultFeeHeadId",
                schema: "dbo",
                table: "FeeDiscounts",
                column: "DefaultFeeHeadId");

            migrationBuilder.AddForeignKey(
                name: "FK_FeeDiscounts_FeeHeads_DefaultFeeHeadId",
                schema: "dbo",
                table: "FeeDiscounts",
                column: "DefaultFeeHeadId",
                principalSchema: "dbo",
                principalTable: "FeeHeads",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FeeDiscounts_FeeHeads_DefaultFeeHeadId",
                schema: "dbo",
                table: "FeeDiscounts");

            migrationBuilder.DropIndex(
                name: "IX_FeeDiscounts_DefaultFeeHeadId",
                schema: "dbo",
                table: "FeeDiscounts");

            migrationBuilder.DropColumn(
                name: "DefaultFeeHeadId",
                schema: "dbo",
                table: "FeeDiscounts");
        }
    }
}
