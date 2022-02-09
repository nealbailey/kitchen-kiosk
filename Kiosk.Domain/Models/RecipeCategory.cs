using System;
using System.Collections.Generic;

#nullable disable

namespace KioskApi.Domain.Models
{
    public partial class RecipeCategory : ICloneable
    {
        public RecipeCategory()
        {
            Recipes = new HashSet<Recipe>();
        }

        public int CatId { get; set; }
        public string Category { get; set; }
        public int? Total { get; set; }

        public virtual ICollection<Recipe> Recipes { get; set; }

        public object Clone()
        {
            return new RecipeCategory() { 
                Category = this.Category, 
                CatId = this.CatId };
        }
    }
}
