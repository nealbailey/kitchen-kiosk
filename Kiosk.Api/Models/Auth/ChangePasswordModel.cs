//-----------------------------------------------------------------------
// Source File:  "ChangePasswordModel.cs"
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
namespace KioskApi.Domain.Models.Auth
{
    using System.ComponentModel.DataAnnotations;
    /// <summary>
    /// Model for changing a user's password.
    /// </summary>
    public class ChangePasswordModel
    {
        /// <summary>
        /// The username of the user whose password is being changed.
        /// </summary>
        [Required(ErrorMessage = "User Name is required")]
        public string Username { get; set; }

        /// <summary>
        /// The current password of the user.
        /// </summary>
        [Required(ErrorMessage = "Current Password is required")]
        public string CurrentPassword { get; set; }

        /// <summary>
        /// The new password that the user wants to set.
        /// </summary>
        [Required(ErrorMessage = "New Password is required")]
        public string NewPassword { get; set; }
    }
}