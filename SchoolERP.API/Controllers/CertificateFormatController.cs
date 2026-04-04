using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.Interfaces;
using SchoolERP.Domain.Entities;

namespace SchoolERP.API.Controllers;

[Authorize]
[ApiController]
[Route("api/certificate-formats")]
public class CertificateFormatController : ControllerBase
{
    private readonly IUnitOfWork _uow;

    public CertificateFormatController(IUnitOfWork uow)
    {
        _uow = uow;
    }

    // GET api/certificate-formats
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CertificateFormatDto>>> GetAll()
    {
        var list = await _uow.Repository<CertificateFormat>().GetAllAsync();
        return Ok(list.Select(Map));
    }

    // GET api/certificate-formats/{templateId}
    [HttpGet("{templateId}")]
    public async Task<ActionResult<CertificateFormatDto>> Get(string templateId)
    {
        var all = await _uow.Repository<CertificateFormat>().GetAllAsync();
        var fmt = all.FirstOrDefault(f => f.TemplateId == templateId);
        if (fmt == null) return NotFound();
        return Ok(Map(fmt));
    }

    // POST api/certificate-formats/save  — upsert by templateId
    [HttpPost("save")]
    public async Task<ActionResult<CertificateFormatDto>> Save([FromBody] SaveCertificateFormatDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.TemplateId))
            return BadRequest(new { message = "TemplateId is required." });

        var all = await _uow.Repository<CertificateFormat>().GetAllAsync();
        var existing = all.FirstOrDefault(f => f.TemplateId == dto.TemplateId);

        if (existing == null)
        {
            existing = new CertificateFormat();
            Apply(dto, existing);
            await _uow.Repository<CertificateFormat>().AddAsync(existing);
        }
        else
        {
            Apply(dto, existing);
            _uow.Repository<CertificateFormat>().Update(existing);
        }

        await _uow.CompleteAsync();
        return Ok(Map(existing));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static void Apply(SaveCertificateFormatDto dto, CertificateFormat e)
    {
        e.TemplateId   = dto.TemplateId;
        e.PaperSize    = dto.PaperSize is "A4" or "A5" or "IDENTITY" ? dto.PaperSize : "A4";
        e.PerPage      = dto.PerPage is 1 or 2 or 4 ? dto.PerPage : 1;
        e.PrimaryColor = dto.PrimaryColor ?? "#4f46e5";
        e.ShowLogo     = dto.ShowLogo;
        e.ShowAddress  = dto.ShowAddress;
        e.ShowSeal     = dto.ShowSeal;
        e.LogoScale    = (decimal)Math.Clamp(dto.LogoScale, 0.5, 2.0);
        e.HeaderText   = dto.HeaderText;
        e.BodyText     = dto.BodyText;
        e.FooterLeft   = dto.FooterLeft;
        e.FooterRight  = dto.FooterRight;
    }

    private static CertificateFormatDto Map(CertificateFormat e) => new()
    {
        Id           = e.Id,
        TemplateId   = e.TemplateId,
        PaperSize    = e.PaperSize,
        PerPage      = e.PerPage,
        PrimaryColor = e.PrimaryColor,
        ShowLogo     = e.ShowLogo,
        ShowAddress  = e.ShowAddress,
        ShowSeal     = e.ShowSeal,
        LogoScale    = (double)e.LogoScale,
        HeaderText   = e.HeaderText,
        BodyText     = e.BodyText,
        FooterLeft   = e.FooterLeft,
        FooterRight  = e.FooterRight,
        UpdatedAt    = e.UpdatedAt ?? e.CreatedAt,
    };
}

// ── DTOs ──────────────────────────────────────────────────────────────────────

public class CertificateFormatDto
{
    public Guid      Id           { get; set; }
    public string    TemplateId   { get; set; } = string.Empty;
    public string    PaperSize    { get; set; } = "A4";
    public int       PerPage      { get; set; } = 1;
    public string    PrimaryColor { get; set; } = "#4f46e5";
    public bool      ShowLogo     { get; set; } = true;
    public bool      ShowAddress  { get; set; } = true;
    public bool      ShowSeal     { get; set; } = true;
    public double    LogoScale    { get; set; } = 1.0;
    public string?   HeaderText   { get; set; }
    public string?   BodyText     { get; set; }
    public string?   FooterLeft   { get; set; }
    public string?   FooterRight  { get; set; }
    public DateTime? UpdatedAt    { get; set; }
}

public class SaveCertificateFormatDto
{
    public string  TemplateId   { get; set; } = string.Empty;
    public string  PaperSize    { get; set; } = "A4";
    public int     PerPage      { get; set; } = 1;
    public string  PrimaryColor { get; set; } = "#4f46e5";
    public bool    ShowLogo     { get; set; } = true;
    public bool    ShowAddress  { get; set; } = true;
    public bool    ShowSeal     { get; set; } = true;
    public double  LogoScale    { get; set; } = 1.0;
    public string? HeaderText   { get; set; }
    public string? BodyText     { get; set; }
    public string? FooterLeft   { get; set; }
    public string? FooterRight  { get; set; }
}
