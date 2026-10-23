using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Threading.RateLimiting;

namespace KioskApi.MobileSync
{
    /// <summary>
    /// Kind of mobile sync request, used to pick rate limits.
    /// </summary>
    public enum MobileSyncOperation
    {
        /// <summary>Lightweight status check.</summary>
        Status,
        /// <summary>Manifest or recipe-body transfer.</summary>
        Data
    }

    /// <summary>
    /// Process-wide limiters for the mobile sync endpoints.
    /// </summary>
    public sealed class MobileSyncLimiter : IDisposable
    {
        /// <summary>Constructor.</summary>
        public MobileSyncLimiter(IOptions<MobileSyncOptions> options)
        {
            var o = options.Value;
            StatusRate = CreateWindow(o.StatusRequestsPerMinute);
            DataRate = CreateWindow(o.DataRequestsPerMinute);
            DataConcurrency = new ConcurrencyLimiter(new ConcurrencyLimiterOptions
            {
                PermitLimit = Math.Max(1, o.MaxConcurrentDataRequests),
                QueueLimit = 0
            });
        }

        internal RateLimiter StatusRate { get; }
        internal RateLimiter DataRate { get; }
        internal RateLimiter DataConcurrency { get; }

        private static RateLimiter CreateWindow(int permitsPerMinute) =>
            new FixedWindowRateLimiter(new FixedWindowRateLimiterOptions
            {
                PermitLimit = Math.Max(1, permitsPerMinute),
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
                AutoReplenishment = true
            });

        /// <inheritdoc/>
        public void Dispose()
        {
            StatusRate.Dispose();
            DataRate.Dispose();
            DataConcurrency.Dispose();
        }
    }

    /// <summary>
    /// Enforces the mobile sync switch, shared key, and rate/concurrency limits before the action runs.
    /// Independent of JWT authorization.
    /// </summary>
    [AttributeUsage(AttributeTargets.Method)]
    public sealed class MobileSyncAccessAttribute : TypeFilterAttribute
    {
        /// <summary>Constructor.</summary>
        public MobileSyncAccessAttribute(MobileSyncOperation operation) : base(typeof(MobileSyncAccessFilter))
        {
            Arguments = new object[] { operation };
        }
    }

    internal sealed class MobileSyncAccessFilter : IAsyncResourceFilter
    {
        public const string KeyHeader = "X-Kiosk-Mobile-Key";

        private readonly MobileSyncOperation _operation;
        private readonly MobileSyncOptions _options;
        private readonly MobileSyncLimiter _limiter;
        private readonly ILogger<MobileSyncAccessFilter> _logger;

        public MobileSyncAccessFilter(MobileSyncOperation operation, IOptions<MobileSyncOptions> options, MobileSyncLimiter limiter, ILogger<MobileSyncAccessFilter> logger)
        {
            _operation = operation;
            _options = options.Value;
            _limiter = limiter;
            _logger = logger;
        }

        public async Task OnResourceExecutionAsync(ResourceExecutingContext context, ResourceExecutionDelegate next)
        {
            if (!_options.Enabled)
            {
                context.Result = Error(StatusCodes.Status503ServiceUnavailable, "sync_disabled", "Mobile sync is disabled on this server.");
                return;
            }

            if (string.IsNullOrEmpty(_options.ApiKey) || _options.ApiKey.Length < MobileSyncOptions.MinimumApiKeyLength)
            {
                _logger.LogError("Mobile sync is enabled but MobileSync:ApiKey is missing or shorter than {Length} characters.", MobileSyncOptions.MinimumApiKeyLength);
                context.Result = Error(StatusCodes.Status503ServiceUnavailable, "sync_not_configured", "Mobile sync is not configured on this server.");
                return;
            }

            if (!KeyMatches(context.HttpContext.Request.Headers[KeyHeader].ToString(), _options.ApiKey))
            {
                context.Result = Error(StatusCodes.Status401Unauthorized, "invalid_key", "Missing or invalid mobile sync key.");
                return;
            }

            var rate = _operation == MobileSyncOperation.Status ? _limiter.StatusRate : _limiter.DataRate;
            using var rateLease = rate.AttemptAcquire();
            if (!rateLease.IsAcquired)
            {
                context.HttpContext.Response.Headers.RetryAfter = "60";
                context.Result = Error(StatusCodes.Status429TooManyRequests, "rate_limited", "Too many mobile sync requests; try again later.");
                return;
            }

            if (_operation == MobileSyncOperation.Status)
            {
                await next();
                return;
            }

            using var concurrencyLease = _limiter.DataConcurrency.AttemptAcquire();
            if (!concurrencyLease.IsAcquired)
            {
                context.HttpContext.Response.Headers.RetryAfter = "5";
                context.Result = Error(StatusCodes.Status429TooManyRequests, "busy", "The server is busy with other sync requests; try again shortly.");
                return;
            }

            await next();
        }

        private static bool KeyMatches(string supplied, string expected)
        {
            // Compare fixed-length hashes so timing reveals neither content nor length.
            var a = SHA256.HashData(Encoding.UTF8.GetBytes(supplied ?? string.Empty));
            var b = SHA256.HashData(Encoding.UTF8.GetBytes(expected));
            return CryptographicOperations.FixedTimeEquals(a, b);
        }

        internal static ObjectResult Error(int status, string code, string message) =>
            new ObjectResult(new MobileSyncError { Code = code, Message = message }) { StatusCode = status };
    }

    /// <summary>
    /// Marks a write endpoint whose changes can alter mobile-visible data. The mobile manifest is
    /// treated as changing while the action runs and is rebuilt on the next request afterwards.
    /// </summary>
    [AttributeUsage(AttributeTargets.Method)]
    public sealed class InvalidatesMobileSyncAttribute : Attribute, IAsyncActionFilter
    {
        /// <inheritdoc/>
        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var cache = context.HttpContext.RequestServices.GetService(typeof(MobileSyncRevisionCache)) as MobileSyncRevisionCache;
            cache?.BeginWrite();
            try
            {
                await next();
            }
            finally
            {
                cache?.EndWrite();
            }
        }
    }

    /// <summary>
    /// Service registration for mobile sync.
    /// </summary>
    public static class MobileSyncServiceCollectionExtensions
    {
        /// <summary>
        /// Register mobile sync options, limiter, and revision cache.
        /// </summary>
        public static IServiceCollection AddMobileSync(this IServiceCollection services, IConfiguration configuration)
        {
            services.Configure<MobileSyncOptions>(configuration.GetSection(MobileSyncOptions.SectionName));
            services.AddSingleton<MobileSyncLimiter>();
            services.AddSingleton<MobileSyncRevisionCache>();
            return services;
        }
    }
}
