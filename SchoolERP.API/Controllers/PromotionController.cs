using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.DTOs.Promotion;
using SchoolERP.Application.Interfaces;
using SchoolERP.Domain.Entities;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace SchoolERP.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class PromotionController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public PromotionController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    /// <summary>
    /// Bulk promotes or detains students to a target class, section, and academic year.
    /// </summary>
    [HttpPost("bulk")]
    public async Task<IActionResult> BulkPromote([FromBody] BulkPromotionRequestDto request)
    {
        if (request == null || request.Students == null || !request.Students.Any())
            return BadRequest("No students provided for promotion.");

        if (string.IsNullOrWhiteSpace(request.TargetAcademicYear))
            return BadRequest("Target academic year is required.");

        try 
        {
            int updatedCount = 0;
            foreach (var studentRequest in request.Students)
            {
                var student = await _unitOfWork.Repository<Student>().GetByIdAsync(studentRequest.StudentId);
                if (student == null) continue;

                // Promotion Logic
                if (studentRequest.IsPromoted)
                {
                    // Move to new class/section
                    student.ClassId = request.TargetClassId;
                    student.SectionId = request.TargetSectionId;
                }
                // If not promoted (detained), they stay in current ClassId/SectionId 
                // but their AcademicYear still updates to the new session.

                student.AcademicYear = request.TargetAcademicYear;
                
                if (!string.IsNullOrEmpty(studentRequest.NewRollNumber))
                {
                    student.RollNumber = studentRequest.NewRollNumber;
                }

                _unitOfWork.Repository<Student>().Update(student);
                updatedCount++;
            }

            if (updatedCount > 0)
            {
                await _unitOfWork.CompleteAsync();
            }

            return Ok(new { 
                success = true, 
                message = $"Successfully processed {updatedCount} students for the {request.TargetAcademicYear} session.",
                count = updatedCount
            });
        }
        catch (Exception ex)
        {
            // In a real world-class app, we'd log this exception properly.
            return StatusCode(500, new { success = false, message = "An error occurred during bulk promotion.", detail = ex.Message });
        }
    }
}
