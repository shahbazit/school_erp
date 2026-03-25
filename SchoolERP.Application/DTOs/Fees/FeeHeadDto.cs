namespace SchoolERP.Application.DTOs.Fees;

public class FeeHeadDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public bool IsSelective { get; set; }
}

public class CreateFeeHeadRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsSelective { get; set; }
}
