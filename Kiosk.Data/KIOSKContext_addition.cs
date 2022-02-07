//-----------------------------------------------------------------------
// Source File:  "KIOSKContext_addition.cs"
// Create Date:  02/02/2022 12:33:00 PM
// Last Updated: 02/02/2022 12:33:00 PM
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
#nullable disable

namespace KioskApi.Data
{
    using Microsoft.EntityFrameworkCore;

    /// <summary>
    /// Database context
    /// </summary>
    public partial class KIOSKContext : DbContext
    {
        #region Fields
        private string _connectionString;
        #endregion

        #region Constructors
        /// <summary>
        /// Constructor.
        /// </summary>
        /// <param name="connectionString"></param>
        public KIOSKContext(string connectionString)
        {
            _connectionString = connectionString;
        }
        #endregion

        #region Methods
        /// <summary>
        /// 
        /// </summary>
        /// <param name="optionsBuilder"></param>
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseSqlServer(_connectionString);
            }
        }
        #endregion
    }
}
