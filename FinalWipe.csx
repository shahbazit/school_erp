using System;
using Microsoft.Data.SqlClient;

var connStr = "Server=(localdb)\\mssqllocaldb;Database=SchoolERPDev;Trusted_Connection=True;";
using var conn = new SqlConnection(connStr);
conn.Open();

// Wipe all permissions and internal menu data to sync fresh
Console.WriteLine("Wiping ALL Menu data AGAIN to be absolutely sure... Konstantin");

using (var cmd = new SqlCommand("DELETE FROM MenuPermissions", conn)) cmd.ExecuteNonQuery();
using (var cmd = new SqlCommand("DELETE FROM OrganizationMenus", conn)) cmd.ExecuteNonQuery();
using (var cmd = new SqlCommand("DELETE FROM MenuMasters", conn)) cmd.ExecuteNonQuery();

Console.WriteLine("Database wiped successfully. Konstantin");
