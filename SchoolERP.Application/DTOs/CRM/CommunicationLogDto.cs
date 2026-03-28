using SchoolERP.Domain.Entities;
using System;

namespace SchoolERP.Application.DTOs.CRM;

public class CommunicationLogDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public CommunicationChannel Channel { get; set; }
    public string? RecipientType { get; set; }
    public int RecipientsCount { get; set; }
    public string Status { get; set; } = "Sent";
    public DateTime SentAt { get; set; }
}

public class CreateCommunicationLogDto
{
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public CommunicationChannel Channel { get; set; }
    public string? RecipientType { get; set; }
}
