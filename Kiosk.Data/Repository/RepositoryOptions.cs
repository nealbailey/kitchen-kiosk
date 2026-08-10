//-----------------------------------------------------------------------
// Source File:  "RepositoryOptions.cs"
// Create Date:  02/02/2022 12:33:00 PM
// Last Updated: 08/20/2025 11:20:00 PM
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
    /// <summary>
    /// The repository sorting order
    /// </summary>
    public enum SortOrder
    {
        /// <summary>
        /// No sorting
        /// </summary>
        None,
        /// <summary>
        /// Ascending sorting
        /// </summary>
        Ascending,
        /// <summary>
        /// Descending sorting
        /// </summary>
        Descending
    }

    /// <summary>
    /// The type of search to execute
    /// </summary>
    public enum SearchStringType
    {
        /// <summary>
        /// No search string
        /// </summary>
        None,
        /// <summary>
        /// Search by ingredient name
        /// </summary>
        IngredientName,
        /// <summary>
        /// Search by recipe name/title
        /// </summary>
        RecipeName
    }

    /// <summary>
    /// Global repository configuration
    /// </summary>
    public class RepositoryOptions
    {
        #region Properties

        /// <summary>
        /// The current page number
        /// </summary>
        public virtual int PageNumber { get; set; } = 1;

        /// <summary>
        /// The records per page
        /// </summary>
        public virtual int PageSize { get; set; } = 25;

        /// <summary>
        /// The applied filter
        /// </summary>
        public virtual string SearchString { get; set; } = string.Empty;

        /// <summary>
        /// The type of search to execute
        /// </summary>
        public virtual SearchStringType SearchType { get; set; } = SearchStringType.None;

        /// <summary>
        /// The sort direction
        /// </summary>
        public virtual SortOrder SortOrder { get; set; } = SortOrder.None;

        #endregion        
    }
}
