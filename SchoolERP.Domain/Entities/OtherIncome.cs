using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class OtherIncome : BaseEntity
{
    public string Category { get; set; } = string.Empty; // Donation, Canteen, Bookshop, Event, etc.
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public string? ReferenceNumber { get; set; }
    public string? PaymentMethod { get; set; } // Cash, Bank, UPI
    public Guid? AcademicYearId { get; set; } // Financial/Academic Year link
}
