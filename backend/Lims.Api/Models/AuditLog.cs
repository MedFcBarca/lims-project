namespace Lims.Api.Models;

public class AuditLog
{
    public int Id { get; set; }

    public string Action { get; set; } = string.Empty;

    public string EntityName { get; set; } = string.Empty;

    public int EntityId { get; set; }

    public int? SampleId { get; set; }

    public string? DisplayName { get; set; }

    public string? OldValue { get; set; }

    public string? NewValue { get; set; }

    public string User { get; set; } = "system";

    public string? Comment { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}