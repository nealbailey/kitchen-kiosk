using Kiosk.Data.Repository;
using KioskApi.Authentication;
using KioskApi.Data;
using KioskApi.Domain.Models.Auth;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;
using Microsoft.OpenApi.Models;
using System;
using System.IO;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace KioskApi
{
    /// <summary>
    /// Api Entry Point
    /// </summary>
    public class Startup
    {
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Key/value application configuration properties.</param>
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        /// <summary>
        /// Key/value application configuration properties.
        /// </summary>
        public IConfiguration Configuration { get; }

        /// <summary>
        /// This method gets called by the runtime. Use this method to add services to the container.
        /// </summary>
        /// <param name="services"></param>
        public void ConfigureServices(IServiceCollection services)
        {
            foreach (var key in new[] { "ConnectionStrings:ConnStr", "JWT:Secret" })
            {
                if (string.IsNullOrWhiteSpace(Configuration[key]))
                    throw new InvalidOperationException($"Missing required setting '{key}'. Set it with the environment variable '{key.Replace(":", "__")}'.");
            }
           
            services.Configure<ForwardedHeadersOptions>(o =>
            {
                o.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
            });

            services.AddControllers();

            // Newtonsoft JSON
            services.AddControllers().AddNewtonsoftJson(options => 
                options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
                );

            // Swagger configuration and settings
            // https://docs.microsoft.com/en-us/aspnet/core/tutorials/getting-started-with-swashbuckle?view=aspnetcore-6.0&tabs=visual-studio

            // For Swagger
            services.AddSwaggerGen();

            services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new OpenApiInfo { Title = "KioskApi", Version = "v1" });
                // using System.Reflection;
                var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
                options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename));
            });
            
            // For Entity Framework              
            services.AddDbContext<ApplicationDbContext>(options => options.UseMySql(Configuration.GetConnectionString("ConnStr"), ServerVersion.AutoDetect(Configuration.GetConnectionString("ConnStr"))));
            services.AddDbContext<KIOSKContext>(opt =>
            {
                opt.UseMySql(Configuration.GetConnectionString("ConnStr"), ServerVersion.AutoDetect(Configuration.GetConnectionString("ConnStr")));
                opt.EnableSensitiveDataLogging();
            });

            // For Identity  
            services.AddIdentity<ApplicationUser, IdentityRole<Guid>>()
                .AddEntityFrameworkStores<ApplicationDbContext>()
                .AddDefaultTokenProviders();

            // Adding Authentication  
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            })

            // Adding Jwt Bearer  
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
            services.AddScoped<IPhotosRepository, PhotosRepository>();
            services.AddScoped<ICategoryRepository, CategoryRepository>();
            services.AddScoped<IIngredientRepository, IngredientRepository>();
            services.AddScoped<IRecipeRepository, RecipeRepository>();            
        }

        /// <summary>
        /// This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        /// </summary>
        /// <param name="app"></param>
        /// <param name="env"></param>
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseForwardedHeaders();

            // Set when a reverse proxy publishes the app under a sub-path such as /kiosk.
            var pathBase = (Configuration["PathBase"] ?? string.Empty).Trim().Trim('/');
            pathBase = pathBase.Length == 0 ? string.Empty : "/" + pathBase;
            if (pathBase.Length > 0)
                app.UsePathBase(pathBase);

            // Only the `ng serve` dev server (another origin) needs CORS.
            if (env.IsDevelopment())
                app.UseCors(x => x.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());

            // Middle-ware injection

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI();
            }            

            //app.UseHttpsRedirection();

            // index.html is served by code so its <base href> can include the PathBase.
            string indexHtml = null;
            async Task ServeIndex(HttpContext context)
            {
                if (indexHtml == null)
                {
                    var file = env.WebRootFileProvider.GetFileInfo("index.html");
                    if (!file.Exists)
                    {
                        context.Response.StatusCode = StatusCodes.Status404NotFound;
                        return;
                    }

                    using var reader = new StreamReader(file.CreateReadStream());
                    indexHtml = (await reader.ReadToEndAsync()).Replace("<base href=\"/\">", $"<base href=\"{pathBase}/\">");
                }

                context.Response.ContentType = "text/html; charset=utf-8";
                await context.Response.WriteAsync(indexHtml);
            }

            app.Use(async (context, next) =>
            {
                if (context.Request.Path == "/" || context.Request.Path == "/index.html")
                    await ServeIndex(context);
                else
                    await next();
            });

            app.UseStaticFiles();

            app.UseRouting();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                // Angular deep links; unmatched /api/* must stay 404.
                endpoints.MapFallback("{*path:nonfile:regex(^(?!api/).*$)}", ServeIndex);
            });
        }
    }
}
