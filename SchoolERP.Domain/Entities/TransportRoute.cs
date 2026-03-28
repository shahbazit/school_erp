using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class TransportRoute : BaseEntity
{
    public string RouteName { get; set; } = string.Empty;
    public Guid? VehicleId { get; set; }
    public string? DriverName { get; set; }
    public decimal RouteCost { get; set; }
    public bool IsActive { get; set; } = true;

    public virtual TransportVehicle? Vehicle { get; set; }
}
