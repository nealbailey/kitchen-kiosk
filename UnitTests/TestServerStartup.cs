using Kiosk.Data.Repository;
using KioskApi.Authentication;
using KioskApi.Data;
using KioskApi.Domain.Models;
using KioskApi.Domain.Models.Auth;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Linq;
using System.Text;
using UnitTests.Helpers;

namespace UnitTests
{
    public class TestServerStartup
    {
        private readonly bool _useInMemory;
        private readonly string _connectionString;

        public TestServerStartup(IConfiguration configuration)
        {
            Configuration = configuration;
            _connectionString = Configuration.GetConnectionString("ConnStr");
            _useInMemory = string.IsNullOrEmpty(_connectionString)
                || _connectionString.Contains("Password=******")
                || _connectionString.Contains(";******;")
                || _connectionString.Contains("User ID=KioskApi.svc;******");
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            if (_useInMemory)
            {
                services.AddDbContext<ApplicationDbContext>(options =>
                    options.UseInMemoryDatabase("KioskApiUnitTests"));
                services.AddDbContext<KIOSKContext>(options =>
                    options.UseInMemoryDatabase("KioskApiUnitTests"));
            }
            else
            {
                services.AddDbContext<ApplicationDbContext>(options =>
                    options.UseSqlServer(_connectionString));
                services.AddDbContext<KIOSKContext>(options =>
                    options.UseSqlServer(_connectionString));
            }

            // For Identity  
            services.AddIdentity<ApplicationUser, IdentityRole>()
                .AddEntityFrameworkStores<ApplicationDbContext>()
                .AddDefaultTokenProviders();

            // Adding Authentication  
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.SaveToken = true;
                options.RequireHttpsMetadata = false;
                options.TokenValidationParameters = new TokenValidationParameters()
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidAudience = Configuration["JWT:ValidAudience"],
                    ValidIssuer = Configuration["JWT:ValidIssuer"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Configuration["JWT:Secret"]))
                };
            });

            // Make config dependency injectable
            services.AddSingleton(Configuration);

            services.AddScoped<IAspNetUserRepository, AspNetUserRepository>();
            services.AddScoped<ICategoryRepository, CategoryRepository>();
            services.AddScoped<IRecipeRepository, RecipeRepository>();
            services.AddScoped<IIngredientRepository, IngredientRepository>();

            // Newtonsoft JSON
            services.AddControllers().AddNewtonsoftJson(options =>
                options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
                );
            services.AddControllers(options => options.EnableEndpointRouting = false);
            services.AddOptions();
            services.AddMvc(options =>
            {
                options.Filters.Add(new AllowAnonymousFilter());
                options.Filters.Add(new FakeUserFilter());
            }).AddApplicationPart(typeof(KioskApi.Controllers.AuthenticateController).Assembly);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ILoggerFactory loggerFactory)
        {
            if (env.EnvironmentName == Environments.Development)
            {
                app.UseDeveloperExceptionPage();
            }
            app.UseMvc();

            if (_useInMemory)
            {
                SeedInMemoryDatabase(app.ApplicationServices);
            }
        }

        private void SeedInMemoryDatabase(IServiceProvider services)
        {
            using var scope = services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<KIOSKContext>();
            var authContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            if (context.RecipeCategories.Any() || authContext.Users.Any())
            {
                return;
            }

            // Seed categories
            var appetizerCategory = new RecipeCategory { CatId = 1, Category = "Appetizer", Total = 1 };
            var breakfastCategory = new RecipeCategory { CatId = 4, Category = "Breakfast", Total = 2 };
            context.RecipeCategories.AddRange(appetizerCategory, breakfastCategory);
            context.SaveChanges();

            // Seed users and roles
            var adminRole = new IdentityRole { Id = "admin-role", Name = "Admin", NormalizedName = "ADMIN" };
            authContext.Roles.Add(adminRole);

            var testUser = new ApplicationUser
            {
                Id = "test",
                UserName = "test",
                NormalizedUserName = "TEST",
                Email = "test@gmail.com",
                NormalizedEmail = "TEST@GMAIL.COM",
                EmailConfirmed = true
            };
            authContext.Users.Add(testUser);
            authContext.UserRoles.Add(new IdentityUserRole<string>
            {
                RoleId = adminRole.Id,
                UserId = testUser.Id
            });

            var ownerUser = new ApplicationUser
            {
                Id = "abc4bbf1-5bb4-43df-8c1b-ca5b1c85883d",
                UserName = "nealbailey",
                NormalizedUserName = "NEALBAILEY",
                Email = "nealbailey@example.com",
                NormalizedEmail = "NEALBAILEY@EXAMPLE.COM",
                EmailConfirmed = true
            };
            authContext.Users.Add(ownerUser);
            authContext.SaveChanges();

            // Mirror seeded users in the DbContext used by repository queries.
            context.AspNetUsers.AddRange(
                new AspNetUser
                {
                    Id = testUser.Id,
                    UserName = testUser.UserName,
                    NormalizedUserName = testUser.NormalizedUserName,
                    Email = testUser.Email,
                    NormalizedEmail = testUser.NormalizedEmail,
                    EmailConfirmed = testUser.EmailConfirmed
                },
                new AspNetUser
                {
                    Id = ownerUser.Id,
                    UserName = ownerUser.UserName,
                    NormalizedUserName = ownerUser.NormalizedUserName,
                    Email = ownerUser.Email,
                    NormalizedEmail = ownerUser.NormalizedEmail,
                    EmailConfirmed = ownerUser.EmailConfirmed
                }
            );
            context.SaveChanges();

            // Seed recipes and related data
            var recipe1058 = new Recipe
            {
                RecId = 1058,
                Title = "chicken soup",
                Description = "A warm chicken soup.",
                Instructions = "Boil chicken and simmer.",
                CatId = appetizerCategory.CatId,
                Useruid = ownerUser.Id,
                Date = DateTime.UtcNow.AddDays(-1)
            };

            var recipe1088 = new Recipe
            {
                RecId = 1088,
                Title = "apple pie",
                Description = "A classic apple pie.",
                Instructions = "Bake apples in crust.",
                CatId = breakfastCategory.CatId,
                Useruid = ownerUser.Id,
                Date = DateTime.UtcNow.AddDays(-2)
            };

            var recipe1092 = new Recipe
            {
                RecId = 1092,
                Title = "grilled cheese",
                Description = "Toasty grilled cheese sandwich.",
                Instructions = "Grill cheese between bread.",
                CatId = breakfastCategory.CatId,
                Useruid = ownerUser.Id,
                Date = DateTime.UtcNow
            };

            context.Recipes.AddRange(recipe1058, recipe1088, recipe1092);
            context.SaveChanges();

            context.RecipeCategoryMaps.AddRange(
                new RecipeCategoryMap { CatId = appetizerCategory.CatId, RecId = recipe1058.RecId },
                new RecipeCategoryMap { CatId = breakfastCategory.CatId, RecId = recipe1088.RecId },
                new RecipeCategoryMap { CatId = breakfastCategory.CatId, RecId = recipe1092.RecId }
            );

            context.RecipeIngredients.AddRange(
                new RecipeIngredient { RecId = recipe1058.RecId, Ingredient = "chicken" },
                new RecipeIngredient { RecId = recipe1058.RecId, Ingredient = "salt" },
                new RecipeIngredient { RecId = recipe1088.RecId, Ingredient = "apple" },
                new RecipeIngredient { RecId = recipe1092.RecId, Ingredient = "bread" }
            );
            context.SaveChanges();
        }
    }
}
