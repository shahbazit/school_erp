using SchoolERP.Application.DTOs.Fees;
using SchoolERP.Application.Interfaces;
using SchoolERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace SchoolERP.Infrastructure.Services;

public class FeeService : IFeeService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IOrganizationService _organizationService;

    public FeeService(IUnitOfWork unitOfWork, IOrganizationService organizationService)
    {
        _unitOfWork = unitOfWork;
        _organizationService = organizationService;
    }

    // Fee Head Management
    public async Task<IEnumerable<FeeHeadDto>> GetFeeHeadsAsync()
    {
        var heads = await _unitOfWork.Repository<FeeHead>().GetAllAsync();
        return heads.Select(h => new FeeHeadDto
        {
            Id = h.Id,
            Name = h.Name,
            Description = h.Description,
            IsActive = h.IsActive,
            IsSelective = h.IsSelective
        });
    }

    public async Task<FeeHeadDto> CreateFeeHeadAsync(CreateFeeHeadRequest request)
    {
        var head = new FeeHead
        {
            Name = request.Name,
            Description = request.Description,
            IsSelective = request.IsSelective
        };
        await _unitOfWork.Repository<FeeHead>().AddAsync(head);
        await _unitOfWork.CompleteAsync();
        return new FeeHeadDto { Id = head.Id, Name = head.Name, Description = head.Description, IsActive = head.IsActive, IsSelective = head.IsSelective };
    }

    public async Task UpdateFeeHeadAsync(Guid id, CreateFeeHeadRequest request)
    {
        var head = await _unitOfWork.Repository<FeeHead>().GetByIdAsync(id);
        if (head != null)
        {
            head.Name = request.Name;
            head.Description = request.Description;
            head.IsSelective = request.IsSelective;
            _unitOfWork.Repository<FeeHead>().Update(head);
            await _unitOfWork.CompleteAsync();
        }
    }

    public async Task DeleteFeeHeadAsync(Guid id)
    {
        var head = await _unitOfWork.Repository<FeeHead>().GetByIdAsync(id);
        if (head != null)
        {
            _unitOfWork.Repository<FeeHead>().Delete(head);
            await _unitOfWork.CompleteAsync();
        }
    }

    public async Task UpdateDiscountAsync(FeeDiscount discount)
    {
        var repo = _unitOfWork.Repository<FeeDiscount>();
        var orgId = _organizationService.GetOrganizationId();
        
        if (discount.Id == Guid.Empty)
        {
            if (discount.OrganizationId == Guid.Empty) discount.OrganizationId = orgId;
            await repo.AddAsync(discount);
        }
        else
        {
            var existing = await repo.GetQueryable().FirstOrDefaultAsync(x => x.Id == discount.Id);
            if (existing == null)
            {
                if (discount.OrganizationId == Guid.Empty) discount.OrganizationId = orgId;
                await repo.AddAsync(discount);
            }
            else
            {
                existing.Name = discount.Name;
                existing.Description = discount.Description;
                existing.Category = discount.Category;
                existing.CalculationType = discount.CalculationType;
                existing.Value = discount.Value;
                existing.Frequency = discount.Frequency;
                existing.IsActive = discount.IsActive;
                repo.Update(existing);
            }
        }
        await _unitOfWork.CompleteAsync();
    }

    // Fee Structure Management
    public async Task<IEnumerable<FeeStructureDto>> GetFeeStructuresAsync()
    {
        return await _unitOfWork.Repository<FeeStructure>().GetQueryable()
            .Include(f => f.FeeHead)
            .Include(f => f.Class)
            .Include(f => f.AcademicYear)
            .Select(f => new FeeStructureDto
            {
                Id = f.Id,
                FeeHeadId = f.FeeHeadId,
                FeeHeadName = f.FeeHead.Name,
                ClassId = f.ClassId,
                ClassName = f.Class.Name,
                AcademicYearId = f.AcademicYearId,
                AcademicYearName = f.AcademicYear.Name,
                Amount = f.Amount,
                Frequency = f.Frequency,
                ApplicableMonth = f.ApplicableMonth,
                Description = f.Description
            }).ToListAsync();
    }

    public async Task<FeeStructureDto> CreateFeeStructureAsync(CreateFeeStructureRequest request)
    {
        var classIds = new List<Guid>();
        if (request.ClassIds != null && request.ClassIds.Any())
        {
            classIds.AddRange(request.ClassIds);
        }
        else if (request.ClassId.HasValue)
        {
            classIds.Add(request.ClassId.Value);
        }

        if (!classIds.Any()) throw new Exception("At least one Class must be selected.");

        FeeStructure lastStructure = null!;
        foreach (var classId in classIds)
        {
            var structure = new FeeStructure
            {
                FeeHeadId = request.FeeHeadId,
                ClassId = classId,
                AcademicYearId = request.AcademicYearId,
                Amount = request.Amount,
                Frequency = request.Frequency,
                ApplicableMonth = (request.Frequency == "Yearly" || request.Frequency == "One-time" || request.Frequency == "One-Time") ? request.ApplicableMonth : null,
                Description = request.Description
            };
            await _unitOfWork.Repository<FeeStructure>().AddAsync(structure);
            lastStructure = structure;
        }

        await _unitOfWork.CompleteAsync();
        
        // Return the last one or re-fetch (GetFeeStructuresAsync uses includes)
        return (await GetFeeStructuresAsync()).First(x => x.Id == lastStructure.Id);
    }

    public async Task UpdateFeeStructureAsync(Guid id, CreateFeeStructureRequest request)
    {
        var structure = await _unitOfWork.Repository<FeeStructure>().GetByIdAsync(id);
        if (structure != null)
        {
            structure.FeeHeadId = request.FeeHeadId;
            structure.ClassId = request.ClassId ?? Guid.Empty; // Fixed Guid? conversion
            structure.AcademicYearId = request.AcademicYearId;
            structure.Amount = request.Amount;
            structure.Frequency = request.Frequency;
            structure.ApplicableMonth = (request.Frequency == "Yearly" || request.Frequency == "One-time" || request.Frequency == "One-Time") ? request.ApplicableMonth : null;
            structure.Description = request.Description;
            _unitOfWork.Repository<FeeStructure>().Update(structure);
            await _unitOfWork.CompleteAsync();
        }
    }

    public async Task DeleteFeeStructureAsync(Guid id)
    {
        var structure = await _unitOfWork.Repository<FeeStructure>().GetByIdAsync(id);
        if (structure != null)
        {
            _unitOfWork.Repository<FeeStructure>().Delete(structure);
            await _unitOfWork.CompleteAsync();
        }
    }

    public async Task CopyFeeStructureAsync(CopyFeeStructureRequest request)
    {
        var sourceStructures = await _unitOfWork.Repository<FeeStructure>().GetQueryable()
            .Where(f => f.AcademicYearId == request.FromYearId)
            .ToListAsync();

        if (sourceStructures.Any())
        {
            var targetExisting = await _unitOfWork.Repository<FeeStructure>().GetQueryable()
                .Where(f => f.AcademicYearId == request.ToYearId)
                .ToListAsync();

            foreach (var target in targetExisting)
                _unitOfWork.Repository<FeeStructure>().Delete(target);

            foreach (var source in sourceStructures)
            {
                await _unitOfWork.Repository<FeeStructure>().AddAsync(new FeeStructure
                {
                    AcademicYearId = request.ToYearId,
                    FeeHeadId = source.FeeHeadId,
                    ClassId = source.ClassId,
                    Amount = source.Amount,
                    Frequency = source.Frequency,
                    Description = source.Description
                });
            }
            await _unitOfWork.CompleteAsync();
        }
    }

    // Student Fee Operations
    public async Task<StudentFeeAccountDto> GetStudentFeeAccountAsync(Guid studentId)
    {
        var account = await _unitOfWork.Repository<StudentFeeAccount>().GetQueryable()
            .Include(a => a.Student)
            .FirstOrDefaultAsync(a => a.StudentId == studentId);

        if (account == null)
        {
            var student = await _unitOfWork.Repository<Student>().GetByIdAsync(studentId);
            if (student == null) throw new Exception("Student not found");

            account = new StudentFeeAccount
            {
                StudentId = studentId,
                OrganizationId = _organizationService.GetOrganizationId(),
                TotalAllocated = 0,
                TotalPaid = 0,
                TotalDiscount = 0,
                LastTransactionDate = DateTime.UtcNow
            };
            await _unitOfWork.Repository<StudentFeeAccount>().AddAsync(account);
            await _unitOfWork.CompleteAsync();
        }

        var transactions = await _unitOfWork.Repository<FeeTransaction>().GetQueryable()
            .Where(t => t.StudentId == studentId)
            .OrderByDescending(t => t.TransactionDate)
            .Select(t => new FeeTransactionDto
            {
                Id = t.Id,
                TransactionDate = t.TransactionDate,
                Type = t.Type,
                Amount = t.Amount,
                Description = t.Description,
                ReferenceNumber = t.ReferenceNumber,
                PaymentMethod = t.PaymentMethod
            }).ToListAsync();

        return new StudentFeeAccountDto
        {
            StudentId = studentId,
            StudentName = account.Student != null ? $"{account.Student.FirstName} {account.Student.LastName}" : "Unknown Student",
            TotalAllocated = account.TotalAllocated,
            TotalPaid = account.TotalPaid,
            TotalDiscount = account.TotalDiscount,
            CurrentBalance = account.CurrentBalance,
            LastTransactionDate = account.LastTransactionDate,
            Transactions = transactions
        };
    }

    public async Task ProcessPaymentAsync(ProcessPaymentRequest request)
    {
        var account = await _unitOfWork.Repository<StudentFeeAccount>().GetQueryable()
            .FirstOrDefaultAsync(a => a.StudentId == request.StudentId);

        if (account == null) throw new Exception("Student Fee Account not found");

        // 1. Add Payment Transaction
        if (request.Amount > 0)
        {
            var paymentTx = new FeeTransaction
            {
                StudentId = request.StudentId,
                OrganizationId = _organizationService.GetOrganizationId(),
                AcademicYearId = request.AcademicYearId,
                TransactionDate = DateTime.UtcNow,
                Type = "Payment",
                Amount = request.Amount,
                Description = request.Remarks ?? "Fee Payment",
                ReferenceNumber = request.ReferenceNumber,
                PaymentMethod = request.PaymentMethod
            };
            await _unitOfWork.Repository<FeeTransaction>().AddAsync(paymentTx);
            account.TotalPaid += request.Amount;
        }

        // 2. Add Discount Transaction
        if (request.Discount > 0)
        {
            var discountTx = new FeeTransaction
            {
                StudentId = request.StudentId,
                OrganizationId = _organizationService.GetOrganizationId(),
                AcademicYearId = request.AcademicYearId,
                TransactionDate = DateTime.UtcNow,
                Type = "Discount",
                Amount = request.Discount,
                Description = "Fee Discount",
                ReferenceNumber = request.ReferenceNumber
            };
            await _unitOfWork.Repository<FeeTransaction>().AddAsync(discountTx);
            account.TotalDiscount += request.Discount;
        }

        account.LastTransactionDate = DateTime.UtcNow;
        _unitOfWork.Repository<StudentFeeAccount>().Update(account);
        await _unitOfWork.CompleteAsync();
    }

    public async Task AddExtraChargeAsync(AddExtraChargeRequest request)
    {
        var account = await _unitOfWork.Repository<StudentFeeAccount>().GetQueryable()
            .FirstOrDefaultAsync(a => a.StudentId == request.StudentId);

        if (account == null) throw new Exception("Student Fee Account not found");

        var chargeTx = new FeeTransaction
        {
            StudentId = request.StudentId,
            OrganizationId = _organizationService.GetOrganizationId(),
            AcademicYearId = request.AcademicYearId,
            TransactionDate = DateTime.UtcNow,
            Type = "Charge",
            Amount = request.Amount,
            Description = request.Remarks?.Trim() != null 
                ? $"{request.ChargeType} - {request.Remarks}" 
                : request.ChargeType
        };

        await _unitOfWork.Repository<FeeTransaction>().AddAsync(chargeTx);
        account.TotalAllocated += request.Amount;
        account.LastTransactionDate = DateTime.UtcNow;
        _unitOfWork.Repository<StudentFeeAccount>().Update(account);
        await _unitOfWork.CompleteAsync();
    }

    public async Task GenerateMonthlyChargesAsync(IEnumerable<Guid> classIds, string month, IEnumerable<Guid>? feeHeadIds = null, Guid? academicYearId = null)
    {
        var yearQuery = _unitOfWork.Repository<AcademicYear>().GetQueryable();
        var currentYear = academicYearId.HasValue 
            ? await yearQuery.FirstOrDefaultAsync(y => y.Id == academicYearId.Value)
            : await yearQuery.FirstOrDefaultAsync(y => y.IsCurrent && y.IsActive);
            
        if (currentYear == null) throw new Exception("No active academic session found for the provided ID or current configuration.");

        var orgId = _organizationService.GetOrganizationId();
        var monthName = month.Split(' ')[0];

        foreach (var classId in classIds)
        {
            var structuresQuery = _unitOfWork.Repository<FeeStructure>().GetQueryable()
                .Include(f => f.FeeHead)
                .Where(f => f.ClassId == classId && f.AcademicYearId == currentYear.Id);

            if (feeHeadIds != null && feeHeadIds.Any())
            {
                structuresQuery = structuresQuery.Where(f => feeHeadIds.Contains(f.FeeHeadId));
            }

            var structures = await structuresQuery.ToListAsync();

            var studentAcademics = await _unitOfWork.Repository<StudentAcademic>().GetQueryable()
                .Include(sa => sa.Student)
                .Where(sa => sa.ClassId == classId && sa.IsCurrent && sa.Student.IsActive)
                .ToListAsync();

            var students = studentAcademics.Select(sa => sa.Student).ToList();
            if (!students.Any()) continue;

            var studentIds = students.Select(s => s.Id).ToList();

            // Fetch all existing accounts for these students in bulk
            var existingAccounts = await _unitOfWork.Repository<StudentFeeAccount>().GetQueryable()
                .Where(a => studentIds.Contains(a.StudentId))
                .ToListAsync();

            // Fetch existing transactions to prevent duplicates in bulk
            // We search for type "Charge" and description containing the month or relevant head name
            var existingTransactions = await _unitOfWork.Repository<FeeTransaction>().GetQueryable()
                .Where(t => studentIds.Contains(t.StudentId) && t.Type == "Charge" && t.AcademicYearId == currentYear.Id)
                .ToListAsync();

            // Fetch all selective fee subscriptions
            var subscriptions = await _unitOfWork.Repository<StudentFeeSubscription>().GetQueryable()
                .Where(sub => studentIds.Contains(sub.StudentId) && sub.IsActive)
                .ToListAsync();

            // Fetch all discount assignments for the current academic session
            var discountAssignments = await _unitOfWork.Repository<FeeDiscountAssignment>().GetQueryable()
                .Include(a => a.Discount)
                .Where(a => studentIds.Contains(a.StudentId) && a.AcademicYearId == currentYear.Id && a.IsActive)
                .ToListAsync();

            foreach (var student in students)
            {
                var studentSubs = subscriptions.Where(s => s.StudentId == student.Id).ToList();
                var studentDiscounts = discountAssignments.Where(a => a.StudentId == student.Id).ToList();
                
                var account = existingAccounts.FirstOrDefault(a => a.StudentId == student.Id);
                if (account == null)
                {
                    account = new StudentFeeAccount 
                    { 
                        StudentId = student.Id,
                        OrganizationId = orgId,
                        TotalAllocated = 0,
                        TotalPaid = 0,
                        TotalDiscount = 0,
                        LastTransactionDate = DateTime.UtcNow
                    };
                    await _unitOfWork.Repository<StudentFeeAccount>().AddAsync(account);
                    existingAccounts.Add(account); // Add to local list to handle potential duplicates in memory if any
                }

                var studentExistingTxs = existingTransactions.Where(t => t.StudentId == student.Id).ToList();

                foreach (var fee in structures)
                {
                    var feeHead = fee.FeeHead!;
                    decimal chargeAmount = fee.Amount;

                    // SELECTIVE FEE CHECK:
                    if (feeHead.IsSelective)
                    {
                        var subscription = studentSubs.FirstOrDefault(s => s.FeeHeadId == fee.FeeHeadId);
                        if (subscription == null) continue; // Student not opted in for this elective fee
                        
                        if (subscription.CustomAmount.HasValue)
                           chargeAmount = subscription.CustomAmount.Value;
                    }

                    // Applicable Month Check (For Yearly/One-time)
                    if (fee.Frequency == "Yearly" || fee.Frequency == "One-time" || fee.Frequency == "One-Time")
                    {
                        if (string.IsNullOrEmpty(fee.ApplicableMonth) || 
                            !fee.ApplicableMonth.Equals(monthName, StringComparison.OrdinalIgnoreCase))
                        {
                            continue; // Skip if not the right month
                        }
                    }

                    // Quarterly Logic
                    if (fee.Frequency == "Quarterly")
                    {
                        var standardQuarters = new[] { "April", "July", "October", "January" };
                        if (!string.IsNullOrEmpty(fee.ApplicableMonth))
                        {
                            var allowedMonths = fee.ApplicableMonth.Split(',').Select(m => m.Trim());
                            if (!allowedMonths.Any(m => m.Equals(monthName, StringComparison.OrdinalIgnoreCase)))
                                continue;
                        }
                        else if (!standardQuarters.Any(q => q.Equals(monthName, StringComparison.OrdinalIgnoreCase)))
                        {
                            continue;
                        }
                    }

                    bool alreadyCharged = false;
                    if (fee.Frequency == "Monthly" || fee.Frequency == "Quarterly") 
                    {
                        alreadyCharged = studentExistingTxs.Any(t => t.Description != null && t.Description.Contains(month) && t.Description.Contains(feeHead.Name));
                    }
                    else if (fee.Frequency == "Yearly")
                    {
                        alreadyCharged = studentExistingTxs.Any(t => t.Description != null && t.Description.Contains(feeHead.Name) && t.TransactionDate > DateTime.UtcNow.AddMonths(-10));
                    }
                    else if (fee.Frequency == "One-Time" || fee.Frequency == "One-time")
                    {
                        alreadyCharged = studentExistingTxs.Any(t => t.Description != null && t.Description.Contains(feeHead.Name));
                    }

                    if (!alreadyCharged)
                    {
                        var chargeTx = new FeeTransaction
                        {
                            StudentId = student.Id,
                            OrganizationId = orgId,
                            TransactionDate = DateTime.UtcNow,
                            Type = "Charge",
                            Amount = chargeAmount,
                            AcademicYearId = currentYear.Id,
                            Description = (fee.Frequency == "Monthly" || fee.Frequency == "Quarterly") ? $"{feeHead.Name} for {month}" : $"{feeHead.Name} ({fee.Frequency})"
                        };
                        await _unitOfWork.Repository<FeeTransaction>().AddAsync(chargeTx);
                        account.TotalAllocated += chargeAmount;
                        studentExistingTxs.Add(chargeTx); // Update local list

                        // Discounts
                        var applicableDiscounts = studentDiscounts
                            .Where(d => d.RestrictedFeeHeadId == null || d.RestrictedFeeHeadId == feeHead.Id)
                            .ToList();

                        foreach (var assignment in applicableDiscounts)
                        {
                            var discount = assignment.Discount;
                            var frequency = assignment.CustomFrequency ?? discount.Frequency;
                            if (frequency != fee.Frequency) continue;

                            decimal discountAmount = 0;
                            var calculationType = assignment.CustomCalculationType ?? discount.CalculationType;
                            var value = assignment.CustomValue ?? discount.Value;

                            if (calculationType == "Percentage")
                                discountAmount = (chargeAmount * value) / 100;
                            else
                                discountAmount = value;

                            if (discountAmount > 0)
                            {
                                var discountTx = new FeeTransaction
                                {
                                    StudentId = student.Id,
                                    OrganizationId = orgId,
                                    TransactionDate = DateTime.UtcNow,
                                    Type = "Discount",
                                    Amount = discountAmount,
                                    AcademicYearId = currentYear.Id,
                                    Description = $"{discount.Name} for {feeHead.Name} ({month})"
                                };
                                await _unitOfWork.Repository<FeeTransaction>().AddAsync(discountTx);
                                account.TotalDiscount += discountAmount;
                            }
                        }
                    }
                }
                account.LastTransactionDate = DateTime.UtcNow;
            }
        }

        await _unitOfWork.CompleteAsync();
    }
    public async Task UndoMonthlyChargesAsync(IEnumerable<Guid> classIds, string month, Guid? academicYearId = null)
    {
        var yearQuery = _unitOfWork.Repository<AcademicYear>().GetQueryable();
        var currentYear = academicYearId.HasValue 
            ? await yearQuery.FirstOrDefaultAsync(y => y.Id == academicYearId.Value)
            : await yearQuery.FirstOrDefaultAsync(y => y.IsCurrent && y.IsActive);
            
        if (currentYear == null) throw new Exception("No active academic session found.");

        foreach (var classId in classIds)
        {
            var studentIds = await _unitOfWork.Repository<StudentAcademic>().GetQueryable()
                .Where(sa => sa.ClassId == classId && sa.IsCurrent)
                .Select(sa => sa.StudentId)
                .ToListAsync();

            if (!studentIds.Any()) continue;

            // Find all matching "Charge" or "Discount" transactions for this month and class
            var transactions = await _unitOfWork.Repository<FeeTransaction>().GetQueryable()
                .Where(t => studentIds.Contains(t.StudentId) 
                         && (t.Type == "Charge" || t.Type == "Discount") 
                         && t.AcademicYearId == currentYear.Id 
                         && t.Description != null && t.Description.Contains(month))
                .ToListAsync();

            if (!transactions.Any()) continue;

            var accounts = await _unitOfWork.Repository<StudentFeeAccount>().GetQueryable()
                .Where(a => studentIds.Contains(a.StudentId))
                .ToListAsync();

            foreach (var tx in transactions)
            {
                var account = accounts.FirstOrDefault(a => a.StudentId == tx.StudentId);
                if (account != null)
                {
                    if (tx.Type == "Charge") 
                        account.TotalAllocated -= tx.Amount;
                    else if (tx.Type == "Discount") 
                        account.TotalDiscount -= tx.Amount;
                    
                    account.LastTransactionDate = DateTime.UtcNow;
                }
                _unitOfWork.Repository<FeeTransaction>().Delete(tx);
            }
        }

        await _unitOfWork.CompleteAsync();
    }

    public async Task<IEnumerable<ClassFeeHistoryDto>> GetFeeHistoryAsync(Guid? classId = null, Guid? academicYearId = null)
    {
        var query = _unitOfWork.Repository<FeeTransaction>().GetQueryable()
            .Where(t => t.Type == "Charge" && t.Description != null);

        if (academicYearId.HasValue)
        {
            query = query.Where(t => t.AcademicYearId == academicYearId.Value);
        }

        // Project to what we need first to avoid complex object grouping
        var flatData = await query
            .Select(t => new {
                t.Description,
                t.Amount,
                t.StudentId,
                t.TransactionDate,
                // Try to get class name via join/subquery that EF can translate
                ClassName = _unitOfWork.Repository<StudentAcademic>().GetQueryable()
                    .Where(sa => sa.StudentId == t.StudentId && sa.IsCurrent)
                    .Select(sa => sa.Class.Name)
                    .FirstOrDefault(),
                ClassId = _unitOfWork.Repository<StudentAcademic>().GetQueryable()
                    .Where(sa => sa.StudentId == t.StudentId && sa.IsCurrent)
                    .Select(sa => sa.ClassId)
                    .FirstOrDefault()
            })
            .ToListAsync();

        // Apply class filtering in memory if needed (safest for cross-repo queries)
        var filteredData = classId.HasValue 
            ? flatData.Where(x => x.ClassId == classId.Value) 
            : flatData;

        // Group in memory
        var history = filteredData
            .GroupBy(x => new { x.Description, x.ClassName, x.ClassId })
            .Select(g => new ClassFeeHistoryDto
            {
                ClassId = g.Key.ClassId,
                ClassName = g.Key.ClassName ?? "General",
                Month = g.Key.Description ?? "Unknown",
                FeeHeadName = "Batch Generation",
                TotalAmount = g.Sum(x => x.Amount),
                StudentCount = g.Select(x => x.StudentId).Distinct().Count(),
                LastPostedDate = g.Max(x => x.TransactionDate)
            })
            .OrderByDescending(h => h.LastPostedDate)
            .Take(50)
            .ToList();

        return history;
    }

    // Student Fee Subscriptions (Elective Fees)
    public async Task<IEnumerable<StudentFeeSubscriptionDto>> GetStudentSubscriptionsAsync(Guid studentId)
    {
        var subs = await _unitOfWork.Repository<StudentFeeSubscription>().GetQueryable()
            .Include(s => s.FeeHead)
            .Where(s => s.StudentId == studentId)
            .ToListAsync();

        return subs.Select(s => new StudentFeeSubscriptionDto
        {
            Id = s.Id,
            StudentId = s.StudentId,
            FeeHeadId = s.FeeHeadId,
            FeeHeadName = s.FeeHead.Name,
            CustomAmount = s.CustomAmount,
            IsActive = s.IsActive
        });
    }

    public async Task<StudentFeeSubscriptionDto> CreateSubscriptionAsync(CreateStudentFeeSubscriptionRequest request)
    {
        var sub = new StudentFeeSubscription
        {
            StudentId = request.StudentId,
            FeeHeadId = request.FeeHeadId,
            CustomAmount = request.CustomAmount,
            IsActive = request.IsActive
        };

        await _unitOfWork.Repository<StudentFeeSubscription>().AddAsync(sub);
        await _unitOfWork.CompleteAsync();

        var feeHead = await _unitOfWork.Repository<FeeHead>().GetByIdAsync(sub.FeeHeadId);
        return new StudentFeeSubscriptionDto
        {
            Id = sub.Id,
            StudentId = sub.StudentId,
            FeeHeadId = sub.FeeHeadId,
            FeeHeadName = feeHead?.Name ?? "Unknown",
            CustomAmount = sub.CustomAmount,
            IsActive = sub.IsActive
        };
    }

    public async Task UpdateSubscriptionAsync(Guid id, CreateStudentFeeSubscriptionRequest request)
    {
        var sub = await _unitOfWork.Repository<StudentFeeSubscription>().GetByIdAsync(id);
        if (sub != null)
        {
            sub.CustomAmount = request.CustomAmount;
            sub.IsActive = request.IsActive;
            _unitOfWork.Repository<StudentFeeSubscription>().Update(sub);
            await _unitOfWork.CompleteAsync();
        }
    }

    public async Task DeleteSubscriptionAsync(Guid id)
    {
        var sub = await _unitOfWork.Repository<StudentFeeSubscription>().GetByIdAsync(id);
        if (sub != null)
        {
            _unitOfWork.Repository<StudentFeeSubscription>().Delete(sub);
            await _unitOfWork.CompleteAsync();
        }
    }

    public async Task<IEnumerable<FeeDiscount>> GetDiscountsAsync()
    {
        return await _unitOfWork.Repository<FeeDiscount>().GetQueryable()
            .Where(d => d.IsActive)
            .OrderBy(d => d.Name)
            .ToListAsync();
    }

    public async Task AssignDiscountAsync(FeeDiscountAssignment assignment)
    {
        await _unitOfWork.Repository<FeeDiscountAssignment>().AddAsync(assignment);
        await _unitOfWork.CompleteAsync();
    }

    public async Task<IEnumerable<FeeDiscountAssignment>> GetStudentDiscountsAsync(Guid studentId)
    {
        return await _unitOfWork.Repository<FeeDiscountAssignment>().GetQueryable()
            .Include(a => a.Discount)
            .Include(a => a.AcademicYear)
            .Include(a => a.RestrictedFeeHead)
            .Where(a => a.StudentId == studentId && a.IsActive)
            .ToListAsync();
    }

    public async Task<FeeConfiguration?> GetFeeConfigurationAsync()
    {
        return await _unitOfWork.Repository<FeeConfiguration>().GetQueryable()
            .FirstOrDefaultAsync(c => c.IsActive);
    }

    public async Task UpdateFeeConfigurationAsync(FeeConfiguration config)
    {
        var repo = _unitOfWork.Repository<FeeConfiguration>();
        var orgId = _organizationService.GetOrganizationId();

        var existing = await repo.GetQueryable()
            .FirstOrDefaultAsync(c => c.Id == config.Id || (c.OrganizationId == orgId && c.IsActive));
            
        if (existing == null)
        {
            if (config.OrganizationId == Guid.Empty) config.OrganizationId = orgId;
            await repo.AddAsync(config);
        }
        else
        {
            existing.MonthlyDueDay = config.MonthlyDueDay;
            existing.GracePeriodDays = config.GracePeriodDays;
            existing.LateFeeType = config.LateFeeType;
            existing.LateFeeAmount = config.LateFeeAmount;
            existing.AutoCalculateLateFee = config.AutoCalculateLateFee;
            existing.Frequency = config.Frequency;
            existing.IsActive = config.IsActive;
            repo.Update(existing);
        }
            
        await _unitOfWork.CompleteAsync();
    }

    public async Task ApplyLateFeesAsync(int month, int year)
    {
        var config = await GetFeeConfigurationAsync();
        if (config == null || !config.AutoCalculateLateFee) return;

        // Determine if we are past the due date + grace period
        var dueDate = new DateTime(year, month, config.MonthlyDueDay).AddDays(config.GracePeriodDays);
        if (DateTime.Now <= dueDate) return;

        var academicYear = await _unitOfWork.Repository<AcademicYear>().GetQueryable().FirstOrDefaultAsync(x => x.IsCurrent);
        if (academicYear == null) return;

        var accounts = await _unitOfWork.Repository<StudentFeeAccount>().GetQueryable()
            .Where(a => a.CurrentBalance > 0)
            .ToListAsync();

        foreach (var account in accounts)
        {
            // Avoid duplicate late fee for same month if already posted
            var desc = $"Late Fee - {month}/{year}";
            var alreadyPosted = await _unitOfWork.Repository<FeeTransaction>().GetQueryable()
                .AnyAsync(t => t.StudentId == account.StudentId && t.Description == desc);

            if (alreadyPosted) continue;

            decimal penalty = 0;
            if (config.LateFeeType == "Fixed")
            {
                penalty = config.LateFeeAmount;
            }
            else if (config.LateFeeType == "Percentage")
            {
                penalty = account.CurrentBalance * (config.LateFeeAmount / 100);
            }
            else if (config.LateFeeType == "PerDay")
            {
                int daysLate = (DateTime.Now - dueDate).Days;
                penalty = daysLate * config.LateFeeAmount;
            }

            if (penalty > 0)
            {
                var tx = new FeeTransaction
                {
                    StudentId = account.StudentId,
                    Type = "Charge",
                    Amount = penalty,
                    TransactionDate = DateTime.UtcNow,
                    Description = desc,
                    AcademicYearId = academicYear.Id
                };

                await _unitOfWork.Repository<FeeTransaction>().AddAsync(tx);
                account.TotalAllocated += penalty;
                account.LastTransactionDate = DateTime.UtcNow;
                _unitOfWork.Repository<StudentFeeAccount>().Update(account);
            }
        }

        await _unitOfWork.CompleteAsync();
    }
}
