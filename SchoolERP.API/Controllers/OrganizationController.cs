using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.DTOs;
using SchoolERP.Application.Interfaces;
using SchoolERP.Infrastructure.Persistence;

namespace SchoolERP.API.Controllers;

[Authorize]
[ApiController]
[Route("api/organization")]
public class OrganizationController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly IOrganizationService _organizationService;

    public OrganizationController(ApplicationDbContext db, IOrganizationService organizationService)
    {
        _db = db;
        _organizationService = organizationService;
    }

    [HttpGet("settings")]
    public async Task<ActionResult<OrganizationSettingsDto>> GetSettings()
    {
        var orgId = _organizationService.GetOrganizationId();
        if (orgId == Guid.Empty) return Unauthorized();

        // Organizations table is global (not tenant-filtered)
        var org = await _db.Organizations.FirstOrDefaultAsync(o => o.Id == orgId);
        if (org == null) return NotFound(new { message = "Organization not found." });

        return Ok(new OrganizationSettingsDto
        {
            Id = org.Id,
            Name = org.Name,
            Tagline = org.Tagline,
            EstablishedYear = org.EstablishedYear,
            SchoolType = org.SchoolType,
            BoardAffiliation = org.BoardAffiliation,
            AffiliationNo = org.AffiliationNo,
            LogoBase64 = org.LogoBase64,
            Phone = org.Phone,
            AlternatePhone = org.AlternatePhone,
            Email = org.Email,
            Website = org.Website,
            Address = org.Address,
            City = org.City,
            State = org.State,
            Country = org.Country,
            PinCode = org.PinCode,
            AdmissionNoPrefix = org.AdmissionNoPrefix,
            StudentIdFormat = org.StudentIdFormat,
            ReceiptPrefix = org.ReceiptPrefix,
            EmployeeIdPrefix = org.EmployeeIdPrefix,
            CurrencySymbol = org.CurrencySymbol,
            CurrencyCode = org.CurrencyCode,
            DateFormat = org.DateFormat,
            TimeZone = org.TimeZone,
        });
    }

    [HttpPost("settings/update")]
    public async Task<IActionResult> UpdateSettings([FromBody] UpdateOrganizationSettingsDto dto)
    {
        var orgId = _organizationService.GetOrganizationId();
        if (orgId == Guid.Empty) return Unauthorized();

        var org = await _db.Organizations.FirstOrDefaultAsync(o => o.Id == orgId);
        if (org == null) return NotFound(new { message = "Organization not found." });

        // Update fields
        org.Name = dto.Name;
        org.Tagline = dto.Tagline;
        org.EstablishedYear = dto.EstablishedYear;
        org.SchoolType = dto.SchoolType;
        org.BoardAffiliation = dto.BoardAffiliation;
        org.AffiliationNo = dto.AffiliationNo;
        if (!string.IsNullOrEmpty(dto.LogoBase64))
            org.LogoBase64 = dto.LogoBase64;
        org.Phone = dto.Phone;
        org.AlternatePhone = dto.AlternatePhone;
        org.Email = dto.Email;
        org.Website = dto.Website;
        org.Address = dto.Address;
        org.City = dto.City;
        org.State = dto.State;
        org.Country = dto.Country;
        org.PinCode = dto.PinCode;
        org.AdmissionNoPrefix = dto.AdmissionNoPrefix;
        org.StudentIdFormat = dto.StudentIdFormat;
        org.ReceiptPrefix = dto.ReceiptPrefix;
        org.EmployeeIdPrefix = dto.EmployeeIdPrefix;
        org.CurrencySymbol = dto.CurrencySymbol;
        org.CurrencyCode = dto.CurrencyCode;
        org.DateFormat = dto.DateFormat;
        org.TimeZone = dto.TimeZone;
        org.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(new { message = "Organization settings saved successfully." });
    }
}
