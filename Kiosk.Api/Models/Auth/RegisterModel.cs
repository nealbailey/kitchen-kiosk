//-----------------------------------------------------------------------
// Source File:  "RegisterModel.cs"
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
    using System.ComponentModel.DataAnnotations;

    /// <summary>
    /// Model for creating new users
    /// </summary>
    public class RegisterModel
    {
        #region Properties

        /// <summary>
        /// Gets or sets the username.
        /// </summary>  
        [Required(ErrorMessage = "User Name is required")]
        public string Username { get; set; }

        /// <summary>
        /// Gets or sets the email.
        /// </summary>
        [EmailAddress]
        [Required(ErrorMessage = "Email is required")]
        public string Email { get; set; }

        /// <summary>
        /// Gets or sets the password.
        /// </summary>
        [Required(ErrorMessage = "Password is required")]
        public string Password { get; set; }

        #endregion
    }
}
