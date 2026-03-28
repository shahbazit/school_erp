using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.DTOs.Hostel;
using SchoolERP.Application.Interfaces;
using SchoolERP.Domain.Entities;
using SchoolERP.Infrastructure.Persistence;

namespace SchoolERP.Infrastructure.Services;

public class HostelService : IHostelService
{
    private readonly ApplicationDbContext _context;

    public HostelService(ApplicationDbContext context)
    {
        _context = context;
    }

    // Hostels
    public async Task<IEnumerable<HostelDto>> GetAllHostelsAsync()
    {
        return await _context.Hostels
            .Include(h => h.Rooms)
            .Select(h => new HostelDto
            {
                Id = h.Id,
                Name = h.Name,
                Type = h.Type,
                WardenName = h.WardenName,
                WardenPhone = h.WardenPhone,
                Address = h.Address,
                IsActive = h.IsActive,
                RoomCount = h.Rooms.Count,
                TotalCapacity = h.Rooms.Sum(r => r.Capacity),
                CurrentOccupancy = _context.HostelAssignments.Count(a => a.Room.HostelId == h.Id && a.IsActive)
            }).ToListAsync();
    }

    public async Task<HostelDto> GetHostelByIdAsync(Guid id)
    {
        var h = await _context.Hostels
            .Include(x => x.Rooms)
            .FirstOrDefaultAsync(x => x.Id == id);
            
        if (h == null) return null!;

        return new HostelDto
        {
            Id = h.Id,
            Name = h.Name,
            Type = h.Type,
            WardenName = h.WardenName,
            WardenPhone = h.WardenPhone,
            Address = h.Address,
            IsActive = h.IsActive,
            RoomCount = h.Rooms.Count,
            TotalCapacity = h.Rooms.Sum(r => r.Capacity),
            CurrentOccupancy = _context.HostelAssignments.Count(a => a.Room.HostelId == h.Id && a.IsActive)
        };
    }

    public async Task<HostelDto> CreateHostelAsync(CreateHostelDto dto)
    {
        var hostel = new Hostel
        {
            Name = dto.Name,
            Type = dto.Type,
            WardenName = dto.WardenName,
            WardenPhone = dto.WardenPhone,
            Address = dto.Address
        };

        _context.Hostels.Add(hostel);
        await _context.SaveChangesAsync();

        return await GetHostelByIdAsync(hostel.Id);
    }

    public async Task<HostelDto> UpdateHostelAsync(Guid id, CreateHostelDto dto)
    {
        var hostel = await _context.Hostels.FindAsync(id);
        if (hostel == null) return null!;

        hostel.Name = dto.Name;
        hostel.Type = dto.Type;
        hostel.WardenName = dto.WardenName;
        hostel.WardenPhone = dto.WardenPhone;
        hostel.Address = dto.Address;

        await _context.SaveChangesAsync();
        return await GetHostelByIdAsync(id);
    }

    public async Task<bool> DeleteHostelAsync(Guid id)
    {
        var hostel = await _context.Hostels.FindAsync(id);
        if (hostel == null) return false;

        _context.Hostels.Remove(hostel);
        await _context.SaveChangesAsync();
        return true;
    }

    // Rooms
    public async Task<IEnumerable<HostelRoomDto>> GetAllRoomsAsync()
    {
        return await _context.HostelRooms
            .Include(r => r.Hostel)
            .Select(r => new HostelRoomDto
            {
                Id = r.Id,
                HostelId = r.HostelId,
                HostelName = r.Hostel.Name,
                RoomNo = r.RoomNo,
                RoomType = r.RoomType,
                Capacity = r.Capacity,
                CostPerMonth = r.CostPerMonth,
                IsActive = r.IsActive,
                CurrentOccupancy = _context.HostelAssignments.Count(a => a.RoomId == r.Id && a.IsActive)
            }).ToListAsync();
    }

