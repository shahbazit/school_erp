using Microsoft.EntityFrameworkCore;
using SchoolERP.Application.DTOs.Inventory;
using SchoolERP.Application.Interfaces;
using SchoolERP.Domain.Entities;
using SchoolERP.Infrastructure.Persistence;

namespace SchoolERP.Infrastructure.Services;

public class InventoryService : IInventoryService
{
    private readonly ApplicationDbContext _context;

    public InventoryService(ApplicationDbContext context)
    {
        _context = context;
    }

    #region Items

    public async Task<List<InventoryItemDto>> GetInventoryItemsAsync()
    {
        return await _context.InventoryItems
            .Include(i => i.Category)
            .Select(i => new InventoryItemDto
            {
                Id = i.Id,
                Name = i.Name,
                Code = i.Code,
                CategoryId = i.CategoryId,
                CategoryName = i.Category != null ? i.Category.Name : null,
                Unit = i.Unit,
                MinQuantity = i.MinQuantity,
                UnitPrice = i.UnitPrice,
                CurrentStock = i.CurrentStock
            })
            .ToListAsync();
    }

    public async Task<InventoryItemDto?> GetInventoryItemByIdAsync(Guid id)
    {
        var i = await _context.InventoryItems
            .Include(i => i.Category)
            .FirstOrDefaultAsync(item => item.Id == id);

        if (i == null) return null;

        return new InventoryItemDto
        {
            Id = i.Id,
            Name = i.Name,
            Code = i.Code,
            CategoryId = i.CategoryId,
            CategoryName = i.Category != null ? i.Category.Name : null,
            Unit = i.Unit,
            MinQuantity = i.MinQuantity,
            UnitPrice = i.UnitPrice,
            CurrentStock = i.CurrentStock
        };
    }

    public async Task<InventoryItemDto> UpsertInventoryItemAsync(UpsertInventoryItemRequest request)
    {
        InventoryItem? item;
        if (request.Id.HasValue && request.Id.Value != Guid.Empty)
        {
            item = await _context.InventoryItems.FindAsync(request.Id);
            if (item == null) throw new Exception("Item not found");
        }
        else
        {
            item = new InventoryItem();
            _context.InventoryItems.Add(item);
        }

        item.Name = request.Name;
        item.Code = request.Code;
        item.CategoryId = request.CategoryId;
        item.Unit = request.Unit;
        item.MinQuantity = request.MinQuantity;
        item.UnitPrice = request.UnitPrice;

        await _context.SaveChangesAsync();

        return (await GetInventoryItemByIdAsync(item.Id))!;
    }

    public async Task DeleteInventoryItemAsync(Guid id)
    {
        var item = await _context.InventoryItems.FindAsync(id);
        if (item != null)
        {
            _context.InventoryItems.Remove(item);
            await _context.SaveChangesAsync();
        }
    }

    #endregion

    #region Transactions

    public async Task<List<InventoryTransactionDto>> GetInventoryTransactionsAsync()
    {
        return await _context.InventoryTransactions
            .Include(t => t.Item)
            .Include(t => t.Supplier)
            .OrderByDescending(t => t.TransactionDate)
            .Select(t => new InventoryTransactionDto
            {
                Id = t.Id,
                ItemId = t.ItemId,
                ItemName = t.Item != null ? t.Item.Name : "Deleted Item",
                Type = t.Type,
                Quantity = t.Quantity,
                UnitPrice = t.UnitPrice,
                TotalAmount = t.TotalAmount,
                Reference = t.Reference,
                Entity = t.Entity,
                HandledBy = t.HandledBy,
                Notes = t.Notes,
                TransactionDate = t.TransactionDate,
                SupplierId = t.SupplierId,
                SupplierName = t.Supplier != null ? t.Supplier.Name : t.Entity,
                PaymentStatus = t.PaymentStatus,
                AmountPaid = t.AmountPaid,
            })
            .ToListAsync();
    }

