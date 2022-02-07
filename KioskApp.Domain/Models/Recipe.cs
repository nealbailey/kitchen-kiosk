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
        public Guid Useruid { get; set; }
        public DateTime Date { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Instructions { get; set; }

        public virtual RecipeCategory PrimaryCategory { get; set; }

        [NotMapped]
        public virtual List<RecipeCategory> Categories { get; set; }
        
        [NotMapped]
        public virtual List<RecipeIngredient> Ingredients { get; set; }
    }
}
