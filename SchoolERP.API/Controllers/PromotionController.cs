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

        try 
        {
            int updatedCount = 0;
            var targetYear = !string.IsNullOrEmpty(request.TargetAcademicYear) 
                ? await _unitOfWork.Repository<AcademicYear>().GetQueryable()
                    .FirstOrDefaultAsync(y => y.Name == request.TargetAcademicYear)
                : null;

            foreach (var studentRequest in request.Students)
            {
                var student = await _unitOfWork.Repository<Student>().GetByIdAsync(studentRequest.StudentId);
                if (student == null) continue;

                // 1. Mark current record as Processed
                var currentAcademic = await _unitOfWork.Repository<StudentAcademic>().GetQueryable()
                    .FirstOrDefaultAsync(sa => sa.StudentId == student.Id && sa.IsCurrent);

                if (currentAcademic != null)
                {
                    currentAcademic.IsCurrent = false;
                    // Map "Promote" -> "Promoted", "Detain" -> "Detained" for consistency with entity comments
                    currentAcademic.Status = studentRequest.Action == "Promote" ? "Promoted" : (studentRequest.Action == "Detain" ? "Detained" : studentRequest.Action);
                    _unitOfWork.Repository<StudentAcademic>().Update(currentAcademic);
                }

                // 2. Insert new Academic Mapping OR Update Student Status
                if (studentRequest.Action == "Promote" || studentRequest.Action == "Detain")
                {
                    if (string.IsNullOrEmpty(request.TargetAcademicYear)) continue;

                    // Check if a record already exists for this student and target year (Duplicate Check & Session Update)
                    var existingTarget = await _unitOfWork.Repository<StudentAcademic>().GetQueryable()
                        .FirstOrDefaultAsync(sa => sa.StudentId == student.Id && sa.AcademicYear == request.TargetAcademicYear);

                    if (existingTarget != null)
                    {
                        // RETURN ERROR: Student is already promoted or has a record in the target session
                        var msg = $"Student '{student.FirstName} {student.LastName}' ({student.AdmissionNo}) already has an active record in '{request.TargetAcademicYear}'. Promotion aborted to prevent duplicates.";
                        return BadRequest(new { success = false, message = msg });
                    }
                    else 
                    {
                        var finalClassId = (studentRequest.Action == "Promote" ? request.TargetClassId : (currentAcademic?.ClassId ?? request.TargetClassId));
                        if (!finalClassId.HasValue) continue;

                        var newAcademic = new StudentAcademic
                        {
                            StudentId = student.Id,
                            OrganizationId = student.OrganizationId,
                            ClassId = finalClassId.Value,
                            // SAME SECTION UPDATE: Use current section if new one is not selected
                            SectionId = request.TargetSectionId ?? currentAcademic?.SectionId,
                            AcademicYear = request.TargetAcademicYear,
                            RollNumber = studentRequest.NewRollNumber,
                            IsCurrent = true,
                            Status = "Active"
                        };
                        await _unitOfWork.Repository<StudentAcademic>().AddAsync(newAcademic);
                    }
                }
                else if (studentRequest.Action == "PassOut" || studentRequest.Action == "Withdraw")
                {
                    // For graduation or withdrawal, mark the student as Inactive
                    student.IsActive = false;
                    _unitOfWork.Repository<Student>().Update(student);
                }

                // 3. Balance Carry Forward Logic (Only if Target Year is provided and student had a previous session)
                if ((studentRequest.Action == "Promote" || studentRequest.Action == "Detain") && targetYear != null)
                {
                    var account = await _unitOfWork.Repository<StudentFeeAccount>().GetQueryable()
                        .FirstOrDefaultAsync(a => a.StudentId == student.Id);

                    if (account != null && account.CurrentBalance > 0)
                    {
                        decimal arrearsAmount = account.CurrentBalance;
                        
                        // Add a Charge in the new academic session for the arrears
                        var arrearsTx = new FeeTransaction
                        {
                            StudentId = student.Id,
                            OrganizationId = student.OrganizationId,
                            Type = "Charge",
                            Amount = arrearsAmount,
                            TransactionDate = DateTime.UtcNow,
                            Description = $"Previous Session Dues (Arrears) from {currentAcademic?.AcademicYear ?? "Previous Year"}",
                            AcademicYearId = targetYear.Id
                        };
                        
                        await _unitOfWork.Repository<FeeTransaction>().AddAsync(arrearsTx);
                        
                        // IMPORTANT: To avoid double counting in the grand total (account.TotalAllocated)
                        // we add an offsetting adjustment in the OLD year
                        if (currentAcademic != null) {
                            var oldYear = await _unitOfWork.Repository<AcademicYear>().GetQueryable()
                                .FirstOrDefaultAsync(y => y.Name == currentAcademic.AcademicYear);
                            
                            if (oldYear != null) {
                                 var offsetTx = new FeeTransaction {
                                     StudentId = student.Id,
                                     OrganizationId = student.OrganizationId,
                                     Type = "Discount", 
                                     Amount = arrearsAmount,
                                     TransactionDate = DateTime.UtcNow,
                                     Description = $"Balance Transferred to {request.TargetAcademicYear}",
                                     AcademicYearId = oldYear.Id
                                 };
                                 await _unitOfWork.Repository<FeeTransaction>().AddAsync(offsetTx);
                                 account.TotalDiscount += arrearsAmount;
                            }
                        }
                        
                        account.TotalAllocated += arrearsAmount;
                        _unitOfWork.Repository<StudentFeeAccount>().Update(account);
                    }
                }

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
            return StatusCode(500, new { success = false, message = "An error occurred during bulk promotion.", detail = ex.Message });
        }
    }
}
