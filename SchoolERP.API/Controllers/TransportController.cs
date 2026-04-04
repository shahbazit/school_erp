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

    [HttpPost("vehicles/{id}/update")]
    public async Task<IActionResult> UpdateVehicle(Guid id, CreateTransportVehicleDto dto) => Ok(await _transportService.UpdateVehicleAsync(id, dto));

    [HttpPost("vehicles/{id}/delete")]
    public async Task<IActionResult> DeleteVehicle(Guid id) => Ok(await _transportService.DeleteVehicleAsync(id));

    [HttpGet("routes")]
    public async Task<IActionResult> GetRoutes() => Ok(await _transportService.GetAllRoutesAsync());

    [HttpPost("routes")]
    public async Task<IActionResult> CreateRoute(CreateTransportRouteDto dto) => Ok(await _transportService.CreateRouteAsync(dto));

    [HttpPost("routes/{id}/update")]
    public async Task<IActionResult> UpdateRoute(Guid id, CreateTransportRouteDto dto) => Ok(await _transportService.UpdateRouteAsync(id, dto));

    [HttpPost("routes/{id}/delete")]
    public async Task<IActionResult> DeleteRoute(Guid id) => Ok(await _transportService.DeleteRouteAsync(id));

    [HttpGet("assignments")]
    public async Task<IActionResult> GetAssignments() => Ok(await _transportService.GetAllAssignmentsAsync());

    [HttpPost("assignments")]
    public async Task<IActionResult> AssignTransport(CreateTransportAssignmentDto dto) => Ok(await _transportService.AssignTransportAsync(dto));

    [HttpPost("assignments/{id}/delete")]
    public async Task<IActionResult> RemoveAssignment(Guid id) => Ok(await _transportService.RemoveAssignmentAsync(id));

    // Stoppages
    [HttpGet("stoppages")]
    public async Task<IActionResult> GetStoppages() => Ok(await _transportService.GetAllStoppagesAsync());

    [HttpPost("stoppages")]
    public async Task<IActionResult> CreateStoppage(CreateTransportStoppageDto dto) => Ok(await _transportService.CreateStoppageAsync(dto));

    [HttpPost("stoppages/{id}/update")]
    public async Task<IActionResult> UpdateStoppage(Guid id, CreateTransportStoppageDto dto) => Ok(await _transportService.UpdateStoppageAsync(id, dto));

    [HttpPost("stoppages/{id}/delete")]
    public async Task<IActionResult> DeleteStoppage(Guid id) => Ok(await _transportService.DeleteStoppageAsync(id));
}

