using AiBusinessOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AiBusinessOS.Infrastructure.Persistence;

public sealed class AiBusinessOSDbContext(DbContextOptions<AiBusinessOSDbContext> options) : DbContext(options)
{
    public DbSet<Lead> Leads => Set<Lead>();
    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Lead>(entity =>
        {
            entity.ToTable("leads", "dbo");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.TenantId).HasColumnName("tenant_id");
            entity.Property(x => x.OwnerUserId).HasColumnName("owner_user_id");
            entity.Property(x => x.AssignedBranchId).HasColumnName("assigned_branch_id");
            entity.Property(x => x.Source).HasColumnName("source");
            entity.Property(x => x.StageId).HasColumnName("stage_id");
            entity.Property(x => x.FirstName).HasColumnName("first_name");
            entity.Property(x => x.LastName).HasColumnName("last_name");
            entity.Property(x => x.Email).HasColumnName("email");
            entity.Property(x => x.Phone).HasColumnName("phone");
            entity.Property(x => x.CompanyName).HasColumnName("company_name");
            entity.Property(x => x.Score).HasColumnName("score");
            entity.Property(x => x.ValueEstimate).HasColumnName("value_estimate");
            entity.Property(x => x.Status).HasColumnName("status");
            entity.Property(x => x.Notes).HasColumnName("notes");
            entity.Property(x => x.CreatedAt).HasColumnName("created_at");
            entity.Property(x => x.CreatedBy).HasColumnName("created_by");
            entity.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            entity.Property(x => x.UpdatedBy).HasColumnName("updated_by");
            entity.Property(x => x.DeletedAt).HasColumnName("deleted_at");
            entity.Property(x => x.DeletedBy).HasColumnName("deleted_by");
            entity.HasQueryFilter(x => x.DeletedAt == null);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users", "dbo");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.TenantId).HasColumnName("tenant_id");
            entity.Property(x => x.BranchId).HasColumnName("branch_id");
            entity.Property(x => x.Email).HasColumnName("email");
            entity.Property(x => x.FirstName).HasColumnName("first_name");
            entity.Property(x => x.LastName).HasColumnName("last_name");
            entity.Property(x => x.PasswordHash).HasColumnName("password_hash");
            entity.Property(x => x.Status).HasColumnName("status");
            entity.Property(x => x.CreatedAt).HasColumnName("created_at");
            entity.Property(x => x.CreatedBy).HasColumnName("created_by");
            entity.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            entity.Property(x => x.UpdatedBy).HasColumnName("updated_by");
            entity.Property(x => x.DeletedAt).HasColumnName("deleted_at");
            entity.Property(x => x.DeletedBy).HasColumnName("deleted_by");
            entity.HasQueryFilter(x => x.DeletedAt == null);
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.ToTable("refresh_tokens", "dbo");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.TenantId).HasColumnName("tenant_id");
            entity.Property(x => x.UserId).HasColumnName("user_id");
            entity.Property(x => x.TokenHash).HasColumnName("token_hash");
            entity.Property(x => x.ExpiresAt).HasColumnName("expires_at");
            entity.Property(x => x.RevokedAt).HasColumnName("revoked_at");
            entity.Property(x => x.RevokeReason).HasColumnName("revoke_reason");
            entity.Property(x => x.ReplacedByTokenId).HasColumnName("replaced_by_token_id");
            entity.Property(x => x.CreatedIp).HasColumnName("created_ip");
            entity.Property(x => x.UserAgent).HasColumnName("user_agent");
            entity.Property(x => x.CreatedAt).HasColumnName("created_at");
            entity.Property(x => x.CreatedBy).HasColumnName("created_by");
            entity.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            entity.Property(x => x.UpdatedBy).HasColumnName("updated_by");
            entity.Property(x => x.DeletedAt).HasColumnName("deleted_at");
            entity.Property(x => x.DeletedBy).HasColumnName("deleted_by");
            entity.HasQueryFilter(x => x.DeletedAt == null);
        });
    }
}
