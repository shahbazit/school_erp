using System;

namespace SchoolERP.Domain.Entities;

public class PendingRegistration
{
    public int Id { get; set; }
    public Guid UID { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? Mobile { get; set; }

    // Step 2 Fields (School/Institute)
    public string? SchoolName { get; set; }
    public string? City { get; set; }
    public string? Address { get; set; }

    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // OTP stored in DB (survives API restarts)
    public string? OtpCode { get; set; }
    public DateTime? OtpExpiry { get; set; }
}
