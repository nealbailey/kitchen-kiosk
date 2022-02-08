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
        public virtual bool IncludeIngredients { get; set; } = false;
        public virtual bool IncludeCategories { get; set; } = false;
        public virtual bool IncludeOwner { get; set; } = false;
        public virtual bool IncludePrimaryCategory { get; set; } = false;
        public virtual int CategoryId { get; set; } = 0;
        public virtual string UserUid { get; set; } = string.Empty;
        public RecipeSortColumn SortColumn = RecipeSortColumn.Title;
        #endregion 
    }
}
