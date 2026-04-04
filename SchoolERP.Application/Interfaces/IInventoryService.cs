using SchoolERP.Application.DTOs.Inventory;

namespace SchoolERP.Application.Interfaces;

public interface IInventoryService
{
    // Items
    Task<List<InventoryItemDto>> GetInventoryItemsAsync();
    Task<InventoryItemDto?> GetInventoryItemByIdAsync(Guid id);
    Task<InventoryItemDto> UpsertInventoryItemAsync(UpsertInventoryItemRequest request);
    Task DeleteInventoryItemAsync(Guid id);

    // Transactions
    Task<List<InventoryTransactionDto>> GetInventoryTransactionsAsync();
    Task<InventoryTransactionDto> CreateInventoryTransactionAsync(CreateInventoryTransactionRequest request);
    Task<InventoryTransactionDto> UpdateTransactionPaymentAsync(Guid id, UpdatePaymentStatusRequest request);

    // Suppliers
    Task<List<InventorySupplierDto>> GetSuppliersAsync();
    Task<InventorySupplierDto> UpsertSupplierAsync(InventorySupplierDto request);
    Task DeleteSupplierAsync(Guid id);

    // Categories
    Task<List<InventoryCategoryDto>> GetCategoriesAsync();
    Task<InventoryCategoryDto> UpsertCategoryAsync(InventoryCategoryDto request);
    Task DeleteCategoryAsync(Guid id);
}
