using System;
using System.Collections.Generic;

#nullable disable

namespace KioskApi.Domain.Models
{
    public partial class RecipeIngredient
    {
        public string Ingredient { get; set; }
        public int RecId { get; set; }

        public override string ToString()
        {
            return Ingredient ?? base.ToString();
        }
    }
}
