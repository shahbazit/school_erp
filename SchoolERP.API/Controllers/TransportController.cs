using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.DTOs.Transport;
using SchoolERP.Application.Interfaces;

namespace SchoolERP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransportController : ControllerBase
{
    private readonly ITransportService _transportService;

    public TransportController(ITransportService transportService)
    {
        _transportService = transportService;
    }

    [HttpGet("vehicles")]
    public async Task<IActionResult> GetVehicles() => Ok(await _transportService.GetAllVehiclesAsync());

    [HttpPost("vehicles")]
    public async Task<IActionResult> CreateVehicle(CreateTransportVehicleDto dto) => Ok(await _transportService.CreateVehicleAsync(dto));

    [HttpPut("vehicles/{id}")]
    public async Task<IActionResult> UpdateVehicle(Guid id, CreateTransportVehicleDto dto) => Ok(await _transportService.UpdateVehicleAsync(id, dto));

    [HttpDelete("vehicles/{id}")]
    public async Task<IActionResult> DeleteVehicle(Guid id) => Ok(await _transportService.DeleteVehicleAsync(id));

    [HttpGet("routes")]
    public async Task<IActionResult> GetRoutes() => Ok(await _transportService.GetAllRoutesAsync());

    [HttpPost("routes")]
    public async Task<IActionResult> CreateRoute(CreateTransportRouteDto dto) => Ok(await _transportService.CreateRouteAsync(dto));

    [HttpPut("routes/{id}")]
    public async Task<IActionResult> UpdateRoute(Guid id, CreateTransportRouteDto dto) => Ok(await _transportService.UpdateRouteAsync(id, dto));

    [HttpDelete("routes/{id}")]
    public async Task<IActionResult> DeleteRoute(Guid id) => Ok(await _transportService.DeleteRouteAsync(id));

    [HttpGet("assignments")]
    public async Task<IActionResult> GetAssignments() => Ok(await _transportService.GetAllAssignmentsAsync());

    [HttpPost("assignments")]
    public async Task<IActionResult> AssignTransport(CreateTransportAssignmentDto dto) => Ok(await _transportService.AssignTransportAsync(dto));

    [HttpDelete("assignments/{id}")]
    public async Task<IActionResult> RemoveAssignment(Guid id) => Ok(await _transportService.RemoveAssignmentAsync(id));
}
