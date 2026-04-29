using Lims.Api.Data;
using Lims.Api.Models;

namespace Lims.Api.Services;

public class AuditService
{
    private readonly AppDbContext _context;

    public AuditService(AppDbContext context)
    {
        _context = context;
    }

    public async Task LogAsync(
    string action,
    string entity,
    int entityId,
    int? sampleId = null,
    string? displayName = null,
    string? oldValue = null,
    string? newValue = null,
    string user = "Mohamed Abbad",
    string? comment = null)
{
    var log = new AuditLog
    {
        Action = action,
        EntityName = entity,
        EntityId = entityId,
        SampleId = sampleId,
        DisplayName = displayName,
        OldValue = oldValue,
        NewValue = newValue,
        User = user,
        Comment = comment,
        CreatedAt = DateTime.UtcNow
    };

    _context.AuditLogs.Add(log);
    await _context.SaveChangesAsync();
}
}