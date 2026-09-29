//-----------------------------------------------------------------------
// Source File:  "AuthenticateController.cs"
// Create Date:  01/31/2022 12:33:00 PM
// Last Updated: 09/26/2026 10:19:00 PM
// Authors(s):   Neal Bailey <nealbailey@hotmail.com>
//-----------------------------------------------------------------------
// COMMERCIAL USE RIGHTS - PROHIBITED PUBLIC DISTRIBUTION
// Intellectual Property Rights Holder: Neal Bailey
// Software Rights Holder: Baileysoft Solutions
//-----------------------------------------------------------------------
// The licensee's rights to use, modify, reproduce, release, perform,
// display, or disclose this technical data/computer software are
// restricted by US patent copyright protections. any reproduction
// of this technical data/computer software or portions thereof marked
// with this legend must also reproduce the all original markings.
//-----------------------------------------------------------------------
// Copyright (c) 2012-2022 Baileysoft Solutions.
//----------------------------------------------------------------------- 
namespace KioskApi.Controllers
{
    using Kiosk.Data.Repository;
    using KioskApi.Domain.Models;
    using KioskApi.Domain.Models.Auth;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Configuration;
    using Microsoft.IdentityModel.Tokens;
    using System;
    using System.Collections.Generic;
    using System.IdentityModel.Tokens.Jwt;
    using System.Linq;
    using System.Security.Claims;
    using System.Text;
    using System.Threading.Tasks;

    /// <summary>
    /// Controller for authenticating users
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class AuthenticateController : BaseController
    {
        #region Fields
        private readonly UserManager<ApplicationUser> userManager;
        private readonly RoleManager<IdentityRole<Guid>> roleManager;
        private readonly IAspNetUserRepository userRepository;
        private readonly IConfiguration _configuration;
        #endregion

        #region Constructors

        /// <summary>
        /// Constructors
        /// </summary>
        /// <param name="userManager">The user manager for managing application users.</param>
        /// <param name="roleManager">The role manager for managing application roles.</param>
        /// <param name="aspNetUserRepository">The repository for managing users.</param>        
        /// <param name="configuration">The application configuration.</param>
        public AuthenticateController(
            UserManager<ApplicationUser> userManager, 
            RoleManager<IdentityRole<Guid>> roleManager,
            IAspNetUserRepository aspNetUserRepository,
            IConfiguration configuration) : base(configuration)
        {
            this.userManager = userManager;
            this.roleManager = roleManager;
            this.userRepository = aspNetUserRepository;
            _configuration = configuration;
        }

        #endregion

        #region Action Endpoints

        /// <summary>
        /// Change the password for the currently logged-in user.
        /// </summary>
        /// <param name="model">The <see cref="ChangePasswordModel"/> containing the current and new passwords.</param>
        /// <returns>An <see cref="IActionResult"/> indicating the result of the password change operation.</returns>
        [Authorize]
        [HttpPost]
        [Route("changePassword")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordModel model)
        {
            // Only logged in users can change their own password.
            if (!User.Identity.IsAuthenticated)
                return StatusCode(StatusCodes.Status401Unauthorized, new Response { Status = "Error", Message = "User must be logged in to change password." });

            var loggedInUserName = User.Identity.Name;
            var user = await userManager.FindByNameAsync(loggedInUserName);
            if (user == null)
                return StatusCode(StatusCodes.Status404NotFound, new Response { Status = "Error", Message = $"User '{loggedInUserName}' not found." });

            var result = await userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);
            if (!result.Succeeded)
            {
                // get the errors from the result
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new Response { 
                        Status = "Error", 
                        Message = $"Password change failed for user '{loggedInUserName}'. Errors: {errors}" });
            }