    public async Task<IEnumerable<HostelRoomDto>> GetRoomsByHostelIdAsync(Guid hostelId)
    {
        return await _context.HostelRooms
            .Where(r => r.HostelId == hostelId)
            .Include(r => r.Hostel)
            .Select(r => new HostelRoomDto
            {
                Id = r.Id,
                HostelId = r.HostelId,
                HostelName = r.Hostel.Name,
                RoomNo = r.RoomNo,
                RoomType = r.RoomType,
                Capacity = r.Capacity,
                CostPerMonth = r.CostPerMonth,
                IsActive = r.IsActive,
                CurrentOccupancy = _context.HostelAssignments.Count(a => a.RoomId == r.Id && a.IsActive)
            }).ToListAsync();
    }

    public async Task<HostelRoomDto> CreateRoomAsync(CreateHostelRoomDto dto)
    {
        var room = new HostelRoom
        {
            HostelId = dto.HostelId,
            RoomNo = dto.RoomNo,
            RoomType = dto.RoomType,
            Capacity = dto.Capacity,
            CostPerMonth = dto.CostPerMonth
        };

        _context.HostelRooms.Add(room);
        await _context.SaveChangesAsync();

        return (await GetAllRoomsAsync()).First(x => x.Id == room.Id);
    }

    public async Task<HostelRoomDto> UpdateRoomAsync(Guid id, CreateHostelRoomDto dto)
    {
        var room = await _context.HostelRooms.FindAsync(id);
        if (room == null) return null!;

        room.HostelId = dto.HostelId;
        room.RoomNo = dto.RoomNo;
        room.RoomType = dto.RoomType;
        room.Capacity = dto.Capacity;
        room.CostPerMonth = dto.CostPerMonth;

        await _context.SaveChangesAsync();
        return (await GetAllRoomsAsync()).First(x => x.Id == room.Id);
    }

    public async Task<bool> DeleteRoomAsync(Guid id)
    {
        var room = await _context.HostelRooms.FindAsync(id);
        if (room == null) return false;

        _context.HostelRooms.Remove(room);
        await _context.SaveChangesAsync();
        return true;
    }

    // Assignments
    public async Task<IEnumerable<HostelAssignmentDto>> GetAllAssignmentsAsync()
    {
        return await _context.HostelAssignments
            .Include(a => a.Student)
            .Include(a => a.Employee)
            .Include(a => a.Room)
            .ThenInclude(r => r.Hostel)
            .Select(a => new HostelAssignmentDto
            {
                Id = a.Id,
                StudentId = a.StudentId,
                StudentName = a.Student.FirstName + " " + a.Student.LastName,
                EmployeeId = a.EmployeeId,
                EmployeeName = a.Employee != null ? a.Employee.FirstName + " " + a.Employee.LastName : null,
                RoomId = a.RoomId,
                RoomNo = a.Room.RoomNo,
                HostelName = a.Room.Hostel.Name,
                StartDate = a.StartDate,
                EndDate = a.EndDate,
                IsActive = a.IsActive
            }).ToListAsync();
    }

    public async Task<HostelAssignmentDto> AssignRoomAsync(CreateHostelAssignmentDto dto)
    {
        // Check capacity
        var room = await _context.HostelRooms.FindAsync(dto.RoomId);
        if (room == null) throw new Exception("Room not found");
        
        var currentOccupancy = await _context.HostelAssignments.CountAsync(a => a.RoomId == dto.RoomId && a.IsActive);
        if (currentOccupancy >= room.Capacity) throw new Exception("Room is full");

        // Deactivate existing assignment for this student
        var existing = await _context.HostelAssignments
            .Where(a => a.StudentId == dto.StudentId && a.IsActive)
            .ToListAsync();
            
        foreach (var a in existing) a.IsActive = false;

        var assignment = new HostelAssignment
        {
            StudentId = dto.StudentId,
            EmployeeId = dto.EmployeeId,
            RoomId = dto.RoomId,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            IsActive = true
        };

        _context.HostelAssignments.Add(assignment);
        await _context.SaveChangesAsync();

        return (await GetAllAssignmentsAsync()).First(x => x.Id == assignment.Id);
    }

    public async Task<bool> RemoveAssignmentAsync(Guid id)
    {
        var assignment = await _context.HostelAssignments.FindAsync(id);
        if (assignment == null) return false;

        assignment.IsActive = false;
        assignment.EndDate = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }
}
