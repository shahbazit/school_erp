using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class Room : BaseEntity
{
    public string RoomNo { get; set; } = string.Empty; // Room 101, Hall A
    public string? Type { get; set; } // Classroom, Hall
    public int Capacity { get; set; }
    public bool IsActive { get; set; } = true;
}
