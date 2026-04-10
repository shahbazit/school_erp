using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolERP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTransportAssignments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "AppliedCost",
                schema: "dbo",
                table: "TransportAssignments",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "StoppageId",
                schema: "dbo",
                table: "TransportAssignments",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_TransportAssignments_StoppageId",
                schema: "dbo",
                table: "TransportAssignments",
                column: "StoppageId");

            migrationBuilder.AddForeignKey(
                name: "FK_TransportAssignments_TransportStoppages_StoppageId",
                schema: "dbo",
                table: "TransportAssignments",
                column: "StoppageId",
                principalSchema: "dbo",
                principalTable: "TransportStoppages",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TransportAssignments_TransportStoppages_StoppageId",
                schema: "dbo",
                table: "TransportAssignments");

            migrationBuilder.DropIndex(
                name: "IX_TransportAssignments_StoppageId",
                schema: "dbo",
                table: "TransportAssignments");

            migrationBuilder.DropColumn(
                name: "AppliedCost",
                schema: "dbo",
                table: "TransportAssignments");

            migrationBuilder.DropColumn(
                name: "StoppageId",
                schema: "dbo",
                table: "TransportAssignments");
        }
    }
}
