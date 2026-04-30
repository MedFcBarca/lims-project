using Microsoft.EntityFrameworkCore;
using Lims.Api.Models;

namespace Lims.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

    public DbSet<Client> Clients => Set<Client>();
    public DbSet<Sample> Samples => Set<Sample>();
    public DbSet<Analysis> Analyses => Set<Analysis>();
    public DbSet<AuditLog> AuditLogs { get; set; }
    public DbSet<Batch> Batches { get; set; }
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Client>()
            .HasMany<Sample>()
            .WithOne(s => s.Client)
            .HasForeignKey(s => s.ClientId);

        modelBuilder.Entity<Sample>()
            .HasMany<Analysis>()
            .WithOne(a => a.Sample)
            .HasForeignKey(a => a.SampleId);
    }
}