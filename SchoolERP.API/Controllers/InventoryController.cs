using Microsoft.AspNetCore.Mvc;
using SchoolERP.Application.DTOs.Inventory;
using SchoolERP.Application.Interfaces;

namespace SchoolERP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InventoryController : ControllerBase
{
    private readonly IInventoryService _inventoryService;

    public InventoryController(IInventoryService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    #region Items

    [HttpGet("items")]
    public async Task<IActionResult> GetItems() => Ok(await _inventoryService.GetInventoryItemsAsync());

    [HttpGet("items/{id}")]
    public async Task<IActionResult> GetItem(Guid id) => Ok(await _inventoryService.GetInventoryItemByIdAsync(id));

    [HttpPost("items")]
    public async Task<IActionResult> UpsertItem(UpsertInventoryItemRequest request) => Ok(await _inventoryService.UpsertInventoryItemAsync(request));

    [HttpPost("items/{id}/delete")]
    public async Task<IActionResult> DeleteItem(Guid id)
    {
        await _inventoryService.DeleteInventoryItemAsync(id);
        return Ok();
    }

    #endregion

    #region Transactions

    [HttpGet("transactions")]
    public async Task<IActionResult> GetTransactions() => Ok(await _inventoryService.GetInventoryTransactionsAsync());

    [HttpPost("transactions")]
    public async Task<IActionResult> CreateTransaction(CreateInventoryTransactionRequest request) => Ok(await _inventoryService.CreateInventoryTransactionAsync(request));

    [HttpPost("transactions/{id}/payment/update")]
    public async Task<IActionResult> UpdatePayment(Guid id, UpdatePaymentStatusRequest request)
    {
        try
        {
            var result = await _inventoryService.UpdateTransactionPaymentAsync(id, request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    #endregion

    #region Suppliers

    [HttpGet("suppliers")]
    public async Task<IActionResult> GetSuppliers() => Ok(await _inventoryService.GetSuppliersAsync());

    [HttpPost("suppliers")]
    public async Task<IActionResult> UpsertSupplier(InventorySupplierDto request) => Ok(await _inventoryService.UpsertSupplierAsync(request));

    [HttpPost("suppliers/{id}/delete")]
    public async Task<IActionResult> DeleteSupplier(Guid id)
    {
        await _inventoryService.DeleteSupplierAsync(id);
        return Ok();
    }

    #endregion

    #region Categories

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories() => Ok(await _inventoryService.GetCategoriesAsync());

    [HttpPost("categories")]
    public async Task<IActionResult> UpsertCategory(InventoryCategoryDto request) => Ok(await _inventoryService.UpsertCategoryAsync(request));

    [HttpPost("categories/{id}/delete")]
    public async Task<IActionResult> DeleteCategory(Guid id)
    {
        await _inventoryService.DeleteCategoryAsync(id);
        return Ok();
    }

    #endregion
}
