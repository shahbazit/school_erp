namespace SchoolERP.Application.DTOs;

public class OrganizationSettingsDto
{
    public Guid Id { get; set; }

    // Basic Info
    public string Name { get; set; } = string.Empty;
    public string? Tagline { get; set; }
    public int? EstablishedYear { get; set; }
    public string? SchoolType { get; set; }
    public string? BoardAffiliation { get; set; }
    public string? AffiliationNo { get; set; }
    public string? LogoBase64 { get; set; }

    // Contact
    public string? Phone { get; set; }
    public string? AlternatePhone { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }

    // Address
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? PinCode { get; set; }

    // Format Settings
    public string? AdmissionNoPrefix { get; set; }
    public string? StudentIdFormat { get; set; }
    public string? ReceiptPrefix { get; set; }
    public string? EmployeeIdPrefix { get; set; }

    // Localization
    public string? CurrencySymbol { get; set; }
    public string? CurrencyCode { get; set; }
    public string? DateFormat { get; set; }
    public string? TimeZone { get; set; }
}

public class UpdateOrganizationSettingsDto
{
    public string Name { get; set; } = string.Empty;
    public string? Tagline { get; set; }
    public int? EstablishedYear { get; set; }
    public string? SchoolType { get; set; }
    public string? BoardAffiliation { get; set; }
    public string? AffiliationNo { get; set; }
    public string? LogoBase64 { get; set; }
    public string? Phone { get; set; }
    public string? AlternatePhone { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? PinCode { get; set; }
    public string? AdmissionNoPrefix { get; set; }
    public string? StudentIdFormat { get; set; }
    public string? ReceiptPrefix { get; set; }
    public string? EmployeeIdPrefix { get; set; }
    public string? CurrencySymbol { get; set; }
    public string? CurrencyCode { get; set; }
    public string? DateFormat { get; set; }
    public string? TimeZone { get; set; }
}
