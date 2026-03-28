using SchoolERP.Application.DTOs.Transport;

namespace SchoolERP.Application.Interfaces;

public interface ITransportService
{
    // Vehicles
    Task<IEnumerable<TransportVehicleDto>> GetAllVehiclesAsync();
    Task<TransportVehicleDto> GetVehicleByIdAsync(Guid id);
    Task<TransportVehicleDto> CreateVehicleAsync(CreateTransportVehicleDto dto);
    Task<TransportVehicleDto> UpdateVehicleAsync(Guid id, CreateTransportVehicleDto dto);
    Task<bool> DeleteVehicleAsync(Guid id);

    // Routes
    Task<IEnumerable<TransportRouteDto>> GetAllRoutesAsync();
    Task<TransportRouteDto> GetRouteByIdAsync(Guid id);
    Task<TransportRouteDto> CreateRouteAsync(CreateTransportRouteDto dto);
    Task<TransportRouteDto> UpdateRouteAsync(Guid id, CreateTransportRouteDto dto);
    Task<bool> DeleteRouteAsync(Guid id);

    // Assignments
    Task<IEnumerable<TransportAssignmentDto>> GetAllAssignmentsAsync();
    Task<TransportAssignmentDto> AssignTransportAsync(CreateTransportAssignmentDto dto);
    Task<bool> RemoveAssignmentAsync(Guid id);

    // Stoppages
    Task<IEnumerable<TransportStoppageDto>> GetAllStoppagesAsync();
    Task<TransportStoppageDto> GetStoppageByIdAsync(Guid id);
    Task<TransportStoppageDto> CreateStoppageAsync(CreateTransportStoppageDto dto);
    Task<TransportStoppageDto> UpdateStoppageAsync(Guid id, CreateTransportStoppageDto dto);
    Task<bool> DeleteStoppageAsync(Guid id);
}

