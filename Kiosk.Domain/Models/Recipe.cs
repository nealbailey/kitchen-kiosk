using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

#nullable disable

namespace KioskApi.Domain.Models
{
    public partial class Recipe
    {
        public int RecId { get; set; }
        public int CatId { get; set; }
        public string Useruid { get; set; }
        public DateTime Date { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Instructions { get; set; }

        public virtual RecipeCategory PrimaryCategory { get; set; }
        public virtual AspNetUser Owner { get; set; }

        [NotMapped]
        public virtual List<RecipeCategory> Categories { get; set; }

        [NotMapped]
        public virtual List<RecipeIngredient> Ingredients { get; set; }

        [NotMapped]
        public virtual RecipeUser User { get; set; }

        public override string ToString()
        {
            return Title ?? base.ToString();
        }
    }
}
