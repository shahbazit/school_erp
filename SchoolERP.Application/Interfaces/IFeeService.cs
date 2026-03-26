using SchoolERP.Application.DTOs.Fees;
using SchoolERP.Domain.Entities;

namespace SchoolERP.Application.Interfaces;

public interface IFeeService
{
    // Fee Head Management
    Task<IEnumerable<FeeHeadDto>> GetFeeHeadsAsync();
    Task<FeeHeadDto> CreateFeeHeadAsync(CreateFeeHeadRequest request);
    Task UpdateFeeHeadAsync(Guid id, CreateFeeHeadRequest request);
    Task DeleteFeeHeadAsync(Guid id);

    // Fee Structure Management
    Task<IEnumerable<FeeStructureDto>> GetFeeStructuresAsync();
    Task<FeeStructureDto> CreateFeeStructureAsync(CreateFeeStructureRequest request);
    Task UpdateFeeStructureAsync(Guid id, CreateFeeStructureRequest request);
    Task DeleteFeeStructureAsync(Guid id);
    Task CopyFeeStructureAsync(CopyFeeStructureRequest request);

    // Student Fee Operations
    Task<StudentFeeAccountDto> GetStudentFeeAccountAsync(Guid studentId);
    Task ProcessPaymentAsync(ProcessPaymentRequest request);

    // Student Fee Subscriptions (Elective Fees)
    Task<IEnumerable<StudentFeeSubscriptionDto>> GetStudentSubscriptionsAsync(Guid studentId);
    Task<StudentFeeSubscriptionDto> CreateSubscriptionAsync(CreateStudentFeeSubscriptionRequest request);
    Task UpdateSubscriptionAsync(Guid id, CreateStudentFeeSubscriptionRequest request);
    Task DeleteSubscriptionAsync(Guid id);
    
    // Admin / Utility
    Task GenerateMonthlyChargesAsync(IEnumerable<Guid> classIds, string month, IEnumerable<Guid>? feeHeadIds = null, Guid? academicYearId = null);
    Task UndoMonthlyChargesAsync(IEnumerable<Guid> classIds, string month, Guid? academicYearId = null);
    Task<IEnumerable<ClassFeeHistoryDto>> GetFeeHistoryAsync(Guid? classId = null, Guid? academicYearId = null);
    
    // Discounts
    Task<IEnumerable<FeeDiscount>> GetDiscountsAsync();
    Task UpdateDiscountAsync(FeeDiscount discount);
    Task AssignDiscountAsync(FeeDiscountAssignment assignment);
    Task<IEnumerable<FeeDiscountAssignment>> GetStudentDiscountsAsync(Guid studentId);
    
    // Late Fees / Policy
    Task<FeeConfiguration?> GetFeeConfigurationAsync();
    Task UpdateFeeConfigurationAsync(FeeConfiguration config);
    Task ApplyLateFeesAsync(int month, int year); // Batch process late fees
}
