using SchoolERP.Domain.Common;

namespace SchoolERP.Domain.Entities;

public class MenuMaster : GlobalBaseEntity
{
    public string Key { get; set; } = string.Empty;     // e.g. students, hr, academics
    public string Label { get; set; } = string.Empty;   // e.g. Students, HR, Academics
    public string? Icon { get; set; }                   // e.g. users, brief-case
    public int SortOrder { get; set; } = 0;
    public string Type { get; set; } = "Page";          // "Group" or "Page"
    public string? ParentKey { get; set; }              // For pages inside groups
    public bool IsActive { get; set; } = true;
}
