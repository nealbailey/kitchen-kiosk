using KioskApi.Domain.Models;
using Microsoft.EntityFrameworkCore;

#nullable disable

namespace KioskApi.Data
{
    public partial class KIOSKContext : DbContext
    {
        public KIOSKContext() { }

        public KIOSKContext(DbContextOptions<KIOSKContext> options) : base(options) { }

        public virtual DbSet<AspNetRole> AspNetRoles { get; set; }
        public virtual DbSet<AspNetRoleClaim> AspNetRoleClaims { get; set; }
        public virtual DbSet<AspNetUser> AspNetUsers { get; set; }
        public virtual DbSet<AspNetUserClaim> AspNetUserClaims { get; set; }
        public virtual DbSet<AspNetUserLogin> AspNetUserLogins { get; set; }
        public virtual DbSet<AspNetUserRole> AspNetUserRoles { get; set; }
        public virtual DbSet<AspNetUserToken> AspNetUserTokens { get; set; }
        public virtual DbSet<Recipe> Recipes { get; set; }
        public virtual DbSet<RecipeCategory> RecipeCategories { get; set; }
        public virtual DbSet<RecipeCategoryMap> RecipeCategoryMaps { get; set; }
        public virtual DbSet<RecipeFavorite> RecipeFavorites { get; set; }
        public virtual DbSet<RecipeIngredient> RecipeIngredients { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasAnnotation("Relational:Collation", "SQL_Latin1_General_CP1_CI_AS");

            modelBuilder.Entity<AspNetRole>(entity =>
            {
                entity.HasIndex(e => e.NormalizedName, "RoleNameIndex")
                    .IsUnique()
                    .HasFilter("([NormalizedName] IS NOT NULL)");

                entity.Property(e => e.Name).HasMaxLength(256);

                entity.Property(e => e.NormalizedName).HasMaxLength(256);
            });

            modelBuilder.Entity<AspNetRoleClaim>(entity =>
            {
                entity.HasIndex(e => e.RoleId, "IX_AspNetRoleClaims_RoleId");

                entity.Property(e => e.RoleId).IsRequired();

                entity.HasOne(d => d.Role)
                    .WithMany(p => p.AspNetRoleClaims)
                    .HasForeignKey(d => d.RoleId);
            });

            modelBuilder.Entity<AspNetUser>(entity =>
            {
                entity.HasIndex(e => e.NormalizedEmail, "EmailIndex");

                entity.HasIndex(e => e.NormalizedUserName, "UserNameIndex")
                    .IsUnique()
                    .HasFilter("([NormalizedUserName] IS NOT NULL)");

                entity.Property(e => e.Email).HasMaxLength(256);

                entity.Property(e => e.NormalizedEmail).HasMaxLength(256);

                entity.Property(e => e.NormalizedUserName).HasMaxLength(256);

                entity.Property(e => e.UserName).HasMaxLength(256);
            });

            modelBuilder.Entity<AspNetUserClaim>(entity =>
            {
                entity.HasIndex(e => e.UserId, "IX_AspNetUserClaims_UserId");

                entity.Property(e => e.UserId).IsRequired();

                entity.HasOne(d => d.User)
                    .WithMany(p => p.AspNetUserClaims)
                    .HasForeignKey(d => d.UserId);
            });

            modelBuilder.Entity<AspNetUserLogin>(entity =>
            {
                entity.HasKey(e => new { e.LoginProvider, e.ProviderKey });

                entity.HasIndex(e => e.UserId, "IX_AspNetUserLogins_UserId");

                entity.Property(e => e.UserId).IsRequired();

                entity.HasOne(d => d.User)
                    .WithMany(p => p.AspNetUserLogins)
                    .HasForeignKey(d => d.UserId);
            });

            modelBuilder.Entity<AspNetUserRole>(entity =>
            {
                entity.HasKey(e => new { e.UserId, e.RoleId });

                entity.HasIndex(e => e.RoleId, "IX_AspNetUserRoles_RoleId");

                entity.HasOne(d => d.Role)
                    .WithMany(p => p.AspNetUserRoles)
                    .HasForeignKey(d => d.RoleId);

                entity.HasOne(d => d.User)
                    .WithMany(p => p.AspNetUserRoles)
                    .HasForeignKey(d => d.UserId);
            });

            modelBuilder.Entity<AspNetUserToken>(entity =>
            {
                entity.HasKey(e => new { e.UserId, e.LoginProvider, e.Name });

                entity.HasOne(d => d.User)
                    .WithMany(p => p.AspNetUserTokens)
                    .HasForeignKey(d => d.UserId);
            });

            modelBuilder.Entity<Recipe>(entity =>
            {
                entity.HasKey(e => e.RecId);

                entity.ToTable("recipe");

                entity.Property(e => e.RecId).HasColumnName("recId");

                entity.Property(e => e.CatId).HasColumnName("catId");

                entity.Property(e => e.Date).HasColumnType("datetime");

                entity.Property(e => e.Description)
                    .HasMaxLength(1000)
                    .IsUnicode(false);

                entity.Property(e => e.Instructions)
                    .IsRequired()
                    .HasColumnType("text");

                entity.Property(e => e.Title)
                    .IsRequired()
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.Useruid).HasColumnName("useruid");

                entity.HasOne(d => d.PrimaryCategory)
                    .WithMany(p => p.Recipes)
                    .HasForeignKey(d => d.CatId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_recipe_recipeCategory");
            });

            modelBuilder.Entity<RecipeCategory>(entity =>
            {
                entity.HasKey(e => e.CatId);

                entity.ToTable("recipeCategory");

                entity.HasIndex(e => e.Category, "IX_recipeCategory")
                    .IsUnique();

                entity.Property(e => e.CatId).HasColumnName("catId");

                entity.Property(e => e.Category)
                    .IsRequired()
                    .HasMaxLength(255)
                    .IsUnicode(false)
                    .HasColumnName("category");

                entity.Property(e => e.Total).HasColumnName("total");
            });

            modelBuilder.Entity<RecipeCategoryMap>(entity =>
            {
                entity.HasNoKey();

                entity.ToTable("recipeCategoryMap");

                entity.HasIndex(e => e.CatId, "IX_recipeCategories");

                entity.Property(e => e.CatId).HasColumnName("catId");

                entity.Property(e => e.RecId).HasColumnName("recId");

                entity.HasOne(d => d.Cat)
                    .WithMany()
                    .HasForeignKey(d => d.CatId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_recipeCategories_recipeCategory");

                entity.HasOne(d => d.Rec)
                    .WithMany()
                    .HasForeignKey(d => d.RecId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_recipeCategories_recipe");
            });

            modelBuilder.Entity<RecipeFavorite>(entity =>
            {
                entity.HasKey(e => new { e.RecId, e.Useruid });

                entity.ToTable("recipeFavorites");

                entity.Property(e => e.RecId).HasColumnName("recId");

                entity.Property(e => e.Useruid).HasColumnName("useruid");
            });

            modelBuilder.Entity<RecipeIngredient>(entity =>
            {
                entity.HasNoKey();

                entity.ToTable("recipeIngredients");

                entity.Property(e => e.Ingredient)
                    .IsRequired()
                    .HasMaxLength(100)
                    .IsUnicode(false);

                entity.Property(e => e.RecId).HasColumnName("recId");
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
