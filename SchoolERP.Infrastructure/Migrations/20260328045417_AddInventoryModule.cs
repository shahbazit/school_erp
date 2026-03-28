using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolERP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddInventoryModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Address",
                schema: "dbo",
                table: "Organizations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AdmissionNoPrefix",
                schema: "dbo",
                table: "Organizations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AffiliationNo",
                schema: "dbo",
                table: "Organizations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AlternatePhone",
                schema: "dbo",
                table: "Organizations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BoardAffiliation",
                schema: "dbo",
                table: "Organizations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "City",
                schema: "dbo",
                table: "Organizations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Country",
                schema: "dbo",
                table: "Organizations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CurrencyCode",
                schema: "dbo",
                table: "Organizations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CurrencySymbol",
                schema: "dbo",
                table: "Organizations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DateFormat",
                schema: "dbo",
                table: "Organizations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Email",
                schema: "dbo",
                table: "Organizations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EmployeeIdPrefix",
                schema: "dbo",
                table: "Organizations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EstablishedYear",
                schema: "dbo",
                table: "Organizations",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LogoBase64",
                schema: "dbo",
                table: "Organizations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Phone",
                schema: "dbo",
                table: "Organizations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PinCode",
                schema: "dbo",
                table: "Organizations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReceiptPrefix",
                schema: "dbo",
                table: "Organizations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SchoolType",
                schema: "dbo",
                table: "Organizations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "State",
                schema: "dbo",
                table: "Organizations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StudentIdFormat",
                schema: "dbo",
                table: "Organizations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Tagline",
                schema: "dbo",
                table: "Organizations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TimeZone",
                schema: "dbo",
                table: "Organizations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Website",
                schema: "dbo",
                table: "Organizations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Hostels",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    WardenName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    WardenPhone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Hostels", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "InventoryCategories",
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
                    table.PrimaryKey("PK_InventoryCategories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "InventorySuppliers",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ContactPerson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Category = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventorySuppliers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TransportVehicles",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VehicleNo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    VehicleModel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FuelType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Capacity = table.Column<int>(type: "int", nullable: false),
                    RegistrationDetails = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ChasisNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DriverName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DriverPhone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TransportVehicles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "HostelRooms",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    HostelId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RoomNo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RoomType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Capacity = table.Column<int>(type: "int", nullable: false),
                    CostPerMonth = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HostelRooms", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HostelRooms_Hostels_HostelId",
                        column: x => x.HostelId,
                        principalSchema: "dbo",
                        principalTable: "Hostels",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InventoryItems",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MinQuantity = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CurrentStock = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventoryItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InventoryItems_InventoryCategories_CategoryId",
                        column: x => x.CategoryId,
                        principalSchema: "dbo",
                        principalTable: "InventoryCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TransportRoutes",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RouteName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    VehicleId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DriverName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RouteCost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TransportRoutes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TransportRoutes_TransportVehicles_VehicleId",
                        column: x => x.VehicleId,
                        principalSchema: "dbo",
                        principalTable: "TransportVehicles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "HostelAssignments",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StudentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EmployeeId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    RoomId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HostelAssignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HostelAssignments_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalSchema: "dbo",
                        principalTable: "Employees",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_HostelAssignments_HostelRooms_RoomId",
                        column: x => x.RoomId,
                        principalSchema: "dbo",
                        principalTable: "HostelRooms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HostelAssignments_Students_StudentId",
                        column: x => x.StudentId,
                        principalSchema: "dbo",
                        principalTable: "Students",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InventoryTransactions",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Reference = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Entity = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HandledBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TransactionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventoryTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InventoryTransactions_InventoryItems_ItemId",
                        column: x => x.ItemId,
                        principalSchema: "dbo",
                        principalTable: "InventoryItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TransportAssignments",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StudentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EmployeeId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    RouteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TransportAssignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TransportAssignments_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalSchema: "dbo",
                        principalTable: "Employees",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_TransportAssignments_Students_StudentId",
                        column: x => x.StudentId,
                        principalSchema: "dbo",
                        principalTable: "Students",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TransportAssignments_TransportRoutes_RouteId",
                        column: x => x.RouteId,
                        principalSchema: "dbo",
                        principalTable: "TransportRoutes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HostelAssignments_EmployeeId",
                schema: "dbo",
                table: "HostelAssignments",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_HostelAssignments_OrganizationId",
                schema: "dbo",
                table: "HostelAssignments",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_HostelAssignments_RoomId",
                schema: "dbo",
                table: "HostelAssignments",
                column: "RoomId");

            migrationBuilder.CreateIndex(
                name: "IX_HostelAssignments_StudentId",
                schema: "dbo",
                table: "HostelAssignments",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_HostelRooms_HostelId",
                schema: "dbo",
                table: "HostelRooms",
                column: "HostelId");

            migrationBuilder.CreateIndex(
                name: "IX_HostelRooms_OrganizationId",
                schema: "dbo",
                table: "HostelRooms",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_Hostels_OrganizationId",
                schema: "dbo",
                table: "Hostels",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryCategories_OrganizationId",
                schema: "dbo",
                table: "InventoryCategories",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryItems_CategoryId",
                schema: "dbo",
                table: "InventoryItems",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryItems_OrganizationId",
                schema: "dbo",
                table: "InventoryItems",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_InventorySuppliers_OrganizationId",
                schema: "dbo",
                table: "InventorySuppliers",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryTransactions_ItemId",
                schema: "dbo",
                table: "InventoryTransactions",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryTransactions_OrganizationId",
                schema: "dbo",
                table: "InventoryTransactions",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_TransportAssignments_EmployeeId",
                schema: "dbo",
                table: "TransportAssignments",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_TransportAssignments_OrganizationId",
                schema: "dbo",
                table: "TransportAssignments",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_TransportAssignments_RouteId",
                schema: "dbo",
                table: "TransportAssignments",
                column: "RouteId");

            migrationBuilder.CreateIndex(
                name: "IX_TransportAssignments_StudentId",
                schema: "dbo",
                table: "TransportAssignments",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_TransportRoutes_OrganizationId",
                schema: "dbo",
                table: "TransportRoutes",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_TransportRoutes_VehicleId",
                schema: "dbo",
                table: "TransportRoutes",
                column: "VehicleId");

            migrationBuilder.CreateIndex(
                name: "IX_TransportVehicles_OrganizationId",
                schema: "dbo",
                table: "TransportVehicles",
                column: "OrganizationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HostelAssignments",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "InventorySuppliers",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "InventoryTransactions",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "TransportAssignments",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "HostelRooms",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "InventoryItems",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "TransportRoutes",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "Hostels",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "InventoryCategories",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "TransportVehicles",
                schema: "dbo");

            migrationBuilder.DropColumn(
                name: "Address",
                schema: "dbo",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "AdmissionNoPrefix",
                schema: "dbo",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "AffiliationNo",
                schema: "dbo",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "AlternatePhone",
                schema: "dbo",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "BoardAffiliation",
                schema: "dbo",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "City",
                schema: "dbo",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "Country",
                schema: "dbo",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "CurrencyCode",
                schema: "dbo",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "CurrencySymbol",
                schema: "dbo",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "DateFormat",
                schema: "dbo",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "Email",
                schema: "dbo",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "EmployeeIdPrefix",
                schema: "dbo",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "EstablishedYear",
                schema: "dbo",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "LogoBase64",
                schema: "dbo",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "Phone",
                schema: "dbo",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "PinCode",
                schema: "dbo",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "ReceiptPrefix",
                schema: "dbo",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "SchoolType",
                schema: "dbo",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "State",
                schema: "dbo",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "StudentIdFormat",
                schema: "dbo",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "Tagline",
                schema: "dbo",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "TimeZone",
                schema: "dbo",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "Website",
                schema: "dbo",
                table: "Organizations");
        }
    }
}
