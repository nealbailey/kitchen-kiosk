namespace Kiosk.Data.Repository
{
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
        #endregion 
    }
}
