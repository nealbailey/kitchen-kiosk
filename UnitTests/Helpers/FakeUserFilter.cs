using Microsoft.AspNetCore.Mvc.Filters;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace UnitTests.Helpers
{
    /// <summary>
    /// Intercept the ActionFilter for async actions to inject a fake claim
    /// </summary>
    public class FakeUserFilter : IAsyncActionFilter
    {
        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            context.HttpContext.User = new ClaimsPrincipal(new ClaimsIdentity(new List<Claim> {
                new Claim(ClaimTypes.NameIdentifier, "test"),
                new Claim(ClaimTypes.Name, "test"),
                new Claim(ClaimTypes.Email, "test@gmail.com"),
                new Claim(ClaimTypes.Role, "Admin")
            }));
            await next();
        }
    }
}
