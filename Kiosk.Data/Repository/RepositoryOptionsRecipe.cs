//-----------------------------------------------------------------------
// Source File:  "RepositoryOptionsRecipe.cs"
// Create Date:  02/02/2022 12:33:00 PM
// Last Updated: 03/24/2022 11:27:00 AM
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
    /// The repository sort column
    /// </summary>
    public enum RecipeSortColumn
    {
        /// <summary>
        /// Date
        /// </summary>
        Date,
        /// <summary>
        /// Title
        /// </summary>
        Title
    }

    /// <summary>
    /// Options specific to Recipe Repository
    /// </summary>
    public class RepositoryOptionsRecipe : RepositoryOptions
    {
        #region Properties
        public virtual bool FavoritesOnly { get; set; } = false;
        public virtual bool IncludeIngredients { get; set; } = false;
        public virtual bool IncludeCategories { get; set; } = false;
        public virtual bool IncludeFavoriteFlag { get; set; } = false;
        public virtual bool IncludeRecommendedFlag { get; set; } = false;
        public virtual bool IncludeOwner { get; set; } = false;
        public virtual bool IncludeUser { get; set; } = true;
        public virtual bool IncludePrimaryCategory { get; set; } = false;
        public virtual int CategoryId { get; set; } = 0;
        public virtual System.Guid? UserUid { get; set; } = null;
        public RecipeSortColumn SortColumn = RecipeSortColumn.Title;
        #endregion 
    }
}
