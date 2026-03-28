using SchoolERP.Application.DTOs.Hostel;

namespace SchoolERP.Application.Interfaces;

public interface IHostelService
{
    // Hostels
    Task<IEnumerable<HostelDto>> GetAllHostelsAsync();
    Task<HostelDto> GetHostelByIdAsync(Guid id);
    Task<HostelDto> CreateHostelAsync(CreateHostelDto dto);
    Task<HostelDto> UpdateHostelAsync(Guid id, CreateHostelDto dto);
    Task<bool> DeleteHostelAsync(Guid id);

    // Rooms
    Task<IEnumerable<HostelRoomDto>> GetAllRoomsAsync();
    Task<IEnumerable<HostelRoomDto>> GetRoomsByHostelIdAsync(Guid hostelId);
    Task<HostelRoomDto> CreateRoomAsync(CreateHostelRoomDto dto);
    Task<HostelRoomDto> UpdateRoomAsync(Guid id, CreateHostelRoomDto dto);
    Task<bool> DeleteRoomAsync(Guid id);

    // Assignments
    Task<IEnumerable<HostelAssignmentDto>> GetAllAssignmentsAsync();
    Task<HostelAssignmentDto> AssignRoomAsync(CreateHostelAssignmentDto dto);
    Task<bool> RemoveAssignmentAsync(Guid id);
}
