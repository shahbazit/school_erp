using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.DTOs.Fees;
using SchoolERP.Application.Interfaces;
using SchoolERP.Domain.Entities;

namespace SchoolERP.API.Controllers;

[Authorize]
[ApiController]
[Route("api/masters/fee")]
public class FeeController : ControllerBase
{
    private readonly IFeeService _feeService;

    public FeeController(IFeeService feeService)
    {
        _feeService = feeService;
    }

    [HttpGet("heads")]
    public async Task<IActionResult> GetFeeHeads()
    {
        return Ok(await _feeService.GetFeeHeadsAsync());
    }

    [HttpPost("heads")]
    public async Task<IActionResult> CreateFeeHead(CreateFeeHeadRequest request)
    {
        return Ok(await _feeService.CreateFeeHeadAsync(request));
    }

    [HttpPost("heads/{id}/update")]
    public async Task<IActionResult> UpdateFeeHead(Guid id, CreateFeeHeadRequest request)
    {
        await _feeService.UpdateFeeHeadAsync(id, request);
        return Ok();
    }

    [HttpPost("heads/{id}/delete")]
    public async Task<IActionResult> DeleteFeeHead(Guid id)
    {
        await _feeService.DeleteFeeHeadAsync(id);
        return Ok();
    }

    [HttpGet("structures")]
    public async Task<IActionResult> GetFeeStructures()
    {
        return Ok(await _feeService.GetFeeStructuresAsync());
    }

    [HttpPost("structures")]
    public async Task<IActionResult> CreateFeeStructure(CreateFeeStructureRequest request)
    {
        return Ok(await _feeService.CreateFeeStructureAsync(request));
    }

    [HttpPost("structures/{id}/update")]
    public async Task<IActionResult> UpdateFeeStructure(Guid id, CreateFeeStructureRequest request)
    {
        await _feeService.UpdateFeeStructureAsync(id, request);
        return Ok();
    }

    [HttpPost("structures/{id}/delete")]
    public async Task<IActionResult> DeleteFeeStructure(Guid id)
    {
        await _feeService.DeleteFeeStructureAsync(id);
        return Ok();
    }

    [HttpPost("structures/copy")]
    public async Task<IActionResult> CopyStructures(CopyFeeStructureRequest request)
    {
        await _feeService.CopyFeeStructureAsync(request);
        return Ok();
    }

    [HttpGet("student-account/{studentId}")]
    public async Task<IActionResult> GetStudentFeeAccount(Guid studentId)
    {
        try
        {
            return Ok(await _feeService.GetStudentFeeAccountAsync(studentId));
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("process-payment")]
    public async Task<IActionResult> ProcessPayment(ProcessPaymentRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = string.Join(", ", ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage));
            Console.WriteLine($"ProcessPayment Model Invalid: {errors}");
            return BadRequest($"Validation failed: {errors}");
        }

        try
        {
            Console.WriteLine($"Processing Fee Payment: Student={request.StudentId}, Year={request.AcademicYearId}, Amount={request.Amount}");
            await _feeService.ProcessPaymentAsync(request);
            return Ok();
        }
        catch (Exception ex)
        {
            var inner = ex;
            while (inner.InnerException != null) inner = inner.InnerException;
            Console.WriteLine($"ProcessPayment Failed: {inner.Message}");
            return BadRequest($"Database error: {inner.Message}");
        }
    }
    [HttpPost("add-extra-charge")]
    public async Task<IActionResult> AddExtraCharge(AddExtraChargeRequest request)
    {
        await _feeService.AddExtraChargeAsync(request);
        return Ok();
    }

    [HttpPost("generate-charges")]
    public async Task<IActionResult> GenerateMonthlyCharges(GenerateChargesRequest request)
    {
        await _feeService.GenerateMonthlyChargesAsync(request.ClassIds, request.Month, request.FeeHeadIds, request.AcademicYearId);
        return Ok();
    }
    
    [HttpPost("undo-generation")]
    public async Task<IActionResult> UndoMonthlyCharges(GenerateChargesRequest request)
    {
        await _feeService.UndoMonthlyChargesAsync(request.ClassIds, request.Month, request.AcademicYearId);
        return Ok();
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetFeeHistory([FromQuery] Guid? classId = null, [FromQuery] Guid? academicYearId = null)
    {
        return Ok(await _feeService.GetFeeHistoryAsync(classId, academicYearId));
    }

    [HttpGet("student-subscriptions/{studentId}")]
    public async Task<IActionResult> GetStudentSubscriptions(Guid studentId)
    {
        return Ok(await _feeService.GetStudentSubscriptionsAsync(studentId));
    }

    [HttpPost("student-subscriptions")]
    public async Task<IActionResult> CreateSubscription(CreateStudentFeeSubscriptionRequest request)
    {
        return Ok(await _feeService.CreateSubscriptionAsync(request));
    }

    [HttpPost("student-subscriptions/{id}/update")]
    public async Task<IActionResult> UpdateSubscription(Guid id, CreateStudentFeeSubscriptionRequest request)
    {
        await _feeService.UpdateSubscriptionAsync(id, request);
        return Ok();
    }

    [HttpPost("student-subscriptions/{id}/delete")]
    public async Task<IActionResult> DeleteSubscription(Guid id)
    {
        await _feeService.DeleteSubscriptionAsync(id);
        return Ok();
    }

    [HttpGet("discounts")]
    public async Task<IActionResult> GetDiscounts()
    {
        return Ok(await _feeService.GetDiscountsAsync());
    }

    [HttpPost("discounts")]
    public async Task<IActionResult> UpdateDiscount([FromBody] FeeDiscount discount)
    {
        await _feeService.UpdateDiscountAsync(discount);
        return Ok();
    }

    [HttpPost("discounts/assign")]
    public async Task<IActionResult> AssignDiscount([FromBody] AssignDiscountRequest request)
    {
        var assignment = new FeeDiscountAssignment
        {
            StudentId = request.StudentId,
            FeeDiscountId = request.FeeDiscountId,
            AcademicYearId = request.AcademicYearId,
            RestrictedFeeHeadId = request.RestrictedFeeHeadId,
            Remarks = request.Remarks
        };
        await _feeService.AssignDiscountAsync(assignment);
        return Ok();
    }

    [HttpGet("student-discounts/{studentId}")]
    public async Task<IActionResult> GetStudentDiscounts(Guid studentId)
    {
        return Ok(await _feeService.GetStudentDiscountsAsync(studentId));
    }

    [HttpGet("config")]
    public async Task<IActionResult> GetConfig()
    {
        return Ok(await _feeService.GetFeeConfigurationAsync());
    }

    [HttpPost("config")]
    public async Task<IActionResult> UpdateConfig([FromBody] FeeConfiguration config)
    {
        await _feeService.UpdateFeeConfigurationAsync(config);
        return Ok();
    }
}
