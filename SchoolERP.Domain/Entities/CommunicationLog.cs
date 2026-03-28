using SchoolERP.Domain.Common;
using System;

namespace SchoolERP.Domain.Entities;

public enum CommunicationChannel
{
    SMS,
    Email,
    PushNotification
}

public class CommunicationLog : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public CommunicationChannel Channel { get; set; }
    public string? RecipientType { get; set; } // Students, Parents, Employees, All
    public int RecipientsCount { get; set; }
    public string Status { get; set; } = "Sent"; // Sent, Failed, Partial
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
}
