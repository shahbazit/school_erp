namespace SchoolERP.Application.DTOs.Hostel;

public class HostelDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? WardenName { get; set; }
    public string? WardenPhone { get; set; }
    public string? Address { get; set; }
    public bool IsActive { get; set; }
    public int RoomCount { get; set; }
    public int TotalCapacity { get; set; }
    public int CurrentOccupancy { get; set; }
}

public class CreateHostelDto
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? WardenName { get; set; }
    public string? WardenPhone { get; set; }
    public string? Address { get; set; }
}

public class HostelRoomDto
{
    public Guid Id { get; set; }
    public Guid HostelId { get; set; }
    public string? HostelName { get; set; }
    public string RoomNo { get; set; } = string.Empty;
    public string? RoomType { get; set; }
    public int Capacity { get; set; }
    public decimal CostPerMonth { get; set; }
    public bool IsActive { get; set; }
    public int CurrentOccupancy { get; set; }
}

public class CreateHostelRoomDto
{
    public Guid HostelId { get; set; }
    public string RoomNo { get; set; } = string.Empty;
    public string? RoomType { get; set; }
    public int Capacity { get; set; }
    public decimal CostPerMonth { get; set; }
}

public class HostelAssignmentDto
{
    public Guid Id { get; set; }
    public Guid StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public Guid? EmployeeId { get; set; }
    public string? EmployeeName { get; set; }
    public Guid RoomId { get; set; }
    public string RoomNo { get; set; } = string.Empty;
    public string HostelName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsActive { get; set; }
}

public class CreateHostelAssignmentDto
{
    public Guid StudentId { get; set; }
    public Guid? EmployeeId { get; set; }
    public Guid RoomId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}
