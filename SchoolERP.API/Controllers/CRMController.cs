using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.DTOs.CRM;
using SchoolERP.Application.Interfaces;
using SchoolERP.Domain.Entities;

namespace SchoolERP.API.Controllers;

[Route("api/crm/enquiries")]
public class AdmissionEnquiriesController : BaseMasterController<AdmissionEnquiry, AdmissionEnquiryDto, CreateAdmissionEnquiryDto, UpdateAdmissionEnquiryDto>
{
    public AdmissionEnquiriesController(IUnitOfWork unitOfWork) : base(unitOfWork) { }

    [HttpGet]
    public override async Task<ActionResult<IEnumerable<AdmissionEnquiryDto>>> GetAll()
    {
        var data = await _unitOfWork.Repository<AdmissionEnquiry>().GetQueryable()
            .Include(e => e.Class)
            .OrderByDescending(e => e.CreatedAt)
            .Select(e => new AdmissionEnquiryDto
            {
                Id = e.Id,
                StudentName = e.StudentName,
                ParentName = e.ParentName,
                Mobile = e.Mobile,
                Email = e.Email,
                ClassId = e.ClassId,
                ClassName = e.Class != null ? e.Class.Name : null,
                Gender = e.Gender,
                Source = e.Source,
                Status = e.Status,
                NextFollowUpDate = e.NextFollowUpDate,
                Notes = e.Notes,
                CreatedAt = e.CreatedAt
            })
            .ToListAsync();
        return Ok(data);
    }

    protected override AdmissionEnquiryDto MapToDto(AdmissionEnquiry e) => new() 
    { 
        Id = e.Id, 
        StudentName = e.StudentName, 
        ParentName = e.ParentName,
        Mobile = e.Mobile,
        Email = e.Email,
        ClassId = e.ClassId,
        Gender = e.Gender,
        Source = e.Source,
        Status = e.Status,
        NextFollowUpDate = e.NextFollowUpDate,
        Notes = e.Notes,
        CreatedAt = e.CreatedAt
    };

    protected override AdmissionEnquiry MapToEntity(CreateAdmissionEnquiryDto d) => new() 
    { 
        StudentName = d.StudentName, 
        ParentName = d.ParentName,
        Mobile = d.Mobile,
        Email = d.Email,
        ClassId = d.ClassId,
        Gender = d.Gender,
        Source = d.Source,
        Status = d.Status,
        NextFollowUpDate = d.NextFollowUpDate,
        Notes = d.Notes
    };

    protected override void MapToEntity(UpdateAdmissionEnquiryDto d, AdmissionEnquiry e) 
    { 
        e.StudentName = d.StudentName; 
        e.ParentName = d.ParentName;
        e.Mobile = d.Mobile;
        e.Email = d.Email;
        e.ClassId = d.ClassId;
        e.Gender = d.Gender;
        e.Source = d.Source;
        e.Status = d.Status;
        e.NextFollowUpDate = d.NextFollowUpDate;
        e.Notes = d.Notes;
    }
}

[Route("api/crm/visitors")]
public class VisitorLogsController : BaseMasterController<VisitorLog, VisitorLogDto, CreateVisitorLogDto, UpdateVisitorLogDto>
{
    public VisitorLogsController(IUnitOfWork unitOfWork) : base(unitOfWork) { }

    [HttpPost("{id}/checkout")]
    public async Task<IActionResult> CheckOut(Guid id)
    {
        var log = await _unitOfWork.Repository<VisitorLog>().GetByIdAsync(id);
        if (log == null) return NotFound();
        log.CheckOutTime = DateTime.UtcNow;
        _unitOfWork.Repository<VisitorLog>().Update(log);
        await _unitOfWork.CompleteAsync();
        return Ok();
    }

    protected override VisitorLogDto MapToDto(VisitorLog e) => new() 
    { 
        Id = e.Id, 
        VisitorName = e.VisitorName, 
        Phone = e.Phone, 
        Purpose = e.Purpose, 
        WhomToMeet = e.WhomToMeet, 
        CheckInTime = e.CheckInTime, 
        CheckOutTime = e.CheckOutTime, 
        IdProof = e.IdProof, 
        Notes = e.Notes,
        CreatedAt = e.CreatedAt
    };

    protected override VisitorLog MapToEntity(CreateVisitorLogDto d) => new() 
    { 
        VisitorName = d.VisitorName, 
        Phone = d.Phone, 
        Purpose = d.Purpose, 
        WhomToMeet = d.WhomToMeet, 
        IdProof = d.IdProof, 
        Notes = d.Notes 
    };

    protected override void MapToEntity(UpdateVisitorLogDto d, VisitorLog e) 
    { 
        e.CheckOutTime = d.CheckOutTime; 
        e.Notes = d.Notes; 
    }
}

[Route("api/crm/communications")]
public class CommunicationsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    public CommunicationsController(IUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CommunicationLogDto>>> GetAll()
    {
        var data = await _unitOfWork.Repository<CommunicationLog>().GetQueryable()
            .OrderByDescending(e => e.CreatedAt)
            .Select(e => new CommunicationLogDto
            {
                Id = e.Id,
                Title = e.Title,
                Message = e.Message,
                Channel = e.Channel,
                RecipientType = e.RecipientType,
                RecipientsCount = e.RecipientsCount,
                Status = e.Status,
                SentAt = e.SentAt
            })
            .ToListAsync();
        return Ok(data);
    }

    [HttpPost]
    public async Task<ActionResult<CommunicationLogDto>> Send(CreateCommunicationLogDto d)
    {
        // Mock sending - in real app would trigger background job
        var log = new CommunicationLog
        {
            Title = d.Title,
            Message = d.Message,
            Channel = d.Channel,
            RecipientType = d.RecipientType,
            RecipientsCount = 0, // In real app, calculate based on RecipientType
            Status = "Sent"
        };
        await _unitOfWork.Repository<CommunicationLog>().AddAsync(log);
        await _unitOfWork.CompleteAsync();
        
        return Ok(new CommunicationLogDto
        {
            Id = log.Id,
            Title = log.Title,
            Message = log.Message,
            Channel = log.Channel,
            RecipientType = log.RecipientType,
            RecipientsCount = log.RecipientsCount,
            Status = log.Status,
            SentAt = log.SentAt
        });
    }
}
