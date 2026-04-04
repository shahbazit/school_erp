using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.DTOs.Hostel;
using SchoolERP.Application.Interfaces;

namespace SchoolERP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HostelController : ControllerBase
{
    private readonly IHostelService _hostelService;

    public HostelController(IHostelService hostelService)
    {
        _hostelService = hostelService;
    }

    [HttpGet]
    public async Task<IActionResult> GetHostels() => Ok(await _hostelService.GetAllHostelsAsync());

    [HttpPost]
    public async Task<IActionResult> CreateHostel(CreateHostelDto dto) => Ok(await _hostelService.CreateHostelAsync(dto));

    [HttpPost("{id}/update")]
    public async Task<IActionResult> UpdateHostel(Guid id, CreateHostelDto dto) => Ok(await _hostelService.UpdateHostelAsync(id, dto));

    [HttpPost("{id}/delete")]
    public async Task<IActionResult> DeleteHostel(Guid id) => Ok(await _hostelService.DeleteHostelAsync(id));

    [HttpGet("rooms")]
    public async Task<IActionResult> GetRooms() => Ok(await _hostelService.GetAllRoomsAsync());

    [HttpGet("rooms/by-hostel/{hostelId}")]
    public async Task<IActionResult> GetRoomsByHostel(Guid hostelId) => Ok(await _hostelService.GetRoomsByHostelIdAsync(hostelId));

    [HttpPost("rooms")]
    public async Task<IActionResult> CreateRoom(CreateHostelRoomDto dto) => Ok(await _hostelService.CreateRoomAsync(dto));

    [HttpPost("rooms/{id}/update")]
    public async Task<IActionResult> UpdateRoom(Guid id, CreateHostelRoomDto dto) => Ok(await _hostelService.UpdateRoomAsync(id, dto));

    [HttpPost("rooms/{id}/delete")]
    public async Task<IActionResult> DeleteRoom(Guid id) => Ok(await _hostelService.DeleteRoomAsync(id));

    [HttpGet("assignments")]
    public async Task<IActionResult> GetAssignments() => Ok(await _hostelService.GetAllAssignmentsAsync());

    [HttpPost("assignments")]
    public async Task<IActionResult> AssignRoom(CreateHostelAssignmentDto dto) => Ok(await _hostelService.AssignRoomAsync(dto));

    [HttpPost("assignments/{id}/delete")]
    public async Task<IActionResult> RemoveAssignment(Guid id) => Ok(await _hostelService.RemoveAssignmentAsync(id));
}
