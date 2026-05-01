namespace Lims.Api.DTOs;

public class PlanSamplingRequestDto
{
    public DateTime PlannedDate { get; set; }
    public string AssignedTechnician { get; set; } = string.Empty;
}