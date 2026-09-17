//-----------------------------------------------------------------------
// Source File:  "ApplicationUser.cs"
// Create Date:  01/31/2022 12:33:00 PM
// Last Updated: 01/31/2022 12:33:00 PM
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
namespace KioskApi.Domain.Models.Auth
{
    using System;
    using Microsoft.AspNetCore.Identity;

    /// <summary>
    /// Identity user extension
    /// </summary>
    public class ApplicationUser : IdentityUser<Guid>
    {
    }
}
