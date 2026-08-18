//-----------------------------------------------------------------------
// Source File:  "BaseController.cs"
// Create Date:  02/02/2022 12:33:00 PM
// Last Updated: 08/18/2026 13:45:00 PM
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
using System;
using KioskApi.Data;
using KioskApi.Domain.Models.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace KioskApi.Controllers
{
    /// <summary>
    /// Represents the base controller for the API.
    /// </summary>
    public class BaseController : Controller
    {
        #region Fields
        /// <summary>
        /// Gets or sets the user manager.
        /// </summary>
        protected UserManager<ApplicationUser> _userManager;

        /// <summary>
        /// Gets or sets the role manager.
        /// </summary>
        protected RoleManager<IdentityRole<Guid>> _roleManager;
        #endregion

        #region Properties
        /// <summary>
        /// Gets or sets the KIOSK context.
        /// </summary>
        protected internal KIOSKContext _context;

        /// <summary>
        /// Gets or sets the connection string.
        /// </summary>
        protected internal string _connectionString;

        /// <summary>
        /// Gets or sets the path to the photos directory.
        /// </summary>
        protected internal string _photosPath;
        #endregion

        #region Constructors
        /// <summary>
        /// Constructor.
        /// </summary>
        /// <param name="configuration"></param>
        public BaseController(IConfiguration configuration)
        {
            _connectionString = configuration["ConnectionStrings:ConnStr"];
            _photosPath = configuration["AppSettings:photosPath"];
            _context = new KIOSKContext(_connectionString);
        }

        /// <summary>
        /// Constructor.
        /// </summary>
        /// <param name="configuration"></param>
        /// <param name="roleManager"></param>
        /// <param name="userManager"></param>
        public BaseController(
            IConfiguration configuration, 
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole<Guid>> roleManager)
        {
            _connectionString = configuration["ConnectionStrings:ConnStr"];
            _photosPath = configuration["AppSettings:photosPath"];
            _context = new KIOSKContext(_connectionString);
            _userManager = userManager;
            _roleManager = roleManager;
        }
        #endregion

        #region Methods

        /// <summary>
        /// Determines if the caller is an Admin or the owner of the record being changed.
        /// </summary>
        /// <param name="userId">The user id Guid string on the record</param>
        /// <returns></returns>
        protected internal virtual bool IsAdminOrOwner(Guid userId)
        {            
            var user = GetAuthenticatedUser();
            if (user == null)
                return false;

            var roles = _userManager.GetRolesAsync(user).Result;

            if (!roles.Contains("Admin"))
                if (userId != user.Id)
                    return false;

            return true;
        }

        /// <summary>
        /// Gets the <see cref="ApplicationUser"/> executing the request.
        /// </summary>
        /// <returns></returns>
        protected internal virtual ApplicationUser GetAuthenticatedUser()
        {
            ApplicationUser user = null;
            var userName = HttpContext.User.Identity.Name?.ToString();
            if (!string.IsNullOrEmpty(userName))
                user = _userManager.FindByNameAsync(userName).Result;

            return user;
        }

        /// <summary>
        /// Gets the path to the photos directory for a single recipe.
        /// </summary>
        /// <param name="recId">The recipe ID.</param>
        /// <param name="path">Out. The calculated path to the photos for the recipe.</param>
        /// <returns>A boolean indicating whether the path was found.</returns>
        protected internal virtual bool GetFullPhotosPath(int recId, out string path)
        {
            path = string.Empty;
            if (string.IsNullOrEmpty(_photosPath))
                return false;            

            // _photosPath is the root path to the photos directory. 
            // The format will be: {_photosPath}/{recId} - {RecipeName}
            // Search for the directory that starts with 'recId -' and return that path, or the first match.            
            string[] dirs = System.IO.Directory.GetDirectories(_photosPath, $"{recId} *");
            if (dirs.Length == 0)
                return false;            

            path = dirs[0];
            return true;
        }
        

        #endregion
    }
}
