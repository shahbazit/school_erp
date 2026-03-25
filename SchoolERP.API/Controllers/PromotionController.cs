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
            var targetYear = await _unitOfWork.Repository<AcademicYear>().GetQueryable()
                .FirstOrDefaultAsync(y => y.Name == request.TargetAcademicYear);

            if (targetYear == null) return BadRequest($"Academic Year '{request.TargetAcademicYear}' not found.");

            foreach (var studentRequest in request.Students)
            {
                var student = await _unitOfWork.Repository<Student>().GetByIdAsync(studentRequest.StudentId);
                if (student == null) continue;

                // 1. Mark current record as Promoted/Completed
                var currentAcademic = await _unitOfWork.Repository<StudentAcademic>().GetQueryable()
                    .FirstOrDefaultAsync(sa => sa.StudentId == student.Id && sa.IsCurrent);

                if (currentAcademic != null)
                {
                    currentAcademic.IsCurrent = false;
                    currentAcademic.Status = studentRequest.IsPromoted ? "Promoted" : "Detained";
                    _unitOfWork.Repository<StudentAcademic>().Update(currentAcademic);
                }

                // 2. Insert new Academic Mapping for the new session
                var newAcademic = new StudentAcademic
                {
                    StudentId = student.Id,
                    ClassId = studentRequest.IsPromoted ? request.TargetClassId : (currentAcademic?.ClassId ?? request.TargetClassId),
                    SectionId = request.TargetSectionId,
                    AcademicYear = request.TargetAcademicYear,
                    RollNumber = studentRequest.NewRollNumber,
                    IsCurrent = true,
                    Status = "Active"
                };

                await _unitOfWork.Repository<StudentAcademic>().AddAsync(newAcademic);

                // 3. Balance Carry Forward Logic
                var account = await _unitOfWork.Repository<StudentFeeAccount>().GetQueryable()
                    .FirstOrDefaultAsync(a => a.StudentId == student.Id);

                if (account != null && account.CurrentBalance > 0)
                {
                    decimal arrearsAmount = account.CurrentBalance;
                    
                    // Add a Charge in the new academic session for the arrears
                    var arrearsTx = new FeeTransaction
                    {
                        StudentId = student.Id,
                        Type = "Charge",
                        Amount = arrearsAmount,
                        TransactionDate = DateTime.UtcNow,
                        Description = $"Previous Session Dues (Arrears) from {currentAcademic?.AcademicYear ?? "Previous Year"}",
                        AcademicYearId = targetYear.Id
                    };
                    
                    await _unitOfWork.Repository<FeeTransaction>().AddAsync(arrearsTx);
                    
                    // IMPORTANT: To avoid double counting in the grand total (account.TotalAllocated)
                    // we add an offsetting adjustment in the OLD year (as a "Transferred out")
                    // If currentAcademic exists and had an ID... 
                    // Wait, we need the OLD AcademicYear ID.
                    
                    var oldYear = await _unitOfWork.Repository<AcademicYear>().GetQueryable()
                        .FirstOrDefaultAsync(y => y.Name == currentAcademic!.AcademicYear);
                    
                    if (oldYear != null) {
                         var offsetTx = new FeeTransaction {
                             StudentId = student.Id,
                             Type = "Discount", // Using 'Discount' or 'Payment' as a placeholder for technical credit to old year
                             Amount = arrearsAmount,
                             TransactionDate = DateTime.UtcNow,
                             Description = $"Balance Transferred to {request.TargetAcademicYear}",
                             AcademicYearId = oldYear.Id
                         };
                         await _unitOfWork.Repository<FeeTransaction>().AddAsync(offsetTx);
                         account.TotalDiscount += arrearsAmount;
                    }
                    
                    account.TotalAllocated += arrearsAmount;
                    _unitOfWork.Repository<StudentFeeAccount>().Update(account);
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
            // In a real world-class app, we'd log this exception properly.
            return StatusCode(500, new { success = false, message = "An error occurred during bulk promotion.", detail = ex.Message });
        }
    }
}
