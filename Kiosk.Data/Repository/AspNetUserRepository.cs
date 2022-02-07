//-----------------------------------------------------------------------
// Source File:  "AspNetUserRepository.cs"
// Create Date:  02/07/2022 11:16:00 PM
// Last Updated: 02/07/2022 11:16:00 PM
// Authors(s):   Neal Bailey <nealbailey@hotmail.com>
//-----------------------------------------------------------------------
// COMMERCIAL USE RIGHTS - PROHIBITED PUBLIC DISTRIBUTION
// Intellectual Property Rights Holder: FocusIT, inc
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
using KioskApi.Domain.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Kiosk.Data.Repository
{
    /// <summary>
    /// Repository for users
    /// </summary>
    public class AspNetUserRepository : BaseRepository, IAspNetUserRepository
    {
        #region Constructors
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="logger"></param>
        /// <param name="dbContext"></param>
        public AspNetUserRepository(ILogger<IAspNetUserRepository> logger, KIOSKContext dbContext)
        {
            _logger = logger;
            _context = dbContext;
        }
        #endregion

        #region Methods
        /// <summary>
        /// Get user by id.
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        public Task<AspNetUser> GetById(string userId)
        {
            var user = _context.AspNetUsers.Where(p => p.Id.Equals(userId)).SingleOrDefaultAsync().Result;
            return Task.Run(() => user);
        }
        #endregion
    }
}
