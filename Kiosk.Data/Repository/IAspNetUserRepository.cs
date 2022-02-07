//-----------------------------------------------------------------------
// Source File:  "IAspNetUserRepository.cs"
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
namespace Kiosk.Data.Repository
{
    using KioskApi.Domain.Models;
    using System.Threading.Tasks;

    public interface IAspNetUserRepository
    {
        /// <summary>
        /// Get user by id.
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        public Task<AspNetUser> GetById(string userId);
    }
}
