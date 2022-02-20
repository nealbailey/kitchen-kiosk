//-----------------------------------------------------------------------
// Source File:  "BaseController.cs"
// Create Date:  02/02/2022 12:33:00 PM
// Last Updated: 02/02/2022 12:33:00 PM
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
using KioskApi.Data;
using KioskApi.Domain.Models.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace KioskApi.Controllers
{
    /// <summary>
    /// 
    /// </summary>
    public class BaseController : Controller
    {
        #region Fields
        protected UserManager<ApplicationUser> _userManager;
        protected RoleManager<IdentityRole> _roleManager;
        #endregion

        #region Properties
        protected internal KIOSKContext _context;
        protected internal string _connectionString;
        #endregion

        #region Constructors
        /// <summary>
        /// Constructor.
        /// </summary>
        /// <param name="configuration"></param>
        public BaseController(IConfiguration configuration)
        {
            _connectionString = configuration["ConnectionStrings:ConnStr"];
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
            RoleManager<IdentityRole> roleManager)
        {
            _connectionString = configuration["ConnectionStrings:ConnStr"];
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
        protected internal virtual bool IsAdminOrOwner(string userId)
        {
            var userName = HttpContext.User.Identity.Name.ToString();
            var user = _userManager.FindByNameAsync(userName).Result;
            var roles = _userManager.GetRolesAsync(user).Result;

            if (!roles.Contains("Admin"))
                if (userId != user.Id)
                    return false;
            
            return true;
        }

        #endregion
    }
}
