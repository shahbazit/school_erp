using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

/// <summary>
/// Print &amp; branding configuration for each certificate type, per organisation.
/// Unique per (OrganizationId, TemplateId). Logo always comes from Organisation Settings.
/// </summary>
public class CertificateFormat : BaseEntity
{
    /// <summary>e.g. ID_CARD_V | ID_CARD_H | BONAFIDE | CHARACTER | LEAVING</summary>
    public string TemplateId { get; set; } = string.Empty;

    // ── Print Layout ─────────────────────────────────────────────────────────
    /// <summary>Paper size: A4 (default) | A5 | IDENTITY</summary>
    public string PaperSize { get; set; } = "A4";

    /// <summary>Copies / cards per sheet: 1 | 2 | 4</summary>
    public int PerPage { get; set; } = 1;

    // ── Branding ──────────────────────────────────────────────────────────────
    public string PrimaryColor { get; set; } = "#4f46e5";

    // Logo always comes from Organization Settings — these just control appearance
    public bool    ShowLogo     { get; set; } = true;
    public bool    ShowAddress  { get; set; } = true;
    public bool    ShowSeal     { get; set; } = true;
    /// <summary>Scale multiplier for the org logo: 0.5 – 2.0</summary>
    public decimal LogoScale    { get; set; } = 1.0m;

    // ── Text Customization ────────────────────────────────────────────────────
    public string? HeaderText  { get; set; }
    public string? BodyText    { get; set; }
    public string? FooterLeft  { get; set; }
    public string? FooterRight { get; set; }
}