            return Ok(new Response { Status = "Success", Message = $"Password changed successfully for user '{model.Username}'." });
        }

        /// <summary>
        /// Delete a user 
        /// </summary>
        /// <param name="model">The <see cref="DeleteModel"/> to remove.</param>
        /// <returns></returns>
        [Authorize(Roles = UserRoles.Admin)]
        [HttpDelete]
        [Route("delete")]
        public async Task<IActionResult> Delete([FromBody] DeleteModel model)
        {
            var user = await userManager.FindByNameAsync(model.Username);
            if (user != null)
            {
                // Do not allow user to be deleted if they have associated recipes
                var hasAssociatedRecipes = await userRepository.UserHasRecipesAsync(user.Id); // Replace with actual check for associated recipes
                if (hasAssociatedRecipes)
                    return StatusCode(StatusCodes.Status400BadRequest, 
                        new Response { Status = "Error", Message = $"User '{user.UserName}' cannot be deleted because they have associated recipes." });

                var result = await userManager.DeleteAsync(user);
                if (!result.Succeeded)
                    return StatusCode(StatusCodes.Status500InternalServerError, 
                        new Response { Status = "Error", Message = "User delete " + result.ToString() });
            }           
            return Ok(new Response { Status = "Success", Message = "User deleted successfully!" });
        }

        /// <summary>
        /// Login endpoint
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            var isAdmin = false;
            var user = await userManager.FindByNameAsync(model.Username);
            
            if (user != null && await userManager.CheckPasswordAsync(user, model.Password))
            {
                var userRoles = await userManager.GetRolesAsync(user);

                var authClaims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, user.UserName),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                };

                foreach (var userRole in userRoles)
                {
                    authClaims.Add(new Claim(ClaimTypes.Role, userRole));
                    if (userRole == UserRoles.Admin)
                        isAdmin = true;
                }

                var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:Secret"]));

                var token = new JwtSecurityToken(
                    issuer: _configuration["JWT:ValidIssuer"],
                    audience: _configuration["JWT:ValidAudience"],
                    expires: DateTime.Now.AddHours(3),
                    claims: authClaims,
                    signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
                    );

                return Ok(new
                {
                    token = new JwtSecurityTokenHandler().WriteToken(token),
                    expiration = token.ValidTo,
                    id = user.Id,
                    isAdmin = isAdmin
                }); 
            }
            return Unauthorized();
        }

        /// <summary>
        /// Create a new user endpoint
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [Authorize(Roles = UserRoles.Admin)]
        [HttpPost]
        [Route("register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            var userExists = await userManager.FindByNameAsync(model.Username);
            if (userExists != null)
                return StatusCode(StatusCodes.Status500InternalServerError, new Response { Status = "Error", Message = $"User '{model.Username}' already exists!" });

            ApplicationUser user = new ApplicationUser()
            {
                Email = model.Email,
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = model.Username
            };
            var result = await userManager.CreateAsync(user, model.Password);            
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new Response { Status = "Error", Message = $"User creation failed: {errors}" });
            }

            return Ok(new Response { Status = "Success", Message = $"User '{model.Username}' created successfully!" });
        }

        /// <summary>
        /// Create a new admin user endpoint
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [Authorize(Roles = UserRoles.Admin)]
        [HttpPost]
        [Route("registerAdmin")]
        public async Task<IActionResult> RegisterAdmin([FromBody] RegisterModel model)
        {
            var userExists = await userManager.FindByNameAsync(model.Username);
            if (userExists != null)
                return StatusCode(StatusCodes.Status500InternalServerError, new Response { Status = "Error", Message = $"User '{model.Username}' already exists!" });

            ApplicationUser user = new ApplicationUser()
            {
                Email = model.Email,
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = model.Username
            };
            var result = await userManager.CreateAsync(user, model.Password);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new Response { Status = "Error", Message = $"User '{model.Username}' creation failed: {errors}" });
            }

            if (!await roleManager.RoleExistsAsync(UserRoles.Admin))
                await roleManager.CreateAsync(new IdentityRole<Guid> { Name = UserRoles.Admin });
            if (!await roleManager.RoleExistsAsync(UserRoles.User))
                await roleManager.CreateAsync(new IdentityRole<Guid> { Name = UserRoles.User });

            if (await roleManager.RoleExistsAsync(UserRoles.Admin))
            {
                await userManager.AddToRoleAsync(user, UserRoles.Admin);
            }

            return Ok(new Response { Status = "Success", Message = $"User [Administrator] '{model.Username}' created successfully!" });
        }

        #endregion
    }

    
}

