using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class TransportVehicle : BaseEntity
{
    public string VehicleNo { get; set; } = string.Empty;
    public string VehicleModel { get; set; } = string.Empty;
    public string? FuelType { get; set; }
    public int Capacity { get; set; }
    public string? RegistrationDetails { get; set; }
    public string? ChasisNo { get; set; }
    public string? DriverName { get; set; }
    public string? DriverPhone { get; set; }
    public bool IsActive { get; set; } = true;
}
