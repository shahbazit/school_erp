using SchoolERP.Domain.Common;
using System;

namespace SchoolERP.Domain.Entities;

public class VisitorLog : BaseEntity
{
    public string VisitorName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Purpose { get; set; } = string.Empty;
    public string? WhomToMeet { get; set; }
    public DateTime CheckInTime { get; set; } = DateTime.UtcNow;
    public DateTime? CheckOutTime { get; set; }
    public string? IdProof { get; set; }
    public string? Notes { get; set; }
}