    public async Task<InventoryTransactionDto> CreateInventoryTransactionAsync(CreateInventoryTransactionRequest request)
    {
        var item = await _context.InventoryItems.FindAsync(request.ItemId);
        if (item == null) throw new Exception("Item not found");

        // For purchases: default payment status to Unpaid if not provided
        var paymentStatus = request.Type == InventoryTransactionType.Purchase
            ? (request.PaymentStatus ?? "Unpaid")
            : null; // Issues/Adjustments/Returns don't have vendor payments

        var transaction = new InventoryTransaction
        {
            ItemId = request.ItemId,
            Type = request.Type,
            Quantity = request.Quantity,
            UnitPrice = request.UnitPrice,
            TotalAmount = request.Quantity * request.UnitPrice,
            Reference = request.Reference,
            Entity = request.Entity,
            HandledBy = request.HandledBy,
            Notes = request.Notes,
            TransactionDate = DateTime.UtcNow,
            SupplierId = request.Type == InventoryTransactionType.Purchase ? request.SupplierId : null,
            PaymentStatus = paymentStatus,
            AmountPaid = request.AmountPaid
        };

        _context.InventoryTransactions.Add(transaction);

        // Update item stock
        switch (request.Type)
        {
            case InventoryTransactionType.Purchase:
            case InventoryTransactionType.Return:
                item.CurrentStock += request.Quantity;
                break;
            case InventoryTransactionType.Issue:
                item.CurrentStock -= request.Quantity;
                break;
            case InventoryTransactionType.Adjustment:
                item.CurrentStock += request.Quantity; // Can be negative quantity for reduction
                break;
        }

        await _context.SaveChangesAsync();

        return (await GetInventoryTransactionsAsync()).First(t => t.Id == transaction.Id);
    }

    public async Task<InventoryTransactionDto> UpdateTransactionPaymentAsync(Guid id, UpdatePaymentStatusRequest request)
    {
        var transaction = await _context.InventoryTransactions.FindAsync(id);
        if (transaction == null) throw new Exception("Transaction not found");

        transaction.PaymentStatus = request.PaymentStatus;
        transaction.AmountPaid = request.AmountPaid;

        await _context.SaveChangesAsync();

        return (await GetInventoryTransactionsAsync()).First(t => t.Id == id);
    }

    #endregion

    #region Suppliers

    public async Task<List<InventorySupplierDto>> GetSuppliersAsync()
    {
        return await _context.InventorySuppliers
            .Select(s => new InventorySupplierDto
            {
                Id = s.Id,
                Name = s.Name,
                ContactPerson = s.ContactPerson,
                Phone = s.Phone,
                Email = s.Email,
                Address = s.Address,
                Category = s.Category
            })
            .ToListAsync();
    }

    public async Task<InventorySupplierDto> UpsertSupplierAsync(InventorySupplierDto request)
    {
        InventorySupplier? s;
        if (request.Id != Guid.Empty)
        {
            s = await _context.InventorySuppliers.FindAsync(request.Id);
            if (s == null) throw new Exception("Supplier not found");
        }
        else
        {
            s = new InventorySupplier();
            _context.InventorySuppliers.Add(s);
        }

        s.Name = request.Name;
        s.ContactPerson = request.ContactPerson;
        s.Phone = request.Phone;
        s.Email = request.Email;
        s.Address = request.Address;
        s.Category = request.Category;

        await _context.SaveChangesAsync();

        request.Id = s.Id;
        return request;
    }

    public async Task DeleteSupplierAsync(Guid id)
    {
        var s = await _context.InventorySuppliers.FindAsync(id);
        if (s != null)
        {
            _context.InventorySuppliers.Remove(s);
            await _context.SaveChangesAsync();
        }
    }

    #endregion

    #region Categories

    public async Task<List<InventoryCategoryDto>> GetCategoriesAsync()
    {
        return await _context.InventoryCategories
            .Select(c => new InventoryCategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description
            })
            .ToListAsync();
    }

    public async Task<InventoryCategoryDto> UpsertCategoryAsync(InventoryCategoryDto request)
    {
        InventoryCategory? c;
        if (request.Id != Guid.Empty)
        {
            c = await _context.InventoryCategories.FindAsync(request.Id);
            if (c == null) throw new Exception("Category not found");
        }
        else
        {
            c = new InventoryCategory();
            _context.InventoryCategories.Add(c);
        }

        c.Name = request.Name;
        c.Description = request.Description;

        await _context.SaveChangesAsync();

        request.Id = c.Id;
        return request;
    }

    public async Task DeleteCategoryAsync(Guid id)
    {
        var c = await _context.InventoryCategories.FindAsync(id);
        if (c != null)
        {
            _context.InventoryCategories.Remove(c);
            await _context.SaveChangesAsync();
        }
    }

    #endregion
}
