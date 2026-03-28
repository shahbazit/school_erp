using System;

namespace SchoolERP.Application.DTOs.CRM;

public class VisitorLogDto
{
    public Guid Id { get; set; }
    public string VisitorName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Purpose { get; set; } = string.Empty;
    public string? WhomToMeet { get; set; }
    public DateTime CheckInTime { get; set; }
    public DateTime? CheckOutTime { get; set; }
    public string? IdProof { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateVisitorLogDto
{
    public string VisitorName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Purpose { get; set; } = string.Empty;
    public string? WhomToMeet { get; set; }
    public string? IdProof { get; set; }
    public string? Notes { get; set; }
}

public class UpdateVisitorLogDto
{
    public DateTime? CheckOutTime { get; set; }
    public string? Notes { get; set; }
}
