namespace SchoolERP.Domain.Entities;

public class Organization
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Domain { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;

    // Branding & Identity
    public string? LogoBase64 { get; set; }
    public string? Tagline { get; set; }
    public int? EstablishedYear { get; set; }
    public string? SchoolType { get; set; } // e.g. "Co-Ed", "Boys", "Girls"
    public string? BoardAffiliation { get; set; } // e.g. "CBSE", "ICSE", "State Board"
    public string? AffiliationNo { get; set; }

    // Contact Information
    public string? Phone { get; set; }
    public string? AlternatePhone { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }

    // Address
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; } = "India";
    public string? PinCode { get; set; }

    // Academic Format Settings
    public string? AdmissionNoPrefix { get; set; } = "ADM";
    public string? StudentIdFormat { get; set; } = "YYYY-NN";
    public string? ReceiptPrefix { get; set; } = "RCP";
    public string? EmployeeIdPrefix { get; set; } = "EMP";

    // Localization
    public string? CurrencySymbol { get; set; } = "₹";
    public string? CurrencyCode { get; set; } = "INR";
    public string? DateFormat { get; set; } = "DD/MM/YYYY";
    public string? TimeZone { get; set; } = "Asia/Kolkata";
}
