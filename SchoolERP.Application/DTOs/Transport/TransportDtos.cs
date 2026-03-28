namespace SchoolERP.Application.DTOs.Transport;

public class TransportVehicleDto
{
    public Guid Id { get; set; }
    public string VehicleNo { get; set; } = string.Empty;
    public string VehicleModel { get; set; } = string.Empty;
    public string? FuelType { get; set; }
    public int Capacity { get; set; }
    public string? RegistrationDetails { get; set; }
    public string? ChasisNo { get; set; }
    public string? DriverName { get; set; }
    public string? DriverPhone { get; set; }
    public bool IsActive { get; set; }
}

public class CreateTransportVehicleDto
{
    public string VehicleNo { get; set; } = string.Empty;
    public string VehicleModel { get; set; } = string.Empty;
    public string? FuelType { get; set; }
    public int Capacity { get; set; }
    public string? RegistrationDetails { get; set; }
    public string? ChasisNo { get; set; }
    public string? DriverName { get; set; }
    public string? DriverPhone { get; set; }
}

public class TransportRouteDto
{
    public Guid Id { get; set; }
    public string RouteName { get; set; } = string.Empty;
    public Guid? VehicleId { get; set; }
    public string? VehicleNo { get; set; }
    public string? DriverName { get; set; }
    public decimal RouteCost { get; set; }
    public bool IsActive { get; set; }
    public int UserCount { get; set; }
}

public class CreateTransportRouteDto
{
    public string RouteName { get; set; } = string.Empty;
    public Guid? VehicleId { get; set; }
    public string? DriverName { get; set; }
    public decimal RouteCost { get; set; }
}

public class TransportAssignmentDto
{
    public Guid Id { get; set; }
    public Guid StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public Guid? EmployeeId { get; set; }
    public string? EmployeeName { get; set; }
    public Guid RouteId { get; set; }
    public string RouteName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsActive { get; set; }
}

public class CreateTransportAssignmentDto
{
    public Guid StudentId { get; set; }
    public Guid? EmployeeId { get; set; }
    public Guid RouteId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

public class TransportStoppageDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Cost { get; set; }
    public bool IsActive { get; set; }
}

public class CreateTransportStoppageDto
{
    public string Name { get; set; } = string.Empty;
    public decimal Cost { get; set; }
}

